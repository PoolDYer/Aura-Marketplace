import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../l05-infrastructure/database/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, direccionId: string, cuponCodigo?: string) {
    const cart = await this.prisma.carrito.findUnique({
      where: { compradorId: userId },
      include: {
        items: {
          include: {
            publicacion: {
              include: { inventario: true, vendedor: true }
            }
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const direccion = await this.prisma.direccion.findFirst({
      where: { id: direccionId, usuarioId: userId }
    });

    if (!direccion) {
      throw new NotFoundException('Dirección no encontrada');
    }

    // Verify stock
    let total = 0;
    for (const item of cart.items) {
      const pub = item.publicacion;
      if (pub.estado !== 'ACTIVA') {
        throw new BadRequestException(`El producto ${pub.nombre} no está disponible`);
      }
      const availableStock = pub.inventario ? (pub.inventario.cantidad - pub.inventario.cantidadReservada) : 0;
      if (item.cantidad > availableStock) {
        throw new BadRequestException(`Stock insuficiente para ${pub.nombre}. Disponible: ${availableStock}`);
      }
      total += Number(pub.precio) * item.cantidad;
    }

    let cuponAplicado = null;
    if (cuponCodigo) {
      const cupon = await this.prisma.cupon.findUnique({ where: { codigo: cuponCodigo } });
      if (!cupon) throw new NotFoundException('Cupón no encontrado');
      if (cupon.vigenciaHasta < new Date()) throw new BadRequestException('El cupón ha expirado');
      if (cupon.usos >= cupon.usosMaximos) throw new BadRequestException('El cupón ha superado su límite de usos');

      cuponAplicado = cupon;
      const descuento = Number(cupon.descuento);
      if (cupon.tipo === 'PORCENTAJE') {
        total = total - (total * (descuento / 100));
      } else {
        total = total - descuento;
      }
      if (total < 0) total = 0;
    }

    // Generate unique order number
    const numeroConfirmacion = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Transaction
    return this.prisma.$transaction(async (tx) => {
      // Create Order
      const orden = await tx.orden.create({
        data: {
          compradorId: userId,
          direccionId: direccionId,
          total: total,
          numeroConfirmacion: numeroConfirmacion,
          estado: 'PENDIENTE',
        }
      });

      if (cuponAplicado) {
        await tx.cupon.update({
          where: { id: cuponAplicado.id },
          data: { usos: { increment: 1 } }
        });
      }

      // Create Order Lines and Decrement Inventory
      const vendorsNotified = new Set<string>();

      for (const item of cart.items) {
        const pub = item.publicacion;
        
        await tx.lineaOrden.create({
          data: {
            ordenId: orden.id,
            publicacionId: pub.id,
            nombreProducto: pub.nombre,
            precioUnitario: pub.precio,
            cantidad: item.cantidad,
            subtotal: Number(pub.precio) * item.cantidad
          }
        });

        await tx.inventario.update({
          where: { publicacionId: pub.id },
          data: {
            cantidadReservada: {
              increment: item.cantidad
            }
          }
        });

        // Basic Notification to Vendor (Simulated)
        if (!vendorsNotified.has(pub.vendedorId)) {
          this.logger.log(`[NOTIFICACIÓN] Vendedor ${pub.vendedorId}: Tienes una nueva orden de compra parcial o total de la orden ${orden.numeroConfirmacion}.`);
          vendorsNotified.add(pub.vendedorId);
        }
      }

      // Basic Notification to Buyer (Simulated)
      this.logger.log(`[NOTIFICACIÓN] Comprador ${userId}: Tu orden ${orden.numeroConfirmacion} ha sido registrada y está pendiente de pago.`);

      // Empty Cart
      await tx.itemCarrito.deleteMany({
        where: { carritoId: cart.id }
      });

      return orden;
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCronEscalateOrders() {
    this.logger.log('Cron Job: Verificando órdenes PENDIENTES > 24h para escalamiento (RN-07)');
    
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const oldOrders = await this.prisma.orden.findMany({
      where: {
        estado: 'PENDIENTE',
        createdAt: {
          lt: twentyFourHoursAgo
        }
      }
    });

    for (const order of oldOrders) {
      await this.prisma.orden.update({
        where: { id: order.id },
        data: { estado: 'ESCALADA' }
      });
      this.logger.log(`Orden ${order.id} escalada automáticamente (sin atención por 24h).`);
    }
  }

  async getMyOrders(userId: string) {
    return this.prisma.orden.findMany({
      where: { compradorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        lineas: {
          include: { publicacion: { include: { imagenes: { take: 1 } } } }
        },
        pago: true
      }
    });
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.prisma.orden.findFirst({
      where: { id: orderId, compradorId: userId },
      include: {
        lineas: {
          include: { publicacion: { include: { imagenes: { take: 1 } } } }
        },
        pago: true,
        direccion: true
      }
    });

    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  // VENDOR ENDPOINTS
  async getVendorOrders(vendorId: string) {
    return this.prisma.orden.findMany({
      where: {
        lineas: {
          some: {
            publicacion: {
              vendedorId: vendorId
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        lineas: {
          include: { publicacion: { include: { imagenes: { take: 1 } } } }
        },
        comprador: {
          select: { nombre: true, email: true, telefono: true }
        },
        direccion: true
      }
    });
  }

  async updateOrderStatus(vendorId: string, orderId: string, newStatus: any) {
    const order = await this.prisma.orden.findFirst({
      where: {
        id: orderId,
        lineas: { some: { publicacion: { vendedorId: vendorId } } }
      }
    });

    if (!order) throw new NotFoundException('Orden no encontrada o sin permiso');

    return this.prisma.orden.update({
      where: { id: orderId },
      data: { estado: newStatus }
    });
  }
}
