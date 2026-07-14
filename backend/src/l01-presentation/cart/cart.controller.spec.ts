import { CartController } from './cart.controller';

describe('CartController', () => {
  const createController = () => {
    const cartService = {
      getCart: jest.fn(),
      addItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
    };
    const controller = new CartController(cartService as any);
    return { controller, cartService };
  };

  it('getCart should call cartService.getCart with user.id', () => {
    const { controller, cartService } = createController();
    cartService.getCart.mockReturnValue({ id: 'cart-1', items: [] });

    const result = controller.getCart({ user: { id: 'user-1' } });
    expect(result).toEqual({ id: 'cart-1', items: [] });
    expect(cartService.getCart).toHaveBeenCalledWith('user-1');
  });

  it('addItem should call cartService.addItem', () => {
    const { controller, cartService } = createController();
    cartService.addItem.mockReturnValue({ id: 'item-1' });

    const result = controller.addItem({ user: { id: 'user-1' } }, { publicacionId: 'prod-1', cantidad: 3 });
    expect(result).toEqual({ id: 'item-1' });
    expect(cartService.addItem).toHaveBeenCalledWith('user-1', 'prod-1', 3);
  });
});
