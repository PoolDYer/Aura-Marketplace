import { BadRequestException } from '@nestjs/common';
import { AdminController } from './admin/admin.controller';
import { AgentController } from './agent/agent.controller';
import { AuthController } from './auth/auth.controller';
import { CartController } from './cart/cart.controller';
import { CategoriesController } from './categories/categories.controller';
import { FavoritesController } from './favorites/favorites.controller';
import { NotificationsController } from './notifications/notifications.controller';
import { OrdersController } from './orders/orders.controller';
import { VendorOrdersController } from './orders/vendor-orders.controller';
import { PaymentsController } from './payments/payments.controller';
import { ProductsController } from './products/products.controller';
import { PromotionsController } from './promotions/promotions.controller';
import { ReviewsController } from './reviews/reviews.controller';
import { UsersController } from './users/users.controller';

describe('presentation controllers', () => {
  const req = {
    user: { id: 'user-1', sub: 'sub-1', userId: 'legacy-1' },
    headers: { authorization: 'Bearer token-1' },
  };

  it('AuthController delegates auth and Neon flows', async () => {
    const auth = {
      register: jest.fn((dto) => dto),
      login: jest.fn((dto) => dto),
      verifyEmail: jest.fn((token) => token),
      resendVerificationEmail: jest.fn((email) => email),
      forgotPassword: jest.fn((dto) => dto),
      resetPassword: jest.fn((dto) => dto),
      refresh: jest.fn((token) => token),
      logout: jest.fn((refresh, access) => ({ refresh, access })),
    };
    const neon = {
      getRegistrationStatus: jest.fn((token) => token),
      completeGoogleRegistration: jest.fn((token, dto) => ({ token, dto })),
      syncProfile: jest.fn((id, dto) => ({ id, dto })),
    };
    const controller = new AuthController(auth as any, neon as any);

    expect(controller.register({ email: 'a@test.dev' } as any)).toEqual({ email: 'a@test.dev' });
    expect(controller.login({ email: 'a@test.dev' } as any)).toEqual({ email: 'a@test.dev' });
    expect(controller.verifyEmail({ token: 'verify' })).toBe('verify');
    expect(controller.resendVerification({ email: 'a@test.dev' })).toBe('a@test.dev');
    expect(controller.forgotPassword({ email: 'a@test.dev' })).toEqual({ email: 'a@test.dev' });
    expect(controller.resetPassword({ token: 'reset', password: 'Password123', confirmPassword: 'Password123' })).toEqual({
      token: 'reset',
      password: 'Password123',
      confirmPassword: 'Password123',
    });
    expect(controller.refresh({ refreshToken: 'refresh' })).toBe('refresh');
    expect(controller.neonStatus(req)).toBe('token-1');
    expect(controller.completeGoogleRegistration(req, { nombre: 'Ada', password: 'secret' })).toEqual({
      token: 'token-1',
      dto: { nombre: 'Ada', password: 'secret' },
    });
    expect(controller.syncNeonUser(req, { nombre: 'Ada' })).toEqual({ id: 'user-1', dto: { nombre: 'Ada' } });
    expect(controller.logout(req, { refreshToken: 'refresh' })).toEqual({ refresh: 'refresh', access: 'token-1' });
  });

  it('ProductsController delegates product actions and validates image uploads', async () => {
    const products = {
      getProducts: jest.fn().mockReturnValue(['all']),
      createProduct: jest.fn((vendor, data) => ({ vendor, data })),
      getVendorProducts: jest.fn((vendor) => vendor),
      getVendorProductById: jest.fn((vendor, id) => ({ vendor, id })),
      updateVendorProduct: jest.fn((vendor, id, data) => ({ vendor, id, data })),
      updateVendorProductStatus: jest.fn((vendor, id, estado) => ({ vendor, id, estado })),
      deleteVendorProduct: jest.fn((vendor, id) => ({ vendor, id })),
      getProductById: jest.fn((id) => id),
    };
    const cloudinary = {
      uploadProductImage: jest.fn((input) => input),
    };
    const controller = new ProductsController(products as any, cloudinary as any);

    await expect(controller.getAll()).resolves.toEqual(['all']);
    await expect(controller.createProduct(req, { nombre: 'Polo' } as any)).resolves.toEqual({
      vendor: 'sub-1',
      data: { nombre: 'Polo' },
    });
    await expect(controller.getVendorProducts(req)).resolves.toBe('sub-1');
    await expect(controller.getVendorProductById(req, 'prod-1')).resolves.toEqual({ vendor: 'sub-1', id: 'prod-1' });
    await expect(controller.updateProduct(req, 'prod-1', { precio: 10 })).resolves.toMatchObject({ data: { precio: 10 } });
    await expect(controller.updateProductStatus(req, 'prod-1', { estado: 'ACTIVA' as any })).resolves.toMatchObject({ estado: 'ACTIVA' });
    await expect(controller.deleteProduct(req, 'prod-1')).resolves.toEqual({ vendor: 'sub-1', id: 'prod-1' });
    await expect(controller.getOne('prod-1')).resolves.toBe('prod-1');
    await expect(controller.uploadVendorProductImage(req, undefined, {})).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      controller.uploadVendorProductImage(
        req,
        { buffer: Buffer.from('img'), mimetype: 'image/png', originalname: 'p.png' },
        { productId: 'prod-1' },
      ),
    ).resolves.toMatchObject({ vendorId: 'sub-1', productId: 'prod-1' });
  });

  it('delegates cart, categories, users, admin and commerce controllers', async () => {
    const cart = new CartController({
      getCart: jest.fn((id) => id),
      addItem: jest.fn((id, product, qty) => ({ id, product, qty })),
      updateItemQuantity: jest.fn((id, item, qty) => ({ id, item, qty })),
      removeItem: jest.fn((id, item) => ({ id, item })),
      clearCart: jest.fn((id) => id),
    } as any);
    expect(cart.getCart(req)).toBe('user-1');
    expect(cart.addItem(req, { publicacionId: 'p1', cantidad: 2 })).toEqual({ id: 'user-1', product: 'p1', qty: 2 });
    expect(cart.updateItemQuantity(req, 'item-1', { cantidad: 3 })).toEqual({ id: 'user-1', item: 'item-1', qty: 3 });
    expect(cart.removeItem(req, 'item-1')).toEqual({ id: 'user-1', item: 'item-1' });
    expect(cart.clearCart(req)).toBe('user-1');

    const categories = new CategoriesController({
      findAll: jest.fn().mockReturnValue(['cats']),
      create: jest.fn((dto) => dto),
      update: jest.fn((id, dto) => ({ id, dto })),
    } as any);
    expect(categories.findAll()).toEqual(['cats']);
    expect(categories.create({ nombre: 'Moda' } as any)).toEqual({ nombre: 'Moda' });
    expect(categories.update('cat-1', { nombre: 'Casa' })).toEqual({ id: 'cat-1', dto: { nombre: 'Casa' } });

    const admin = new AdminController({
      getUsers: jest.fn().mockReturnValue(['users']),
      updateUserStatus: jest.fn((id, dto) => ({ id, dto })),
      getReports: jest.fn().mockReturnValue({ totalUsers: 1 }),
      getOrders: jest.fn().mockReturnValue(['orders']),
      updateOrderStatus: jest.fn((id, estado) => ({ id, estado })),
      getProducts: jest.fn().mockReturnValue(['products']),
      updateProductStatus: jest.fn((id, estado) => ({ id, estado })),
      deleteProduct: jest.fn((id) => id),
      resolveOrder: jest.fn((id, estado) => ({ id, estado })),
    } as any);
    expect(admin.getUsers()).toEqual(['users']);
    expect(admin.updateUserStatus('u1', { estado: 'SUSPENDIDO' as any })).toMatchObject({ id: 'u1' });
    expect(admin.getReports()).toEqual({ totalUsers: 1 });
    expect(admin.getOrders()).toEqual(['orders']);
    expect(admin.updateOrderStatus('o1', 'CONFIRMADA')).toEqual({ id: 'o1', estado: 'CONFIRMADA' });
    expect(admin.getProducts()).toEqual(['products']);
    expect(admin.updateProductStatus('p1', 'INACTIVA')).toEqual({ id: 'p1', estado: 'INACTIVA' });
    expect(admin.deleteProduct('p1')).toBe('p1');
    expect(admin.resolveOrder('o1', 'CANCELADA')).toEqual({ id: 'o1', estado: 'CANCELADA' });

    const favorites = new FavoritesController({
      getFavorites: jest.fn((id) => id),
      addFavorite: jest.fn((id, product) => ({ id, product })),
      removeFavorite: jest.fn((id, product) => ({ id, product })),
    } as any);
    expect(favorites.getFavorites(req)).toBe('user-1');
    expect(favorites.addFavorite(req, 'p1')).toEqual({ id: 'user-1', product: 'p1' });
    expect(favorites.removeFavorite(req, 'p1')).toEqual({ id: 'user-1', product: 'p1' });

    const notifications = new NotificationsController({
      getMyNotifications: jest.fn((id) => id),
      markAsRead: jest.fn((id, notif) => ({ id, notif })),
    } as any);
    expect(notifications.getMyNotifications(req)).toBe('legacy-1');
    expect(notifications.markAsRead(req, 'n1')).toEqual({ id: 'legacy-1', notif: 'n1' });
  });

  it('delegates order, payment, promotion, review and agent controllers', async () => {
    const orders = new OrdersController({
      createOrder: jest.fn((id, address, coupon) => ({ id, address, coupon })),
      getMyOrders: jest.fn((id) => id),
      getOrderById: jest.fn((id, order) => ({ id, order })),
    } as any);
    expect(orders.createOrder(req, { direccionId: 'addr-1', cuponCodigo: 'SAVE' })).toEqual({
      id: 'sub-1',
      address: 'addr-1',
      coupon: 'SAVE',
    });
    expect(orders.getMyOrders(req)).toBe('sub-1');
    expect(orders.getOrderById(req, 'order-1')).toEqual({ id: 'sub-1', order: 'order-1' });

    const vendorOrders = new VendorOrdersController({
      getVendorOrders: jest.fn((id) => id),
      updateOrderStatus: jest.fn((id, order, status) => ({ id, order, status })),
    } as any);
    expect(vendorOrders.getVendorOrders(req)).toBe('sub-1');
    expect(vendorOrders.updateOrderStatus(req, 'order-1', { estado: 'ENVIADA' as any })).toEqual({
      id: 'sub-1',
      order: 'order-1',
      status: 'ENVIADA',
    });

    const payments = new PaymentsController({
      createCheckoutPreference: jest.fn((id, order) => ({ id, order })),
      createBrickInitialization: jest.fn((id, order) => ({ id, order })),
      processBrickPayment: jest.fn((id, order, body) => ({ id, order, body })),
      handleWebhook: jest.fn((signature, requestId, dataId, body) => ({ signature, requestId, dataId, body })),
      verifyPayment: jest.fn((payment, order) => ({ payment, order })),
      getPaymentStatus: jest.fn((id, order) => ({ id, order })),
    } as any);
    expect(payments.createCheckoutPreference(req, 'o1')).toEqual({ id: 'sub-1', order: 'o1' });
    expect(payments.createBrickInitialization(req, 'o1')).toEqual({ id: 'sub-1', order: 'o1' });
    expect(payments.processBrickPayment(req, 'o1', { token: 'tok' })).toMatchObject({ body: { token: 'tok' } });
    await expect(payments.handleWebhook('sig', 'rid', 'pay1', { rawBody: Buffer.from('{}') } as any)).resolves.toMatchObject({
      signature: 'sig',
      requestId: 'rid',
      dataId: 'pay1',
      body: Buffer.from('{}'),
    });
    await expect(payments.handleWebhook('sig', 'rid', 'pay1', { body: { id: 'pay1' } } as any)).resolves.toMatchObject({
      body: { id: 'pay1' },
    });
    expect(payments.verifyPayment('', 'collection-1', 'o1')).toEqual({ payment: 'collection-1', order: 'o1' });
    expect(payments.getPaymentStatus(req, 'o1')).toEqual({ id: 'sub-1', order: 'o1' });

    const promotions = new PromotionsController({
      validateCoupon: jest.fn((code) => code),
      applyCouponToCart: jest.fn((id, code) => ({ id, code })),
    } as any);
    expect(promotions.validateCoupon('SAVE')).toBe('SAVE');
    expect(promotions.applyCoupon(req, 'SAVE')).toEqual({ id: 'legacy-1', code: 'SAVE' });

    const reviews = new ReviewsController({
      getReviews: jest.fn((id) => id),
      addReview: jest.fn((id, dto) => ({ id, dto })),
    } as any);
    expect(reviews.getReviews('p1')).toBe('p1');
    expect(reviews.addReview(req, 'p1', 5, 'Muy bueno')).toEqual({
      id: 'legacy-1',
      dto: { publicacionId: 'p1', calificacion: 5, comentario: 'Muy bueno' },
    });

    const agent = new AgentController(
      {
        processTextMessage: jest.fn().mockResolvedValue({ message: 'hola', action: { type: 'none' }, products: [], intention: {} }),
        processVoiceMessage: jest.fn().mockResolvedValue({
          transcribedText: 'audio',
          message: 'hola',
          action: { type: 'none' },
          products: [],
          intention: {},
        }),
      } as any,
      { getConversationHistory: jest.fn((id) => id) } as any,
    );
    await expect(agent.sendText(req, 'hola')).resolves.toEqual({ message: 'hola', action: { type: 'none' }, products: [], intention: {} });
    await expect(agent.sendVoice(req, { buffer: Buffer.from('audio') })).resolves.toEqual({
      transcribedText: 'audio',
      message: 'hola',
      action: { type: 'none' },
      products: [],
      intention: {},
    });
    await expect(agent.getHistory(req)).resolves.toBe('sub-1');
    await expect(agent.confirmAction(req, 'a1')).resolves.toEqual({ success: true, message: 'Acción confirmada' });
    await expect(agent.cancelAction(req, 'a1')).resolves.toEqual({ success: true, message: 'Acción cancelada' });
  });

  it('delegates all UsersController endpoints', () => {
    const users = new UsersController({
      getProfile: jest.fn((id) => id),
      updateProfile: jest.fn((id, dto) => ({ id, dto })),
      getAddresses: jest.fn((id) => id),
      createAddress: jest.fn((id, dto) => ({ id, dto })),
      updateAddress: jest.fn((id, address, dto) => ({ id, address, dto })),
      deactivateAddress: jest.fn((id, address) => ({ id, address })),
      getPreferences: jest.fn((id) => id),
      updatePreferences: jest.fn((id, dto) => ({ id, dto })),
    } as any);

    expect(users.getProfile(req)).toBe('sub-1');
    expect(users.updateProfile(req, { nombre: 'Ada' })).toEqual({ id: 'sub-1', dto: { nombre: 'Ada' } });
    expect(users.getAddresses(req)).toBe('sub-1');
    expect(users.createAddress(req, { linea1: 'Calle 1' } as any)).toEqual({ id: 'sub-1', dto: { linea1: 'Calle 1' } });
    expect(users.updateAddress(req, 'addr-1', { ciudad: 'Lima' } as any)).toEqual({
      id: 'sub-1',
      address: 'addr-1',
      dto: { ciudad: 'Lima' },
    });
    expect(users.deactivateAddress(req, 'addr-1')).toEqual({ id: 'sub-1', address: 'addr-1' });
    expect(users.getPreferences(req)).toBe('sub-1');
    expect(users.updatePreferences(req, { notifMarketing: true })).toEqual({ id: 'sub-1', dto: { notifMarketing: true } });
  });
});
