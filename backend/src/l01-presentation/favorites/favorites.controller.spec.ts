import { FavoritesController } from './favorites.controller';

describe('FavoritesController', () => {
  const createController = () => {
    const favoritesService = {
      getFavorites: jest.fn(),
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
    };
    const controller = new FavoritesController(favoritesService as any);
    return { controller, favoritesService };
  };

  it('getFavorites should call favoritesService.getFavorites', () => {
    const { controller, favoritesService } = createController();
    favoritesService.getFavorites.mockReturnValue(['p1', 'p2']);

    const result = controller.getFavorites({ user: { id: 'user-1' } });
    expect(result).toEqual(['p1', 'p2']);
    expect(favoritesService.getFavorites).toHaveBeenCalledWith('user-1');
  });

  it('addFavorite should call favoritesService.addFavorite', () => {
    const { controller, favoritesService } = createController();
    favoritesService.addFavorite.mockReturnValue({ success: true });

    const result = controller.addFavorite({ user: { id: 'user-1' } }, 'prod-123');
    expect(result).toEqual({ success: true });
    expect(favoritesService.addFavorite).toHaveBeenCalledWith('user-1', 'prod-123');
  });
});
