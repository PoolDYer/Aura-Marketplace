import { BadRequestException, HttpException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const createService = () => {
    const userRepo = {
      findById: jest.fn(),
      findAuthById: jest.fn(),
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
    const refreshTokenRepo = {
      findByToken: jest.fn(),
      create: jest.fn(),
      revokeManyByToken: jest.fn(),
    };
    const tokenRevocadoRepo = {
      findByToken: jest.fn(),
      create: jest.fn(),
    };
    const jwt = {
      sign: jest.fn((payload, options) => `${payload.sub}-${options.expiresIn}`),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    };
    const config = { get: jest.fn((key) => `${key}-value`) };
    const hasher = { hash: jest.fn(), verify: jest.fn() };
    const mail = { sendVerificationEmail: jest.fn(), sendPasswordResetEmail: jest.fn() };
    return {
      service: new AuthService(
        userRepo as any,
        refreshTokenRepo as any,
        tokenRevocadoRepo as any,
        hasher as any,
        mail as any,
        jwt as any,
        config as any,
      ),
      userRepo,
      refreshTokenRepo,
      tokenRevocadoRepo,
      jwt,
      hasher,
      mail,
    };
  };

  const activeUser = {
    id: 'user-1',
    nombre: 'Ada',
    email: 'ada@test.dev',
    passwordHash: 'hash',
    estado: 'ACTIVO',
    rol: 'COMPRADOR',
    intentosFallidos: 0,
    bloqueadoHasta: null,
  };

  it('registers new users and sends verification email', async () => {
    const { service, userRepo, hasher, mail } = createService();
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.create.mockResolvedValue(activeUser);
    hasher.hash.mockResolvedValue('hash');

    await expect(service.register({ nombre: 'Ada', email: 'ada@test.dev', password: 'secret' } as any)).resolves.toEqual({
      message: 'Registro exitoso. Verifique su correo.',
    });
    expect(mail.sendVerificationEmail).toHaveBeenCalledWith('ada@test.dev', 'user-1-1h');
  });

  it('rejects duplicate registrations', async () => {
    const { service, userRepo } = createService();
    userRepo.findByEmail.mockResolvedValue(activeUser);

    await expect(service.register({ email: 'ada@test.dev' } as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('logs in active users and persists refresh tokens', async () => {
    const { service, userRepo, refreshTokenRepo, hasher } = createService();
    userRepo.findByEmail.mockResolvedValue(activeUser);
    hasher.verify.mockResolvedValue(true);

    await expect(service.login({ email: 'ada@test.dev', password: 'secret' })).resolves.toMatchObject({
      accessToken: 'user-1-15m',
      refreshToken: 'user-1-7d',
      user: { id: 'user-1', email: 'ada@test.dev' },
    });
    expect(userRepo.update).toHaveBeenCalledWith('user-1', { intentosFallidos: 0, bloqueadoHasta: null });
    expect(refreshTokenRepo.create).toHaveBeenCalledWith('user-1-7d', 'user-1', expect.any(Date));
  });

  it('rejects missing, pending, suspended, locked and invalid-password users', async () => {
    const { service, userRepo, hasher } = createService();
    userRepo.findByEmail.mockResolvedValueOnce(null);
    await expect(service.login({ email: 'missing@test.dev', password: 'secret' })).rejects.toBeInstanceOf(UnauthorizedException);

    userRepo.findByEmail.mockResolvedValueOnce({ ...activeUser, estado: 'PENDIENTE' });
    await expect(service.login({ email: 'ada@test.dev', password: 'secret' })).rejects.toBeInstanceOf(HttpException);

    userRepo.findByEmail.mockResolvedValueOnce({ ...activeUser, estado: 'SUSPENDIDO' });
    await expect(service.login({ email: 'ada@test.dev', password: 'secret' })).rejects.toBeInstanceOf(HttpException);

    userRepo.findByEmail.mockResolvedValueOnce({ ...activeUser, bloqueadoHasta: new Date(Date.now() + 60_000) });
    await expect(service.login({ email: 'ada@test.dev', password: 'secret' })).rejects.toBeInstanceOf(HttpException);

    userRepo.findByEmail.mockResolvedValueOnce({ ...activeUser, intentosFallidos: 2 });
    hasher.verify.mockResolvedValue(false);
    await expect(service.login({ email: 'ada@test.dev', password: 'bad' })).rejects.toBeInstanceOf(HttpException);

    userRepo.findByEmail.mockResolvedValueOnce({ ...activeUser, intentosFallidos: 0 });
    await expect(service.login({ email: 'ada@test.dev', password: 'bad' })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('verifies email tokens and handles invalid verification states', async () => {
    const { service, userRepo, jwt } = createService();
    jwt.verifyAsync
      .mockRejectedValueOnce(new Error('bad token'))
      .mockResolvedValueOnce({ sub: 'user-1', purpose: 'reset' })
      .mockResolvedValueOnce({ sub: 'user-1', purpose: 'email_verification' })
      .mockResolvedValueOnce({ sub: 'user-2', purpose: 'email_verification' })
      .mockResolvedValueOnce({ sub: 'user-suspended', purpose: 'email_verification' })
      .mockResolvedValueOnce({ sub: 'user-3', purpose: 'email_verification' });
    userRepo.findById
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...activeUser, estado: 'ACTIVO' })
      .mockResolvedValueOnce({ ...activeUser, id: 'user-suspended', estado: 'SUSPENDIDO' })
      .mockResolvedValueOnce({ ...activeUser, id: 'user-3', estado: 'PENDIENTE' });
    userRepo.update.mockResolvedValue({ id: 'user-3', estado: 'ACTIVO' });

    await expect(service.verifyEmail('bad')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.verifyEmail('wrong-purpose')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.verifyEmail('missing-user')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.verifyEmail('already-active')).resolves.toEqual({ message: 'Tu correo ya estaba verificado.' });
    await expect(service.verifyEmail('suspended')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.verifyEmail('valid')).resolves.toEqual({ message: 'Correo verificado correctamente. Ya puedes iniciar sesion.' });
  });

  it('resends verification only for pending users', async () => {
    const { service, userRepo, mail } = createService();
    userRepo.findByEmail.mockResolvedValueOnce(null).mockResolvedValueOnce({ ...activeUser, estado: 'PENDIENTE' });

    await expect(service.resendVerificationEmail('missing@test.dev')).resolves.toEqual({
      message: 'Si la cuenta requiere verificacion, enviaremos un nuevo correo.',
    });
    await expect(service.resendVerificationEmail('ada@test.dev')).resolves.toEqual({
      message: 'Si la cuenta requiere verificacion, enviaremos un nuevo correo.',
    });
    expect(mail.sendVerificationEmail).toHaveBeenCalledTimes(1);
  });

  it('sends password reset emails without exposing account existence', async () => {
    const { service, userRepo, mail } = createService();
    userRepo.findByEmail.mockResolvedValueOnce(null).mockResolvedValueOnce(activeUser);

    await expect(service.forgotPassword({ email: 'missing@test.dev' })).resolves.toEqual({
      message: 'Si el correo existe, enviaremos un enlace para restablecer la contrasena.',
    });
    await expect(service.forgotPassword({ email: 'ada@test.dev' })).resolves.toEqual({
      message: 'Si el correo existe, enviaremos un enlace para restablecer la contrasena.',
    });
    expect(mail.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    expect(mail.sendPasswordResetEmail).toHaveBeenCalledWith('ada@test.dev', 'user-1-20m');
  });

  it('resets password with a valid password reset token', async () => {
    const { service, userRepo, jwt, hasher } = createService();
    const pwdv = 'd04b98f48e8f8bcc15c6ae5a';
    jwt.verifyAsync.mockResolvedValue({ sub: 'user-1', purpose: 'password_reset', pwdv });
    userRepo.findAuthById.mockResolvedValue(activeUser);
    hasher.hash.mockResolvedValue('new-hash');

    await expect(
      service.resetPassword({
        token: 'reset-token',
        password: 'Password123',
        confirmPassword: 'Password123',
      }),
    ).resolves.toEqual({ message: 'Contrasena actualizada correctamente. Ya puedes iniciar sesion.' });

    expect(userRepo.update).toHaveBeenCalledWith('user-1', {
      passwordHash: 'new-hash',
      intentosFallidos: 0,
      bloqueadoHasta: null,
    });
  });

  it('refreshes and revokes tokens', async () => {
    const { service, refreshTokenRepo, tokenRevocadoRepo, jwt } = createService();
    refreshTokenRepo.findByToken
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ revocado: true, expiresAt: new Date(Date.now() + 60_000), usuario: activeUser })
      .mockResolvedValueOnce({ revocado: false, expiresAt: new Date(Date.now() - 60_000), usuario: activeUser })
      .mockResolvedValueOnce({ revocado: false, expiresAt: new Date(Date.now() + 60_000), usuario: activeUser });
    jwt.decode.mockReturnValue({ exp: 2_000 });

    await expect(service.refresh('missing')).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.refresh('revoked')).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.refresh('expired')).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.refresh('valid')).resolves.toMatchObject({ accessToken: 'user-1-15m' });
    await expect(service.logout('refresh-token', 'access-token')).resolves.toEqual({ message: 'Cierre de sesión exitoso' });
    expect(refreshTokenRepo.revokeManyByToken).toHaveBeenCalledWith('refresh-token');
    expect(tokenRevocadoRepo.create).toHaveBeenCalledWith('access-token', new Date(2_000_000));
  });
});
