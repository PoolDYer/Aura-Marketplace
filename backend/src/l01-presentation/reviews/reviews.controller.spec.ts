import { ReviewsController } from './reviews.controller';

describe('ReviewsController', () => {
  const createController = () => {
    const reviewsService = {
      getReviews: jest.fn(),
      addReview: jest.fn(),
    };
    const controller = new ReviewsController(reviewsService as any);
    return { controller, reviewsService };
  };

  it('getReviews should call reviewsService.getReviews', () => {
    const { controller, reviewsService } = createController();
    reviewsService.getReviews.mockReturnValue(['review-1']);

    const result = controller.getReviews('prod-123');
    expect(result).toEqual(['review-1']);
    expect(reviewsService.getReviews).toHaveBeenCalledWith('prod-123');
  });

  it('addReview should call reviewsService.addReview', () => {
    const { controller, reviewsService } = createController();
    reviewsService.addReview.mockReturnValue({ success: true });

    const result = controller.addReview({ user: { userId: 'user-1' } }, 'prod-123', 5, 'Great');
    expect(result).toEqual({ success: true });
    expect(reviewsService.addReview).toHaveBeenCalledWith('user-1', {
      publicacionId: 'prod-123',
      calificacion: 5,
      comentario: 'Great',
    });
  });
});
