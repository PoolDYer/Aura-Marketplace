import { BadRequestException } from '@nestjs/common';
import { PromotionsService } from './promotions.service';

describe('PromotionsService Colocated Edge Cases', () => {
  const createService = () => {
    const promotionRepo = {
      findCuponByCodigo: jest.fn(),
      findActivePromotionsForProducts: jest.fn(),
    };
    return { service: new PromotionsService(promotionRepo as any), promotionRepo };
  };

  it('validateCoupon should allow a coupon when usages are less than max usages', async () => {
    const { service, promotionRepo } = createService();
    promotionRepo.findCuponByCodigo.mockResolvedValue({
      id: 'coupon-1',
      vigenciaHasta: new Date(Date.now() + 100000),
      usos: 5,
      usosMaximos: 10,
    });

    const result = await service.validateCoupon('VALID');
    expect(result.id).toBe('coupon-1');
  });

  it('validateCoupon should reject expired boundary coupon', async () => {
    const { service, promotionRepo } = createService();
    promotionRepo.findCuponByCodigo.mockResolvedValue({
      id: 'coupon-1',
      vigenciaHasta: new Date(Date.now() - 500), // Expired 500ms ago
      usos: 0,
      usosMaximos: 10,
    });

    await expect(service.validateCoupon('EXPIRED')).rejects.toThrow(BadRequestException);
  });
});
