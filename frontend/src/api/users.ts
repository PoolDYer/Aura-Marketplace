import api from '../lib/axios';

export const usersApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: { nombre?: string; telefono?: string }) => api.patch('/users/me', data),
  
  getAddresses: () => api.get('/users/me/addresses'),
  createAddress: (data: any) => api.post('/users/me/addresses', data),
  updateAddress: (id: string, data: any) => api.patch(`/users/me/addresses/${id}`, data),
  deactivateAddress: (id: string) => api.delete(`/users/me/addresses/${id}`),
  
  getPreferences: () => api.get('/users/me/preferences'),
  updatePreferences: (data: any) => api.patch('/users/me/preferences', data),
};
