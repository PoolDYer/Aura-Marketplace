export interface IOrderRepository {
  createOrderFromCart(
    userId: string,
    cart: any,
    direccionId: string,
    cupon: any | null,
    total: number,
    numeroConfirmacion: string,
  ): Promise<any>;
  findCuponByCodigo(codigo: string): Promise<any | null>;
  incrementCuponUsos(cuponId: string): Promise<any>;
  findMyOrders(userId: string): Promise<any[]>;
  findOrderById(userId: string, orderId: string): Promise<any | null>;
  findVendorOrders(vendorId: string): Promise<any[]>;
  updateOrderStatus(orderId: string, newStatus: string): Promise<any>;
  findFirstOrder(orderId: string, vendorId: string): Promise<any | null>;
  findFirstOrderContainingProduct(compradorId: string, publicacionId: string): Promise<any | null>;
  escalateOldPendingOrders(twentyFourHoursAgo: Date): Promise<any[]>;
}
