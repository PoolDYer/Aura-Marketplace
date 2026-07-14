import { PromotionsController } from './promotions.controller';

describe('PromotionsController', () => {
  const createController = () => {
    const promotionsService = {
      validateCoupon: jest.fn(),
      applyCouponToCart: jest.fn(),
    };
    const controller = new PromotionsController(promotionsService as any);
    return { controller, promotionsService };
  };

  it('validateCoupon should call promotionsService.validateCoupon', () => {
    const { controller, promotionsService } = createController();
    promotionsService.validateCoupon.mockReturnValue({ id: 'coupon-1' });

    const result = controller.validateCoupon('SAVE20');
    expect(result).toEqual({ id: 'coupon-1' });
    expect(promotionsService.validateCoupon).toHaveBeenCalledWith('SAVE20');
  });

  it('applyCoupon should call promotionsService.applyCouponToCart', () => {
    const { controller, promotionsService } = createController();
    promotionsService.applyCouponToCart.mockReturnValue({ valid: true });

    const result = controller.applyCoupon({ user: { userId: 'user-1' } }, 'SAVE20');
    expect(result).toEqual({ valid: true });
    expect(promotionsService.applyCouponToCart).toHaveBeenCalledWith('user-1', 'SAVE20');
  });
});
