import api from '../lib/axios';

export const productsApi = {
  getProducts: () => api.get('/products'),
  getVendorProducts: () => api.get('/products/vendor/me'),
  getVendorProductById: (id: string) => api.get(`/products/vendor/me/${id}`),
  getProductById: (id: string) => api.get(`/products/${id}`),
  uploadProductImage: (file: File, productId?: string) => {
    const data = new FormData();
    data.append('file', file);
    if (productId) data.append('productId', productId);
    return api.post<{
      url: string;
      publicId: string;
      folder: string;
      width?: number;
      height?: number;
      format?: string;
    }>('/products/vendor/me/images', data);
  },
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: string, data: any) => api.patch(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  updateProductStatus: (id: string, estado: string) => api.patch(`/products/${id}/status`, { estado }),
};
