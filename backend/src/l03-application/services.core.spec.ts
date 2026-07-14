import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin/admin.service';
import { CartService } from './cart/cart.service';
import { CategoriesService } from './categories/categories.service';
import { FavoritesService } from './favorites/favorites.service';
import { NotificationsService } from './notifications/notifications.service';
import { PromotionsService } from './promotions/promotions.service';
import { ReviewsService } from './reviews/reviews.service';
import { UsersService } from './users/users.service';

describe('CartService', () => {
  const createService = () => {
    const cartRepo = {
      findUnique: jest.fn(),
      create: jest.fn(),
      findItemInCart: jest.fn(),
      updateItem: jest.fn(),
      createItem: jest.fn(),
      findItemById: jest.fn(),
      deleteItem: jest.fn(),
      deleteManyItems: jest.fn(),
    };
    const productRepo = {
      findProductById: jest.fn(),
    };
    return {
      service: new CartService(cartRepo as any, productRepo as any),
      cartRepo,
      productRepo,
    };
  };

  it('creates a cart when the user does not have one', async () => {
    const { service, cartRepo } = createService();
    cartRepo.findUnique.mockResolvedValue(null);
    cartRepo.create.mockResolvedValue({ id: 'cart-1', items: [] });

    await expect(service.getCart('user-1')).resolves.toEqual({ id: 'cart-1', items: [] });
    expect(cartRepo.create).toHaveBeenCalledWith('user-1');
  });

  it('adds a new item after validating quantity, product and stock', async () => {
    const { service, cartRepo, productRepo } = createService();
    cartRepo.findUnique.mockResolvedValue({ id: 'cart-1', items: [{ cantidad: 1 }] });
    productRepo.findProductById.mockResolvedValue({
      id: 'prod-1',
      estado: 'ACTIVA',
      inventario: { cantidad: 5, cantidadReservada: 1 },
    });
    cartRepo.findItemInCart.mockResolvedValue(null);
    cartRepo.createItem.mockResolvedValue({ id: 'item-1', cantidad: 2 });

    await expect(service.addItem('user-1', 'prod-1', 2)).resolves.toEqual({ id: 'item-1', cantidad: 2 });

    productRepo.findProductById.mockResolvedValueOnce({ id: 'prod-2', estado: 'ACTIVA', inventario: null });
    cartRepo.findItemInCart.mockResolvedValueOnce(null);
    await expect(service.addItem('user-1', 'prod-2', 1)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates an existing item and enforces cart and stock limits', async () => {
    const { service, cartRepo, productRepo } = createService();
    cartRepo.findUnique.mockResolvedValue({ id: 'cart-1', items: [{ cantidad: 45 }] });
    productRepo.findProductById.mockResolvedValue({
      id: 'prod-1',
      estado: 'ACTIVA',
      inventario: { cantidad: 100, cantidadReservada: 0 },
    });
    cartRepo.findItemInCart.mockResolvedValue({ id: 'item-1', cantidad: 2 });
    cartRepo.updateItem.mockResolvedValue({ id: 'item-1', cantidad: 4 });

    await expect(service.addItem('user-1', 'prod-1', 4)).resolves.toEqual({ id: 'item-1', cantidad: 4 });
    await expect(service.addItem('user-1', 'prod-1', 6)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid item additions', async () => {
    const { service, cartRepo, productRepo } = createService();
    await expect(service.addItem('user-1', 'prod-1', 0)).rejects.toBeInstanceOf(BadRequestException);

    cartRepo.findUnique.mockResolvedValue({ id: 'cart-1', items: [] });
    productRepo.findProductById.mockResolvedValueOnce(null);
    await expect(service.addItem('user-1', 'missing', 1)).rejects.toBeInstanceOf(NotFoundException);

    productRepo.findProductById.mockResolvedValueOnce({ estado: 'BORRADOR', inventario: { cantidad: 10, cantidadReservada: 0 } });
    await expect(service.addItem('user-1', 'draft', 1)).rejects.toBeInstanceOf(BadRequestException);

    productRepo.findProductById.mockResolvedValueOnce({ estado: 'ACTIVA', inventario: { cantidad: 1, cantidadReservada: 0 } });
    cartRepo.findItemInCart.mockResolvedValueOnce(null);
    await expect(service.addItem('user-1', 'prod-1', 2)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates, removes and clears cart items with ownership checks', async () => {
    const { service, cartRepo } = createService();
    cartRepo.findUnique.mockResolvedValue({ id: 'cart-1', items: [{ id: 'item-1', cantidad: 2 }] });
    cartRepo.findItemById
      .mockResolvedValueOnce({
        id: 'item-1',
        cantidad: 2,
        publicacion: { inventario: { cantidad: 10, cantidadReservada: 1 } },
      })
      .mockResolvedValueOnce(null);
    cartRepo.updateItem.mockResolvedValue({ id: 'item-1', cantidad: 3 });
    cartRepo.deleteItem.mockResolvedValue({ id: 'item-1' });
    cartRepo.deleteManyItems.mockResolvedValue({ count: 1 });

    await expect(service.updateItemQuantity('user-1', 'item-1', 3)).resolves.toEqual({ id: 'item-1', cantidad: 3 });
    await expect(service.updateItemQuantity('user-1', 'item-1', 0)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.updateItemQuantity('user-1', 'missing', 1)).rejects.toBeInstanceOf(NotFoundException);
    cartRepo.findItemById.mockResolvedValueOnce({
      id: 'item-1',
      cantidad: 2,
      publicacion: { inventario: { cantidad: 2, cantidadReservada: 0 } },
    });
    await expect(service.updateItemQuantity('user-1', 'item-1', 3)).rejects.toBeInstanceOf(BadRequestException);
    cartRepo.findItemById.mockResolvedValueOnce({
      id: 'item-1',
      cantidad: 1,
      publicacion: { inventario: null },
    });
    await expect(service.updateItemQuantity('user-1', 'item-1', 1)).rejects.toBeInstanceOf(BadRequestException);
    cartRepo.findItemById.mockResolvedValueOnce({
      id: 'item-1',
      cantidad: 2,
      publicacion: { inventario: { cantidad: 100, cantidadReservada: 0 } },
    });
    cartRepo.findUnique.mockResolvedValueOnce({ id: 'cart-1', items: [{ cantidad: 49 }] });
    await expect(service.updateItemQuantity('user-1', 'item-1', 4)).rejects.toBeInstanceOf(BadRequestException);
    cartRepo.findItemById.mockResolvedValueOnce({ id: 'item-1' });
    await expect(service.removeItem('user-1', 'item-1')).resolves.toEqual({ success: true });
    cartRepo.findItemById.mockResolvedValueOnce(null);
    await expect(service.removeItem('user-1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.clearCart('user-1')).resolves.toEqual({ success: true });
  });
});

describe('CategoriesService', () => {
  const createService = () => {
    const categoryRepo = {
      findById: jest.fn(),
      findActiveRootCategories: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    const cache = { getOrSet: jest.fn((key, ttl, loader) => loader()), delete: jest.fn() };
    return { service: new CategoriesService(categoryRepo as any, cache as any), categoryRepo, cache };
  };

  it('finds active category tree through cache', async () => {
    const { service, categoryRepo, cache } = createService();
    categoryRepo.findActiveRootCategories.mockResolvedValue([{ id: 'cat-1' }]);

    await expect(service.findAll()).resolves.toEqual([{ id: 'cat-1' }]);
    expect(cache.getOrSet).toHaveBeenCalledWith('categories:active-tree', 60_000, expect.any(Function));
  });

  it('creates and updates categories with parent validation', async () => {
    const { service, categoryRepo, cache } = createService();
    categoryRepo.findById
      .mockResolvedValueOnce({ id: 'parent-1' })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'cat-1' })
      .mockResolvedValueOnce({ id: 'parent-2' });
    categoryRepo.create.mockResolvedValue({ id: 'cat-1' });
    categoryRepo.update.mockResolvedValue({ id: 'cat-1', nombre: 'Nuevo' });

    await expect(service.create({ nombre: 'Moda', parentId: 'parent-1' })).resolves.toEqual({ id: 'cat-1' });
    await expect(service.create({ nombre: 'Moda', parentId: 'missing' })).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.update('cat-1', { nombre: 'Nuevo', parentId: 'parent-2' })).resolves.toEqual({ id: 'cat-1', nombre: 'Nuevo' });
    categoryRepo.findById.mockResolvedValueOnce(null);
    await expect(service.update('missing', { nombre: 'Nada' })).rejects.toBeInstanceOf(NotFoundException);
    categoryRepo.findById.mockResolvedValueOnce({ id: 'cat-1' }).mockResolvedValueOnce(null);
    await expect(service.update('cat-1', { parentId: 'missing-parent' })).rejects.toBeInstanceOf(NotFoundException);
    expect(cache.delete).toHaveBeenCalledWith('categories:active-tree');
  });
});

describe('UsersService and AdminService', () => {
  it('manages user profile, addresses and preferences', async () => {
    const userRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateProfile: jest.fn(),
      findAddressesByUserId: jest.fn(),
      createAddress: jest.fn(),
      findAddressByIdAndUserId: jest.fn(),
      updateAddress: jest.fn(),
      findPreferencesByUserId: jest.fn(),
      createPreferences: jest.fn(),
      updatePreferences: jest.fn(),
    };
    const service = new UsersService(userRepo as any);
    userRepo.findById.mockResolvedValueOnce({ id: 'user-1' }).mockResolvedValueOnce(null);
    userRepo.updateProfile.mockResolvedValue({ id: 'user-1', nombre: 'Ada' });
    userRepo.findAddressesByUserId.mockResolvedValue([{ id: 'addr-1' }]);
    userRepo.createAddress.mockResolvedValue({ id: 'addr-2' });
    userRepo.findAddressByIdAndUserId.mockResolvedValueOnce({ id: 'addr-1' }).mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'addr-1' });
    userRepo.updateAddress.mockResolvedValue({ id: 'addr-1' });
    userRepo.findPreferencesByUserId.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'pref-1' });
    userRepo.createPreferences.mockResolvedValue({ id: 'pref-new' });
    userRepo.updatePreferences.mockResolvedValue({ id: 'pref-1', notifMarketing: true });

    await expect(service.getProfile('user-1')).resolves.toEqual({ id: 'user-1' });
    await expect(service.getProfile('missing')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.updateProfile('user-1', { nombre: 'Ada' })).resolves.toEqual({ id: 'user-1', nombre: 'Ada' });
    await expect(service.getAddresses('user-1')).resolves.toEqual([{ id: 'addr-1' }]);
    await expect(service.createAddress('user-1', { linea1: 'Calle 1' } as any)).resolves.toEqual({ id: 'addr-2' });
    await expect(service.updateAddress('user-1', 'addr-1', { ciudad: 'Lima' } as any)).resolves.toEqual({ id: 'addr-1' });
    await expect(service.updateAddress('user-1', 'missing', {})).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.deactivateAddress('user-1', 'addr-1')).resolves.toEqual({ message: 'Dirección desactivada exitosamente' });
    userRepo.findAddressByIdAndUserId.mockResolvedValueOnce(null);
    await expect(service.deactivateAddress('user-1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.getPreferences('user-1')).resolves.toEqual({ id: 'pref-new' });
    await expect(service.updatePreferences('user-1', { notifMarketing: true })).resolves.toEqual({ id: 'pref-1', notifMarketing: true });
    userRepo.findPreferencesByUserId.mockResolvedValueOnce({ id: 'pref-existing' });
    await expect(service.getPreferences('user-1')).resolves.toEqual({ id: 'pref-existing' });
  });

  it('computes admin reports and applies administrative updates', async () => {
    const adminRepo = {
      findUsers: jest.fn(),
      findUserById: jest.fn(),
      updateUserStatus: jest.fn(),
      deactivateSellerProducts: jest.fn(),
      getReports: jest.fn(),
      findOrders: jest.fn(),
      updateOrderStatus: jest.fn(),
      findProducts: jest.fn(),
      updateProductStatus: jest.fn(),
      deleteProduct: jest.fn(),
    };
    const service = new AdminService(adminRepo as any);
    adminRepo.findUsers.mockResolvedValue(['users']);
    adminRepo.findUserById.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'vendor-1' });
    adminRepo.updateUserStatus.mockResolvedValue({ id: 'vendor-1', estado: 'SUSPENDIDO' });
    adminRepo.getReports.mockResolvedValue({ totalUsers: 3, activeProducts: 4, totalOrders: 5, totalSales: 200 });
    adminRepo.findOrders.mockResolvedValue(['orders']);
    adminRepo.findProducts.mockResolvedValue(['products']);
    adminRepo.updateOrderStatus.mockResolvedValue({ id: 'order-1' });
    adminRepo.updateProductStatus.mockResolvedValue({ id: 'prod-1' });
    adminRepo.deleteProduct.mockResolvedValue({ id: 'prod-1' });

    await expect(service.getUsers()).resolves.toEqual(['users']);
    await expect(service.updateUserStatus('missing', { estado: 'ACTIVO' as any })).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.updateUserStatus('vendor-1', { estado: 'SUSPENDIDO' as any })).resolves.toMatchObject({ estado: 'SUSPENDIDO' });
    expect(adminRepo.deactivateSellerProducts).toHaveBeenCalledWith('vendor-1');
    await expect(service.getReports()).resolves.toEqual({ totalUsers: 3, activeProducts: 4, totalOrders: 5, totalSales: 200 });
    await expect(service.getOrders()).resolves.toEqual(['orders']);
    await expect(service.getProducts()).resolves.toEqual(['products']);
    await expect(service.updateOrderStatus('order-1', 'CONFIRMADA')).resolves.toEqual({ id: 'order-1' });
    await expect(service.resolveOrder('order-1', 'CANCELADA')).resolves.toEqual({ id: 'order-1' });
    await expect(service.updateProductStatus('prod-1', 'INACTIVA')).resolves.toEqual({ id: 'prod-1' });
    await expect(service.deleteProduct('prod-1')).resolves.toEqual({ id: 'prod-1' });
  });
});

