import { Injectable, NotFoundException, BadRequestException, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IOrderRepository } from '../../l04-domain/ports/order-repository.interface';
import { ICartRepository } from '../../l04-domain/ports/cart-repository.interface';
import { IUserRepository } from '../../l04-domain/ports/user-repository.interface';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject('IOrderRepository') private readonly orderRepo: IOrderRepository,
    @Inject('ICartRepository') private readonly cartRepo: ICartRepository,
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async createOrder(userId: string, direccionId: string, cuponCodigo?: string) {
    const cart = await this.cartRepo.findUnique(userId);

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const direccion = await this.userRepo.findAddressByIdAndUserId(direccionId, userId);
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
      const cupon = await this.orderRepo.findCuponByCodigo(cuponCodigo);
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

    const orden = await this.orderRepo.createOrderFromCart(
      userId,
      cart,
      direccionId,
      cuponAplicado,
      total,
      numeroConfirmacion,
    );

    // Basic Notification to Vendor (Simulated)
    const vendorsNotified = new Set<string>();
    for (const item of cart.items) {
      const pub = item.publicacion;
      if (!vendorsNotified.has(pub.vendedorId)) {
        this.logger.log(`[NOTIFICACIÓN] Vendedor ${pub.vendedorId}: Tienes una nueva orden de compra parcial o total de la orden ${orden.numeroConfirmacion}.`);
        vendorsNotified.add(pub.vendedorId);
      }
    }

    // Basic Notification to Buyer (Simulated)
    this.logger.log(`[NOTIFICACIÓN] Comprador ${userId}: Tu orden ${orden.numeroConfirmacion} ha sido registrada y está pendiente de pago.`);

    return orden;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCronEscalateOrders() {
    this.logger.log('Cron Job: Verificando órdenes PENDIENTES > 24h para escalamiento (RN-07)');
    
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const oldOrders = await this.orderRepo.escalateOldPendingOrders(twentyFourHoursAgo);

    for (const order of oldOrders) {
      this.logger.log(`Orden ${order.id} escalada automáticamente (sin atención por 24h).`);
    }
  }

  async getMyOrders(userId: string) {
    return this.orderRepo.findMyOrders(userId);
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.orderRepo.findOrderById(userId, orderId);

    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  // VENDOR ENDPOINTS
  async getVendorOrders(vendorId: string) {
    return this.orderRepo.findVendorOrders(vendorId);
  }

  async updateOrderStatus(vendorId: string, orderId: string, newStatus: any) {
    const order = await this.orderRepo.findFirstOrder(orderId, vendorId);

    if (!order) throw new NotFoundException('Orden no encontrada o sin permiso');

    return this.orderRepo.updateOrderStatus(orderId, newStatus);
  }
}
