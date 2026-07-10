import api from '../lib/axios';

export interface CartItem {
  id: string;
  carritoId: string;
  publicacionId: string;
  cantidad: number;
  agregadoAt: string;
  publicacion: {
    id: string;
    nombre: string;
    descripcion?: string;
    precio: string;
    inventario: {
      cantidad: number;
      cantidadReservada: number;
    };
    imagenes: { url: string }[];
  };
}

export interface Cart {
  id: string;
  compradorId: string;
  updatedAt: string;
  items: CartItem[];
}

export const cartApi = {
  getCart: () => api.get<Cart>('/cart'),
  addItem: (publicacionId: string, cantidad: number) => api.post('/cart/items', { publicacionId, cantidad }),
  updateItemQuantity: (itemId: string, cantidad: number) => api.patch(`/cart/items/${itemId}`, { cantidad }),
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
};
