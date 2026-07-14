import { VendorOrdersController } from './vendor-orders.controller';

describe('VendorOrdersController', () => {
  const createController = () => {
    const ordersService = {
      getVendorOrders: jest.fn(),
      updateOrderStatus: jest.fn(),
    };
    const controller = new VendorOrdersController(ordersService as any);
    return { controller, ordersService };
  };

  it('getVendorOrders should call ordersService.getVendorOrders', () => {
    const { controller, ordersService } = createController();
    ordersService.getVendorOrders.mockReturnValue(['order-1']);

    const result = controller.getVendorOrders({ user: { sub: 'vendor-1' } });
    expect(result).toEqual(['order-1']);
    expect(ordersService.getVendorOrders).toHaveBeenCalledWith('vendor-1');
  });

  it('updateOrderStatus should call ordersService.updateOrderStatus', () => {
    const { controller, ordersService } = createController();
    ordersService.updateOrderStatus.mockReturnValue({ id: 'order-1', estado: 'DESPACHADA' });

    const result = controller.updateOrderStatus(
      { user: { sub: 'vendor-1' } },
      'order-1',
      { estado: 'DESPACHADA' as any }
    );
    expect(result).toEqual({ id: 'order-1', estado: 'DESPACHADA' });
    expect(ordersService.updateOrderStatus).toHaveBeenCalledWith('vendor-1', 'order-1', 'DESPACHADA');
  });
});
