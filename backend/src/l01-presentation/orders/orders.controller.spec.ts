import { OrdersController } from './orders.controller';

describe('OrdersController', () => {
  const createController = () => {
    const ordersService = {
      createOrder: jest.fn(),
      getMyOrders: jest.fn(),
      getOrderById: jest.fn(),
    };
    const controller = new OrdersController(ordersService as any);
    return { controller, ordersService };
  };

  it('createOrder should call ordersService.createOrder', () => {
    const { controller, ordersService } = createController();
    ordersService.createOrder.mockReturnValue({ id: 'order-1' });

    const result = controller.createOrder({ user: { sub: 'sub-1' } }, { direccionId: 'addr-1', cuponCodigo: 'SAVE' });
    expect(result).toEqual({ id: 'order-1' });
    expect(ordersService.createOrder).toHaveBeenCalledWith('sub-1', 'addr-1', 'SAVE');
  });

  it('getMyOrders should call ordersService.getMyOrders', () => {
    const { controller, ordersService } = createController();
    ordersService.getMyOrders.mockReturnValue(['order-1']);

    const result = controller.getMyOrders({ user: { sub: 'sub-1' } });
    expect(result).toEqual(['order-1']);
    expect(ordersService.getMyOrders).toHaveBeenCalledWith('sub-1');
  });
});
