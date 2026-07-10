import { create } from 'zustand';
import { cartApi, Cart } from '../api/cart';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  isCartOpen: boolean;
  lastAddedPublicacionId: string | null;
  lastAddedAt: number | null;
  lastAddedPreview: {
    publicacionId: string;
    nombre: string;
    precio: string | number;
    imageUrl?: string;
    stock?: number;
    cantidad: number;
  } | null;
  fetchCart: () => Promise<void>;
  addItem: (
    publicacionId: string,
    cantidad: number,
    preview?: {
      nombre: string;
      precio: string | number;
      imageUrl?: string;
      stock?: number;
    },
  ) => Promise<void>;
  updateQuantity: (itemId: string, cantidad: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setCartOpen: (isOpen: boolean) => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,
  isCartOpen: false,
  lastAddedPublicacionId: null,
  lastAddedAt: null,
  lastAddedPreview: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.getCart();
      set({ cart: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar carrito', isLoading: false });
    }
  },

  addItem: async (
    publicacionId: string,
    cantidad: number,
    preview?: {
      nombre: string;
      precio: string | number;
      imageUrl?: string;
      stock?: number;
    },
  ) => {
    set({
      isLoading: true,
      error: null,
      lastAddedPublicacionId: publicacionId,
      lastAddedAt: Date.now(),
      lastAddedPreview: preview
        ? {
            publicacionId,
            cantidad,
            nombre: preview.nombre,
            precio: preview.precio,
            imageUrl: preview.imageUrl,
            stock: preview.stock,
          }
        : get().lastAddedPreview,
    });
    try {
      await cartApi.addItem(publicacionId, cantidad);
      await get().fetchCart();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al agregar producto', isLoading: false });
    }
  },

  updateQuantity: async (itemId: string, cantidad: number) => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.updateItemQuantity(itemId, cantidad);
      await get().fetchCart();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar cantidad', isLoading: false });
    }
  },

  removeItem: async (itemId: string) => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.removeItem(itemId);
      await get().fetchCart();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar producto', isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.clearCart();
      await get().fetchCart();
      set({ lastAddedPublicacionId: null, lastAddedAt: null, lastAddedPreview: null });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al vaciar carrito', isLoading: false });
    }
  },

  setCartOpen: (isOpen: boolean) => {
    set({ isCartOpen: isOpen });
  },

  getCartTotal: () => {
    const { cart, lastAddedPreview, lastAddedAt } = get();
    if (cart && cart.items.length > 0) {
      return cart.items.reduce((total, item) => total + (Number(item.publicacion.precio) * item.cantidad), 0);
    }

    if (lastAddedPreview && lastAddedAt && Date.now() - lastAddedAt < 5 * 60 * 1000) {
      return Number(lastAddedPreview.precio) * lastAddedPreview.cantidad;
    }

    return 0;
  },

  getCartItemsCount: () => {
    const { cart, lastAddedPreview, lastAddedAt } = get();
    if (cart && cart.items.length > 0) {
      return cart.items.reduce((count, item) => count + item.cantidad, 0);
    }

    if (lastAddedPreview && lastAddedAt && Date.now() - lastAddedAt < 5 * 60 * 1000) {
      return lastAddedPreview.cantidad;
    }

    return 0;
  }
}));
