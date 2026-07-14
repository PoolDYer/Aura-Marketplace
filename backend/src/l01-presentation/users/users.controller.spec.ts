import { UsersController } from './users.controller';

describe('UsersController', () => {
  const createController = () => {
    const usersService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      getAddresses: jest.fn(),
      createAddress: jest.fn(),
      updateAddress: jest.fn(),
      deactivateAddress: jest.fn(),
      getPreferences: jest.fn(),
      updatePreferences: jest.fn(),
    };
    const controller = new UsersController(usersService as any);
    return { controller, usersService };
  };

  it('getProfile should call usersService.getProfile with user.sub', () => {
    const { controller, usersService } = createController();
    usersService.getProfile.mockReturnValue({ name: 'Ada' });

    const result = controller.getProfile({ user: { sub: 'sub-123' } });
    expect(result).toEqual({ name: 'Ada' });
    expect(usersService.getProfile).toHaveBeenCalledWith('sub-123');
  });

  it('updateProfile should call usersService.updateProfile', () => {
    const { controller, usersService } = createController();
    usersService.updateProfile.mockReturnValue({ name: 'Ada Lovelace' });

    const result = controller.updateProfile({ user: { sub: 'sub-123' } }, { nombre: 'Ada Lovelace' });
    expect(result).toEqual({ name: 'Ada Lovelace' });
    expect(usersService.updateProfile).toHaveBeenCalledWith('sub-123', { nombre: 'Ada Lovelace' });
  });
});
