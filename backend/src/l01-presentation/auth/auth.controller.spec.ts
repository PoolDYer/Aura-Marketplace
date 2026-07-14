import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const createController = () => {
    const authService = {
      register: jest.fn(),
      login: jest.fn(),
      verifyEmail: jest.fn(),
      resendVerificationEmail: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
    };
    const neonAuthService = {
      getRegistrationStatus: jest.fn(),
      completeGoogleRegistration: jest.fn(),
      syncProfile: jest.fn(),
    };
    const controller = new AuthController(authService as any, neonAuthService as any);
    return { controller, authService, neonAuthService };
  };

  it('register should delegate to authService.register', async () => {
    const { controller, authService } = createController();
    authService.register.mockResolvedValue({ id: 'u1' });

    const result = await controller.register({ email: 'test@example.com' } as any);
    expect(result).toEqual({ id: 'u1' });
    expect(authService.register).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('login should delegate to authService.login', async () => {
    const { controller, authService } = createController();
    authService.login.mockResolvedValue({ accessToken: 'token' });

    const result = await controller.login({ email: 'test@example.com', password: 'pwd' });
    expect(result).toEqual({ accessToken: 'token' });
    expect(authService.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'pwd' });
  });

  it('password recovery endpoints should delegate to authService', async () => {
    const { controller, authService } = createController();
    authService.forgotPassword.mockResolvedValue({ message: 'ok' });
    authService.resetPassword.mockResolvedValue({ message: 'updated' });

    await expect(controller.forgotPassword({ email: 'test@example.com' })).resolves.toEqual({ message: 'ok' });
    await expect(
      controller.resetPassword({ token: 'token', password: 'Password123', confirmPassword: 'Password123' }),
    ).resolves.toEqual({ message: 'updated' });
    expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(authService.resetPassword).toHaveBeenCalledWith({
      token: 'token',
      password: 'Password123',
      confirmPassword: 'Password123',
    });
  });

  it('neonStatus should parse access token and call neonAuthService', async () => {
    const { controller, neonAuthService } = createController();
    neonAuthService.getRegistrationStatus.mockResolvedValue({ exists: true });

    const req = { headers: { authorization: 'Bearer my-token' } };
    const result = await controller.neonStatus(req);
    expect(result).toEqual({ exists: true });
    expect(neonAuthService.getRegistrationStatus).toHaveBeenCalledWith('my-token');
  });
});
