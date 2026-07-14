import { UsersService } from './users.service';

describe('UsersService Colocated Edge Cases', () => {
  const createService = () => {
    const userRepo = {
      findById: jest.fn(),
      updateProfile: jest.fn(),
      findAddressesByUserId: jest.fn(),
      findAddressByIdAndUserId: jest.fn(),
      createAddress: jest.fn(),
      updateAddress: jest.fn(),
      findPreferencesByUserId: jest.fn(),
      createPreferences: jest.fn(),
      updatePreferences: jest.fn(),
    };
    return { service: new UsersService(userRepo as any), userRepo };
  };

  it('createAddress should support reference field as undefined or null', async () => {
    const { service, userRepo } = createService();
    userRepo.createAddress.mockResolvedValue({ id: 'addr-1', referencia: null });

    const result = await service.createAddress('user-1', {
      calle: 'Calle',
      ciudad: 'Ciudad',
      estado: 'Estado',
      codigoPostal: '12345',
      pais: 'Pais',
    });
    expect(result).toEqual({ id: 'addr-1', referencia: null });
    expect(userRepo.createAddress).toHaveBeenCalledWith('user-1', {
      calle: 'Calle',
      ciudad: 'Ciudad',
      estado: 'Estado',
      codigoPostal: '12345',
      pais: 'Pais',
    });
  });

  it('updateProfile should execute update even if DTO fields are empty', async () => {
    const { service, userRepo } = createService();
    userRepo.updateProfile.mockResolvedValue({ id: 'user-1' });

    const result = await service.updateProfile('user-1', {});
    expect(result).toEqual({ id: 'user-1' });
    expect(userRepo.updateProfile).toHaveBeenCalledWith('user-1', {});
  });

  it('getPreferences should create default preferences if none exist', async () => {
    const { service, userRepo } = createService();
    userRepo.findPreferencesByUserId.mockResolvedValue(null);
    userRepo.createPreferences.mockResolvedValue({ id: 'pref-1', notifMarketing: false });

    const result = await service.getPreferences('user-1');
    expect(result).toEqual({ id: 'pref-1', notifMarketing: false });
    expect(userRepo.createPreferences).toHaveBeenCalledWith('user-1');
  });
});
