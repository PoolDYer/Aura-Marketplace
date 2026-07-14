import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const createService = () => {
    const orderRepo = {
      createOrderFromCart: jest.fn(),
      findCuponByCodigo: jest.fn(),
      incrementCuponUsos: jest.fn(),
      findMyOrders: jest.fn(),
      findOrderById: jest.fn(),
      findVendorOrders: jest.fn(),
      updateOrderStatus: jest.fn(),
      findFirstOrder: jest.fn(),
      escalateOldPendingOrders: jest.fn(),
    };
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
    const userRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateProfile: jest.fn(),
      findAddressesByUserId: jest.fn(),
      findAddressByIdAndUserId: jest.fn(),
      createAddress: jest.fn(),
      updateAddress: jest.fn(),
      findPreferencesByUserId: jest.fn(),
      createPreferences: jest.fn(),
      updatePreferences: jest.fn(),
    };
    return {
      service: new OrdersService(orderRepo as any, cartRepo as any, userRepo as any),
      orderRepo,
      cartRepo,
      userRepo,
    };
  };

  const cart = {
    id: 'cart-1',
    items: [
      {
        cantidad: 2,
        publicacion: {
          id: 'prod-1',
          nombre: 'Polo',
          precio: 50,
          estado: 'ACTIVA',
          vendedorId: 'vendor-1',
          inventario: { cantidad: 10, cantidadReservada: 1 },
        },
      },
    ],
  };

  it('creates orders inside a transaction and clears the cart', async () => {
    const { service, orderRepo, cartRepo, userRepo } = createService();
    cartRepo.findUnique.mockResolvedValue(cart);
    userRepo.findAddressByIdAndUserId.mockResolvedValue({ id: 'addr-1' });
    orderRepo.createOrderFromCart.mockResolvedValue({ id: 'order-1', numeroConfirmacion: 'ORD-1' });

    await expect(service.createOrder('user-1', 'addr-1')).resolves.toEqual({ id: 'order-1', numeroConfirmacion: 'ORD-1' });

    expect(orderRepo.createOrderFromCart).toHaveBeenCalledWith(
      'user-1',
      cart,
      'addr-1',
      null,
      100,
      expect.any(String),
    );
  });

  it('applies valid coupons and clamps fixed discounts at zero', async () => {
    const { service, orderRepo, cartRepo, userRepo } = createService();
    cartRepo.findUnique.mockResolvedValue(cart);
    userRepo.findAddressByIdAndUserId.mockResolvedValue({ id: 'addr-1' });
    orderRepo.findCuponByCodigo.mockResolvedValue({
      id: 'coupon-1',
      vigenciaHasta: new Date(Date.now() + 60_000),
      usos: 0,
      usosMaximos: 10,
      descuento: 200,
      tipo: 'FIJO',
    });
    orderRepo.createOrderFromCart.mockResolvedValue({ id: 'order-1' });

    await service.createOrder('user-1', 'addr-1', 'SAVE');

    expect(orderRepo.createOrderFromCart).toHaveBeenCalledWith(
      'user-1',
      cart,
      'addr-1',
      expect.objectContaining({ id: 'coupon-1' }),
      0,
      expect.any(String),
    );
  });

  it('rejects empty carts, missing addresses, unavailable products, stock and invalid coupons', async () => {
    const { service, orderRepo, cartRepo, userRepo } = createService();
    cartRepo.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'cart', items: [] });
    await expect(service.createOrder('user-1', 'addr-1')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.createOrder('user-1', 'addr-1')).rejects.toBeInstanceOf(BadRequestException);

    cartRepo.findUnique.mockResolvedValue(cart);
    userRepo.findAddressByIdAndUserId.mockResolvedValueOnce(null);
    await expect(service.createOrder('user-1', 'missing')).rejects.toBeInstanceOf(NotFoundException);

    userRepo.findAddressByIdAndUserId.mockResolvedValue({ id: 'addr-1' });
    cartRepo.findUnique.mockResolvedValueOnce({
      id: 'cart-1',
      items: [{ cantidad: 1, publicacion: { ...cart.items[0].publicacion, estado: 'BORRADOR' } }],
    });
    await expect(service.createOrder('user-1', 'addr-1')).rejects.toBeInstanceOf(BadRequestException);

    cartRepo.findUnique.mockResolvedValueOnce({
      id: 'cart-1',
      items: [{ cantidad: 99, publicacion: cart.items[0].publicacion }],
    });
    await expect(service.createOrder('user-1', 'addr-1')).rejects.toBeInstanceOf(BadRequestException);

    cartRepo.findUnique.mockResolvedValueOnce({
      id: 'cart-1',
      items: [{ cantidad: 1, publicacion: { ...cart.items[0].publicacion, inventario: null } }],
    });
    await expect(service.createOrder('user-1', 'addr-1')).rejects.toBeInstanceOf(BadRequestException);

    cartRepo.findUnique.mockResolvedValue(cart);
    orderRepo.findCuponByCodigo.mockResolvedValueOnce(null);
    await expect(service.createOrder('user-1', 'addr-1', 'MISS')).rejects.toBeInstanceOf(NotFoundException);

    orderRepo.findCuponByCodigo.mockResolvedValueOnce({ vigenciaHasta: new Date(Date.now() - 1000), usos: 0, usosMaximos: 1 });
    await expect(service.createOrder('user-1', 'addr-1', 'OLD')).rejects.toBeInstanceOf(BadRequestException);

    orderRepo.findCuponByCodigo.mockResolvedValueOnce({ vigenciaHasta: new Date(Date.now() + 1000), usos: 1, usosMaximos: 1 });
    await expect(service.createOrder('user-1', 'addr-1', 'USED')).rejects.toBeInstanceOf(BadRequestException);

    orderRepo.findCuponByCodigo.mockResolvedValueOnce({
      id: 'coupon-percent',
      vigenciaHasta: new Date(Date.now() + 1000),
      usos: 0,
      usosMaximos: 1,
      descuento: 10,
      tipo: 'PORCENTAJE',
    });
    orderRepo.createOrderFromCart.mockResolvedValue({ id: 'order-1' });
    await expect(service.createOrder('user-1', 'addr-1', 'PERCENT')).resolves.toEqual({ id: 'order-1' });
  });

  it('escalates old pending orders and exposes buyer/vendor order queries', async () => {
    const { service, orderRepo } = createService();
    orderRepo.escalateOldPendingOrders.mockResolvedValue([{ id: 'old-1' }, { id: 'old-2' }]);
    orderRepo.findMyOrders.mockResolvedValue(['mine']);
    orderRepo.findVendorOrders.mockResolvedValue(['vendor-orders']);
    orderRepo.findOrderById
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'order-1' });
    orderRepo.findFirstOrder
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'order-2' });
    orderRepo.updateOrderStatus.mockResolvedValue({ id: 'order-2', estado: 'ESCALADA' });

    await service.handleCronEscalateOrders();
    expect(orderRepo.escalateOldPendingOrders).toHaveBeenCalledTimes(1);
    await expect(service.getMyOrders('user-1')).resolves.toEqual(['mine']);
    await expect(service.getOrderById('user-1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.getOrderById('user-1', 'order-1')).resolves.toEqual({ id: 'order-1' });
    await expect(service.getVendorOrders('vendor-1')).resolves.toEqual(['vendor-orders']);
    await expect(service.updateOrderStatus('vendor-1', 'missing', 'ENVIADA')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.updateOrderStatus('vendor-1', 'order-2', 'ENVIADA')).resolves.toMatchObject({ estado: 'ESCALADA' });
  });
});