describe('Favorites, promotions, notifications and reviews', () => {
  it('manages favorites with product existence validation', async () => {
    const favoriteRepo = {
      findManyByUser: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };
    const productRepo = {
      findProductById: jest.fn(),
    };
    const service = new FavoritesService(favoriteRepo as any, productRepo as any);
    favoriteRepo.findManyByUser.mockResolvedValue(['favorites']);
    productRepo.findProductById.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'prod-1' });
    favoriteRepo.create.mockResolvedValue({ id: 'fav-1' });
    favoriteRepo.delete.mockResolvedValue({ id: 'fav-1' });

    await expect(service.getFavorites('user-1')).resolves.toEqual(['favorites']);
    await expect(service.addFavorite('user-1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.addFavorite('user-1', 'prod-1')).resolves.toEqual({ id: 'fav-1' });
    await expect(service.removeFavorite('user-1', 'prod-1')).resolves.toEqual({ id: 'fav-1' });
  });

  it('validates coupons and returns active promotions', async () => {
    const promotionRepo = {
      findCuponByCodigo: jest.fn(),
      findActivePromotionsForProducts: jest.fn(),
    };
    const service = new PromotionsService(promotionRepo as any);
    promotionRepo.findCuponByCodigo
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ vigenciaHasta: new Date(Date.now() - 1000), usos: 0, usosMaximos: 1 })
      .mockResolvedValueOnce({ vigenciaHasta: new Date(Date.now() + 1000), usos: 1, usosMaximos: 1 })
      .mockResolvedValueOnce({ id: 'coupon-1', vigenciaHasta: new Date(Date.now() + 1000), usos: 0, usosMaximos: 1 });
    promotionRepo.findActivePromotionsForProducts.mockResolvedValue(['promo']);

    await expect(service.validateCoupon('MISS')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.validateCoupon('OLD')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.validateCoupon('USED')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.applyCouponToCart('user-1', 'SAVE')).resolves.toMatchObject({ valid: true, cupon: { id: 'coupon-1' } });
    await expect(service.getActivePromotions(['prod-1'])).resolves.toEqual(['promo']);
  });

  it('sends notifications according to preferences and marks them as read', async () => {
    const notificationRepo = {
      findManyByUser: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    const provider = { sendNotification: jest.fn() };
    const userRepo = {
      findPreferencesByUserId: jest.fn(),
    };
    const service = new NotificationsService(notificationRepo as any, provider as any, userRepo as any);
    notificationRepo.findManyByUser.mockResolvedValue(['notif']);
    notificationRepo.findById.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'n1', usuarioId: 'user-1' });
    notificationRepo.updateStatus.mockResolvedValue({ id: 'n1', estado: 'ENVIADA' });
    userRepo.findPreferencesByUserId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ notifNuevaOrden: true, notifEstadoOrden: false, notifMarketing: false })
      .mockResolvedValueOnce({ notifNuevaOrden: false, notifEstadoOrden: true, notifMarketing: false })
      .mockResolvedValueOnce({ notifNuevaOrden: false, notifEstadoOrden: false, notifMarketing: true })
      .mockResolvedValueOnce(null);
    notificationRepo.create.mockResolvedValue({ id: 'n2' });
    provider.sendNotification.mockResolvedValueOnce(true).mockResolvedValueOnce(false).mockResolvedValue(true);
    notificationRepo.update.mockResolvedValue({ id: 'n1', estado: 'ENVIADA' });

    await expect(service.getMyNotifications('user-1')).resolves.toEqual(['notif']);
    await expect(service.markAsRead('user-1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.markAsRead('user-1', 'n1')).resolves.toMatchObject({ estado: 'ENVIADA' });
    await expect(service.sendNotification('user-1', 'MARKETING', 'promo')).resolves.toBeNull();
    await expect(service.sendNotification('user-1', 'ORDEN_NUEVA', 'orden')).resolves.toMatchObject({ estado: 'ENVIADA' });
    await expect(service.sendNotification('user-1', 'ORDEN_ESTADO', 'orden')).resolves.toMatchObject({ estado: 'ENVIADA' });
    await expect(service.sendNotification('user-1', 'MARKETING', 'promo')).resolves.toMatchObject({ estado: 'ENVIADA' });
    await expect(service.sendNotification('user-1', 'SEGURIDAD', 'login')).resolves.toMatchObject({ estado: 'ENVIADA' });
  });

  it('allows reviews only for purchased products and blocks duplicates', async () => {
    const reviewRepo = {
      findManyByProduct: jest.fn(),
      create: jest.fn(),
      findFirstReview: jest.fn(),
    };
    const productRepo = {
      findProductById: jest.fn(),
    };
    const orderRepo = {
      findFirstOrderContainingProduct: jest.fn(),
    };
    const service = new ReviewsService(reviewRepo as any, productRepo as any, orderRepo as any);
    reviewRepo.findManyByProduct.mockResolvedValue(['review']);
    productRepo.findProductById.mockResolvedValueOnce(null).mockResolvedValue({ id: 'prod-1' });
    orderRepo.findFirstOrderContainingProduct.mockResolvedValueOnce(null).mockResolvedValue({ id: 'order-1' });
    reviewRepo.findFirstReview.mockResolvedValueOnce({ id: 'existing' }).mockResolvedValueOnce(null);
    reviewRepo.create.mockResolvedValue({ id: 'review-1' });

    await expect(service.getReviews('prod-1')).resolves.toEqual(['review']);
    await expect(service.addReview('user-1', { publicacionId: 'missing', calificacion: 5 })).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.addReview('user-1', { publicacionId: 'prod-1', calificacion: 5 })).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.addReview('user-1', { publicacionId: 'prod-1', calificacion: 5 })).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.addReview('user-1', { publicacionId: 'prod-1', calificacion: 5, comentario: 'Bueno' })).resolves.toEqual({
      id: 'review-1',
    });
  });
});
