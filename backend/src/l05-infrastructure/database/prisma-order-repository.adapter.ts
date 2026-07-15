import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IOrderRepository } from '../../l04-domain/ports/order-repository.interface';
import { BLOCKED_PRODUCT_IMAGE_URLS } from '../../l04-domain/products/image-url-policy';

const orderProductImages = {
  where: {
    activa: true,
    url: { notIn: BLOCKED_PRODUCT_IMAGE_URLS },
  },
  orderBy: { orden: 'asc' as const },
  take: 1,
};

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrderFromCart(
    userId: string,
    cart: any,
    direccionId: string,
    cupon: any | null,
    total: number,
    numeroConfirmacion: string,
  ): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      // Create Order
      const orden = await tx.orden.create({
        data: {
          compradorId: userId,
          direccionId: direccionId,
          total: total,
          numeroConfirmacion: numeroConfirmacion,
          estado: 'PENDIENTE',
        },
      });

      if (cupon) {
        await tx.cupon.update({
          where: { id: cupon.id },
          data: { usos: { increment: 1 } },
        });
      }

      // Create Order Lines and Decrement Inventory
      for (const item of cart.items) {
        const pub = item.publicacion;
        
        await tx.lineaOrden.create({
          data: {
            ordenId: orden.id,
            publicacionId: pub.id,
            nombreProducto: pub.nombre,
            precioUnitario: pub.precio,
            cantidad: item.cantidad,
            subtotal: Number(pub.precio) * item.cantidad,
          },
        });

        await tx.inventario.update({
          where: { publicacionId: pub.id },
          data: {
            cantidadReservada: {
              increment: item.cantidad,
            },
          },
        });
      }

      // Empty Cart
      await tx.itemCarrito.deleteMany({
        where: { carritoId: cart.id },
      });

      return orden;
    });
  }

  async findCuponByCodigo(codigo: string): Promise<any | null> {
    return this.prisma.cupon.findUnique({ where: { codigo } });
  }

  async incrementCuponUsos(cuponId: string): Promise<any> {
    return this.prisma.cupon.update({
      where: { id: cuponId },
      data: { usos: { increment: 1 } },
    });
  }

  async findMyOrders(userId: string): Promise<any[]> {
    return this.prisma.orden.findMany({
      where: { compradorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        lineas: {
          include: { publicacion: { include: { imagenes: orderProductImages } } },
        },
        pago: true,
      },
    });
  }

  async findOrderById(userId: string, orderId: string): Promise<any | null> {
    return this.prisma.orden.findFirst({
      where: { id: orderId, compradorId: userId },
      include: {
        lineas: {
          include: { publicacion: { include: { imagenes: orderProductImages } } },
        },
        pago: true,
        direccion: true,
      },
    });
  }

  async findVendorOrders(vendorId: string): Promise<any[]> {
    return this.prisma.orden.findMany({
      where: {
        lineas: {
          some: {
            publicacion: {
              vendedorId: vendorId,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        lineas: {
          include: { publicacion: { include: { imagenes: orderProductImages } } },
        },
        comprador: {
          select: { nombre: true, email: true, telefono: true },
        },
        direccion: true,
      },
    });
  }

  async updateOrderStatus(orderId: string, newStatus: string): Promise<any> {
    return this.prisma.orden.update({
      where: { id: orderId },
      data: { estado: newStatus as any },
    });
  }

  async findFirstOrder(orderId: string, vendorId: string): Promise<any | null> {
    return this.prisma.orden.findFirst({
      where: {
        id: orderId,
        lineas: { some: { publicacion: { vendedorId: vendorId } } },
      },
    });
  }

  async findFirstOrderContainingProduct(compradorId: string, publicacionId: string): Promise<any | null> {
    return this.prisma.orden.findFirst({
      where: {
        compradorId,
        estado: { not: 'CANCELADA' },
        lineas: {
          some: {
            publicacionId,
          },
        },
      },
    });
  }

  async escalateOldPendingOrders(twentyFourHoursAgo: Date): Promise<any[]> {
    const oldOrders = await this.prisma.orden.findMany({
      where: {
        estado: 'PENDIENTE',
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },
    });

    for (const order of oldOrders) {
      await this.prisma.orden.update({
        where: { id: order.id },
        data: { estado: 'ESCALADA' },
      });
    }

    return oldOrders;
  }
}
