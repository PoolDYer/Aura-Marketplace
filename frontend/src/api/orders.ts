import api from '../lib/axios';

export interface OrderLine {
  id: string;
  publicacionId: string;
  nombreProducto: string;
  precioUnitario: string;
  cantidad: number;
  subtotal: string;
  publicacion: any;
}

export interface Order {
  id: string;
  compradorId: string;
  direccionId: string;
  estado: string;
  total: string;
  numeroConfirmacion: string;
  createdAt: string;
  lineas: OrderLine[];
  pago?: {
    estado: string;
    metodoPago: string;
  };
  direccion?: any;
  comprador?: {
    nombre: string;
    email: string;
    telefono?: string | null;
  };
}

export const ordersApi = {
  createOrder: (direccionId: string, cuponCodigo?: string) => api.post<{id: string}>('/orders', { direccionId, cuponCodigo }),
  getMyOrders: () => api.get<Order[]>('/orders'),
  getOrderById: (orderId: string) => api.get<Order>(`/orders/${orderId}`),
  
  // Vendor
  getVendorOrders: () => api.get<Order[]>('/vendors/me/orders'),
  updateOrderStatus: (orderId: string, estado: string) => api.patch(`/vendors/me/orders/${orderId}/status`, { estado }),

  // Payments
  createCheckoutPreference: (orderId: string) => api.post<{preferenceId: string, url: string}>(`/payments/checkout/${orderId}`),
  createBrickInitialization: (orderId: string) => api.post<{
    preferenceId: string;
    amount: number;
    currency: string;
    payer: { email: string; firstName?: string };
  }>(`/payments/brick/${orderId}`),
  processBrickPayment: (orderId: string, data: any) => api.post<{
    success: boolean;
    status: string;
    orderId: string;
    paymentId?: string;
    statusDetail?: string;
    paymentMethod?: string;
  }>(`/payments/process/${orderId}`, data),
  verifyPayment: (paymentId: string, orderId?: string) => api.get<{ success: boolean; status: string; orderId?: string }>(
    `/payments/verify?payment_id=${paymentId}${orderId ? `&order_id=${orderId}` : ''}`
  ),
};
