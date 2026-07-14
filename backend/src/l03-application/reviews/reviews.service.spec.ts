import { ForbiddenException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

describe('ReviewsService Colocated Edge Cases', () => {
  const createService = () => {
    const reviewRepo = {
      findManyByProduct: jest.fn(),
      create: jest.fn(),
      findFirstReview: jest.fn(),
    };
    const productRepo = {
      findProductById: jest.fn(),
      findActiveProductById: jest.fn(),
      findActiveProducts: jest.fn(),
      createManyImagenes: jest.fn(),
      updateStatus: jest.fn(),
    };
    const orderRepo = {
      findFirstOrderContainingProduct: jest.fn(),
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
    return {
      service: new ReviewsService(reviewRepo as any, productRepo as any, orderRepo as any),
      reviewRepo,
      productRepo,
      orderRepo,
    };
  };

  it('addReview should allow review with rating but no comment', async () => {
    const { service, reviewRepo, productRepo, orderRepo } = createService();
    productRepo.findProductById.mockResolvedValue({ id: 'prod-1' });
    orderRepo.findFirstOrderContainingProduct.mockResolvedValue({ id: 'order-1' }); // Purchased
    reviewRepo.findFirstReview.mockResolvedValue(null); // No duplicate review
    reviewRepo.create.mockResolvedValue({ id: 'review-1', comentario: null });

    const result = await service.addReview('user-1', {
      publicacionId: 'prod-1',
      calificacion: 4,
    });
    expect(result).toEqual({ id: 'review-1', comentario: null });
    expect(reviewRepo.create).toHaveBeenCalledWith({
      ordenId: 'order-1',
      compradorId: 'user-1',
      publicacionId: 'prod-1',
      calificacion: 4,
      comentario: undefined,
    });
  });

  it('addReview should reject review if purchase order is CANCELADA', async () => {
    const { service, productRepo, orderRepo } = createService();
    productRepo.findProductById.mockResolvedValue({ id: 'prod-1' });
    // Buyer has NOT bought product in a non-cancelled order
    orderRepo.findFirstOrderContainingProduct.mockResolvedValue(null); 

    await expect(service.addReview('user-1', {
      publicacionId: 'prod-1',
      calificacion: 5,
    })).rejects.toThrow(ForbiddenException);
  });
});
