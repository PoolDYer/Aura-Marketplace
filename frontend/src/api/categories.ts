import api from '../lib/axios';

export const categoriesApi = {
  getCategories: () => api.get('/categories'),
  createCategory: (data: any) => api.post('/categories', data),
  updateCategory: (id: string, data: any) => api.patch(`/categories/${id}`, data),
};
