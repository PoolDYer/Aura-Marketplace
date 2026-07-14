import { FavoritesService } from './favorites.service';

describe('FavoritesService Colocated Edge Cases', () => {
  const createService = () => {
    const favoriteRepo = {
      findManyByUser: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };
    const productRepo = {
      findProductById: jest.fn(),
    };
    return {
      service: new FavoritesService(favoriteRepo as any, productRepo as any),
      favoriteRepo,
      productRepo,
    };
  };

  it('removeFavorite should delete favorited product by compound key', async () => {
    const { service, favoriteRepo } = createService();
    favoriteRepo.delete.mockResolvedValue({ compradorId: 'user-1', publicacionId: 'prod-1' });

    const result = await service.removeFavorite('user-1', 'prod-1');
    expect(result).toEqual({ compradorId: 'user-1', publicacionId: 'prod-1' });
    expect(favoriteRepo.delete).toHaveBeenCalledWith('user-1', 'prod-1');
  });

  it('getFavorites should return an empty list when user has none', async () => {
    const { service, favoriteRepo } = createService();
    favoriteRepo.findManyByUser.mockResolvedValue([]);

    const result = await service.getFavorites('user-1');
    expect(result).toEqual([]);
    expect(favoriteRepo.findManyByUser).toHaveBeenCalledWith('user-1');
  });
});
