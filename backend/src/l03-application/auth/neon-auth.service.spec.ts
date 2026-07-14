import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { NeonAuthService } from './neon-auth.service';

describe('NeonAuthService', () => {
  const createService = () => {
    const config = { get: jest.fn((key: string) => (key === 'NEON_AUTH_BASE_URL' ? 'https://auth.test/' : `${key}-secret`)) };
    const userRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateProfile: jest.fn(),
      findAddressesByUserId: jest.fn(),
      findAddressByIdAndUserId: jest.fn(),
      createAddress: jest.fn(),
      updateAddress: jest.fn(),
      findPreferencesByUserId: jest.fn(),
      createPreferences: jest.fn(),
      updatePreferences: jest.fn(),
    };
    const tokenRevocadoRepo = {
      findByToken: jest.fn(),
      create: jest.fn(),
    };
    const jwt = { verifyAsync: jest.fn() };
    const hasher = { hash: jest.fn().mockResolvedValue('hash') };
    const service = new NeonAuthService(config as any, userRepo as any, tokenRevocadoRepo as any, jwt as any, hasher as any);
    return { service, config, userRepo, tokenRevocadoRepo, jwt, hasher };
  };

  const localUser = {
    id: 'user-1',
    email: 'ada@test.dev',
    nombre: 'Ada',
    rol: 'COMPRADOR',
    estado: 'ACTIVO',
  };

  it('validates Neon tokens by updating by id, updating by email or creating a local user', async () => {
    const { service, userRepo } = createService();
    const verifySpy = jest
      .spyOn(service as any, 'verifyToken')
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ sub: 'neon-1', email: 'ADA@TEST.DEV', name: ' Ada ' })
      .mockResolvedValueOnce({ id: 'neon-2', email: 'other@test.dev' })
      .mockResolvedValueOnce({ sub: 'neon-3', email: 'new@test.dev', name: '' })
      .mockResolvedValueOnce({ sub: 'neon-4', email: 'blocked@test.dev' });
    userRepo.findById
      .mockResolvedValueOnce({ ...localUser, id: 'neon-1', estado: 'PENDIENTE' })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...localUser, id: 'neon-4', estado: 'SUSPENDIDO' });
    userRepo.findByEmail
      .mockResolvedValueOnce({ ...localUser, id: 'user-by-email', nombre: '', estado: 'PENDIENTE' })
      .mockResolvedValueOnce(null);
    userRepo.update
      .mockResolvedValueOnce({ ...localUser, id: 'neon-1', nombre: 'Ada', email: 'ada@test.dev', estado: 'ACTIVO' })
      .mockResolvedValueOnce({ ...localUser, id: 'user-by-email', nombre: 'other', email: 'other@test.dev', estado: 'ACTIVO' })
      .mockResolvedValueOnce({ ...localUser, id: 'neon-4', estado: 'SUSPENDIDO' });
    userRepo.create.mockResolvedValue({ ...localUser, id: 'neon-3', nombre: 'new', email: 'new@test.dev', estado: 'ACTIVO' });

    await expect(service.validateAccessToken('incomplete')).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.validateAccessToken('by-id')).resolves.toMatchObject({ id: 'neon-1', neonSub: 'neon-1' });
    await expect(service.validateAccessToken('by-email')).resolves.toMatchObject({ id: 'user-by-email', neonSub: 'neon-2' });
    await expect(service.validateAccessToken('new')).resolves.toMatchObject({ id: 'neon-3', nombre: 'new' });
    await expect(service.validateAccessToken('blocked')).rejects.toBeInstanceOf(ForbiddenException);
    expect(verifySpy).toHaveBeenCalledTimes(5);
  });

  it('keeps active email-matched users active when validating Neon access tokens', async () => {
    const { service, userRepo } = createService();
    jest.spyOn(service as any, 'verifyToken').mockResolvedValue({ sub: 'neon-active', email: 'active@test.dev' });
    userRepo.findById.mockResolvedValueOnce(null);
    userRepo.findByEmail.mockResolvedValueOnce({
      id: 'user-active',
      nombre: 'Existing',
      email: 'active@test.dev',
      estado: 'ACTIVO',
      rol: 'COMPRADOR',
    });
    userRepo.update.mockResolvedValue({
      id: 'user-active',
      nombre: 'Existing',
      email: 'active@test.dev',
      estado: 'ACTIVO',
      rol: 'COMPRADOR',
    });

    await expect(service.validateAccessToken('token')).resolves.toMatchObject({
      id: 'user-active',
      nombre: 'Existing',
      neonSub: 'neon-active',
    });
    expect(userRepo.update).toHaveBeenCalledWith('user-active', { nombre: 'Existing', estado: 'ACTIVO' });
  });

  it('covers Neon token verification internals', async () => {
    const { service, config } = createService();
    config.get.mockImplementation((key: string) => {
      if (key === 'NEON_AUTH_BASE_URL') return 'https://auth.test/';
      if (key === 'NEON_AUTH_JWKS_URL') return 'https://auth.test/.well-known/jwks.json';
      return `${key}-secret`;
    });
    const jose = {
      createRemoteJWKSet: jest.fn().mockReturnValue('jwks'),
      jwtVerify: jest
        .fn()
        .mockResolvedValueOnce({ payload: { sub: 'neon-1', email: 'ada@test.dev' } })
        .mockRejectedValueOnce(new Error('bad')),
    };
    const importSpy = jest.spyOn(service as any, 'importJose').mockResolvedValue(jose);

    await expect((service as any).verifyToken('good')).resolves.toEqual({ sub: 'neon-1', email: 'ada@test.dev' });
    await expect((service as any).verifyToken('bad')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jose.createRemoteJWKSet).toHaveBeenCalledWith(new URL('https://auth.test/.well-known/jwks.json'));
    expect(jose.jwtVerify).toHaveBeenCalledWith('good', 'jwks', {
      issuer: 'https://auth.test',
      audience: 'https://auth.test',
    });

    importSpy.mockRestore();
    await expect((service as any).importJose()).rejects.toThrow('dynamic import');

    config.get.mockImplementation((key: string) => (key === 'NEON_AUTH_BASE_URL' ? undefined : key === 'NEON_AUTH_URL' ? 'https://fallback.test' : undefined));
    expect((service as any).getAuthUrl()).toBe('https://fallback.test');
  });

  it('builds default JWKS url when no explicit JWKS url exists', async () => {
    const { service, config } = createService();
    config.get.mockImplementation((key: string) => {
      if (key === 'NEON_AUTH_BASE_URL') return 'https://auth.test';
      if (key === 'NEON_AUTH_JWKS_URL') return undefined;
      return `${key}-secret`;
    });
    const jose = {
      createRemoteJWKSet: jest.fn().mockReturnValue('jwks'),
      jwtVerify: jest.fn().mockResolvedValue({ payload: { id: 'neon-1', email: 'ada@test.dev' } }),
    };
    jest.spyOn(service as any, 'importJose').mockResolvedValue(jose);

    await expect((service as any).verifyToken('token')).resolves.toEqual({ id: 'neon-1', email: 'ada@test.dev' });
    expect(jose.createRemoteJWKSet).toHaveBeenCalledWith(new URL('https://auth.test/.well-known/jwks.json'));
  });

  it('validates local access tokens and rejects invalid states', async () => {
    const { service, userRepo, tokenRevocadoRepo, jwt } = createService();
    jwt.verifyAsync
      .mockRejectedValueOnce(new Error('bad'))
      .mockResolvedValueOnce({})
      .mockResolvedValue({ sub: 'user-1', email: 'ada@test.dev', rol: 'COMPRADOR' });
    tokenRevocadoRepo.findByToken.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'revoked' }).mockResolvedValue(null);
    userRepo.findById
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...localUser, estado: 'SUSPENDIDO' })
      .mockResolvedValueOnce({ ...localUser, estado: 'PENDIENTE' })
      .mockResolvedValueOnce(localUser);

    await expect(service.validateLocalAccessToken('bad')).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.validateLocalAccessToken('incomplete')).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.validateLocalAccessToken('revoked')).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.validateLocalAccessToken('missing-user')).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.validateLocalAccessToken('suspended')).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.validateLocalAccessToken('pending')).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.validateLocalAccessToken('valid')).resolves.toEqual({
      id: 'user-1',
      sub: 'user-1',
      email: 'ada@test.dev',
      nombre: 'Ada',
      rol: 'COMPRADOR',
    });
  });

  it('syncs profile while preserving administrator role and activating pending users', async () => {
    const { service, userRepo } = createService();
    userRepo.findById
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...localUser, estado: 'SUSPENDIDO' })
      .mockResolvedValueOnce({ ...localUser, rol: 'ADMINISTRADOR', estado: 'PENDIENTE' });
    userRepo.update.mockResolvedValue({ id: 'user-1', nombre: 'Ada Lovelace', email: 'ada@test.dev', rol: 'ADMINISTRADOR' });

    await expect(service.syncProfile('missing', {})).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.syncProfile('suspended', {})).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.syncProfile('user-1', { nombre: ' Ada Lovelace ', rol: 'VENDEDOR' as any })).resolves.toEqual({
      user: { id: 'user-1', nombre: 'Ada Lovelace', email: 'ada@test.dev', rol: 'ADMINISTRADOR' },
    });
    expect(userRepo.update).toHaveBeenCalledWith('user-1', { nombre: 'Ada Lovelace', rol: 'ADMINISTRADOR', estado: 'ACTIVO' });

    userRepo.findById.mockResolvedValueOnce({ ...localUser, estado: 'ACTIVO', rol: 'COMPRADOR' });
    userRepo.update.mockResolvedValueOnce({ id: 'user-2', nombre: 'Ada', email: 'ada@test.dev', rol: 'COMPRADOR' });
    await expect(service.syncProfile('user-2', { nombre: '', rol: 'ADMINISTRADOR' as any })).resolves.toEqual({
      user: { id: 'user-2', nombre: 'Ada', email: 'ada@test.dev', rol: 'COMPRADOR' },
    });
  });

  it('reports registration status and completes Google registration from Neon identity', async () => {
    const { service, userRepo, hasher } = createService();
    jest.spyOn(service as any, 'verifyToken').mockResolvedValue({
      sub: 'neon-1',
      email: 'ADA@TEST.DEV',
      name: ' Ada ',
    });
    userRepo.findById
      .mockResolvedValueOnce(null) // 1. getRegistrationStatus: findById
      .mockResolvedValueOnce(null) // 2. completeGoogleRegistration (valid): findById
      .mockResolvedValueOnce({ ...localUser, id: 'neon-1', estado: 'SUSPENDIDO' }); // 3. completeGoogleRegistration (suspended): findById
    userRepo.findByEmail
      .mockResolvedValueOnce(localUser) // 1. getRegistrationStatus: findByEmail
      .mockResolvedValueOnce(null); // 2. completeGoogleRegistration (valid): findByEmail
    userRepo.create.mockResolvedValue({ id: 'neon-1', nombre: 'Ada', email: 'ada@test.dev', rol: 'VENDEDOR', estado: 'ACTIVO' });
    userRepo.update.mockResolvedValue({ ...localUser, nombre: 'Ada', estado: 'SUSPENDIDO' });

    await expect(service.getRegistrationStatus('token')).resolves.toMatchObject({
      registered: true,
      user: { id: 'user-1' },
      neonUser: { id: 'neon-1', email: 'ada@test.dev', nombre: 'Ada' },
    });
    await expect(
      service.completeGoogleRegistration('token', { nombre: ' Ada ', password: 'secret', rol: 'VENDEDOR' as any }),
    ).resolves.toEqual({ user: { id: 'neon-1', nombre: 'Ada', email: 'ada@test.dev', rol: 'VENDEDOR' } });
    expect(hasher.hash).toHaveBeenCalledWith('secret');
    await expect(service.completeGoogleRegistration('token', { nombre: 'Ada', password: 'secret' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('preserves active administrator role when completing Google registration', async () => {
    const { service, userRepo } = createService();
    jest.spyOn(service as any, 'verifyToken').mockResolvedValue({
      sub: 'admin-1',
      email: 'admin@test.dev',
      name: 'Admin',
    });
    userRepo.findById.mockResolvedValueOnce({
      id: 'admin-1',
      nombre: 'Admin',
      email: 'admin@test.dev',
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO',
    });
    userRepo.update.mockResolvedValue({
      id: 'admin-1',
      nombre: 'Admin Nuevo',
      email: 'admin@test.dev',
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO',
    });

    await expect(service.completeGoogleRegistration('token', { nombre: 'Admin Nuevo', password: 'secret', rol: 'VENDEDOR' as any })).resolves.toEqual({
      user: { id: 'admin-1', nombre: 'Admin Nuevo', email: 'admin@test.dev', rol: 'ADMINISTRADOR' },
    });
    expect(userRepo.update).toHaveBeenCalledWith('admin-1', {
      nombre: 'Admin Nuevo',
      passwordHash: 'hash',
      estado: 'ACTIVO',
      rol: 'ADMINISTRADOR',
    });
  });

  it('handles incomplete Neon identity and missing registration status', async () => {
    const { service, userRepo } = createService();
    jest
      .spyOn(service as any, 'verifyToken')
      .mockResolvedValueOnce({ sub: 'neon-1' })
      .mockResolvedValueOnce({ sub: 'neon-2', email: 'new@test.dev' });
    userRepo.findById.mockResolvedValue(null);
    userRepo.findByEmail.mockResolvedValue(null);

    await expect(service.getRegistrationStatus('bad')).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.getRegistrationStatus('new')).resolves.toMatchObject({
      registered: false,
      user: null,
      neonUser: { nombre: 'new' },
    });
    expect((service as any).resolveName(undefined, '')).toBe('Usuario Aura');

    jest.spyOn(service as any, 'verifyToken').mockResolvedValueOnce({ id: 'id-only', email: 'id@test.dev' });
    userRepo.findById.mockResolvedValue(null);
    userRepo.findByEmail.mockResolvedValue(null);
    await expect(service.getRegistrationStatus('id-token')).resolves.toMatchObject({
      registered: false,
      neonUser: { id: 'id-only', email: 'id@test.dev' },
    });
  });

  it('throws when Neon auth URL is missing', async () => {
    const { service, config } = createService();
    config.get.mockReturnValue(undefined);

    await expect((service as any).verifyToken('token')).rejects.toBeInstanceOf(BadRequestException);
  });
});
