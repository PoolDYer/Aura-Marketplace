import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { createHttpContext } from '../../../test-utils/mock-context';

describe('JwtAuthGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
  const neonAuthService = {
    validateAccessToken: jest.fn(),
    validateLocalAccessToken: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('allows public routes', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(new JwtAuthGuard(reflector, neonAuthService as any).canActivate(createHttpContext())).resolves.toBe(true);
  });

  it('rejects requests without bearer token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    await expect(
      new JwtAuthGuard(reflector, neonAuthService as any).canActivate(createHttpContext({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches Neon user when Neon token validation succeeds', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    neonAuthService.validateAccessToken.mockResolvedValue({ id: 'user-1' });
    const request = { headers: { authorization: 'Bearer neon-token' } };

    await expect(new JwtAuthGuard(reflector, neonAuthService as any).canActivate(createHttpContext(request))).resolves.toBe(true);
    expect(request).toMatchObject({ user: { id: 'user-1' } });
  });

  it('falls back to local token validation when Neon validation fails', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    neonAuthService.validateAccessToken.mockRejectedValue(new Error('invalid'));
    neonAuthService.validateLocalAccessToken.mockResolvedValue({ id: 'local-1' });
    const request: any = { headers: { authorization: 'Bearer local-token' } };

    await new JwtAuthGuard(reflector, neonAuthService as any).canActivate(createHttpContext(request));

    expect(request.user).toEqual({ id: 'local-1' });
    expect(neonAuthService.validateLocalAccessToken).toHaveBeenCalledWith('local-token');
  });
});

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;

  beforeEach(() => jest.clearAllMocks());

  it('allows routes without role metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(new RolesGuard(reflector).canActivate(createHttpContext({ user: { rol: 'COMPRADOR' } }))).toBe(true);
  });

  it('allows matching roles and rejects mismatches', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMINISTRADOR']);
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createHttpContext({ user: { rol: 'ADMINISTRADOR' } }))).toBe(true);
    expect(guard.canActivate(createHttpContext({ user: { rol: 'COMPRADOR' } }))).toBe(false);
    expect(guard.canActivate(createHttpContext({}))).toBe(false);
  });
});
