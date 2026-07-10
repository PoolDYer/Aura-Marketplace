import api from '../lib/axios';

export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  updateUserStatus: (id: string, estado: string) => api.patch(`/admin/users/${id}/status`, { estado }),
  getOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (id: string, estado: string) => api.patch(`/admin/orders/${id}/status`, { estado }),
  getProducts: () => api.get('/admin/products'),
  updateProductStatus: (id: string, estado: string) => api.patch(`/admin/products/${id}/status`, { estado }),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
};
