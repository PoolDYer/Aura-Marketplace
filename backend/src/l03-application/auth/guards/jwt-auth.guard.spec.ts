import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { createHttpContext } from '../../../test-utils/mock-context';

describe('JwtAuthGuard', () => {
  const createGuard = () => {
    const reflector = { getAllAndOverride: jest.fn() };
    const neonAuthService = {
      validateAccessToken: jest.fn(),
      validateLocalAccessToken: jest.fn(),
    };
    const guard = new JwtAuthGuard(reflector as any, neonAuthService as any);
    return { guard, reflector, neonAuthService };
  };

  it('should return true for public routes without validating token', async () => {
    const { guard, reflector, neonAuthService } = createGuard();
    reflector.getAllAndOverride.mockReturnValue(true); // Public route
    const context = createHttpContext();

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(neonAuthService.validateAccessToken).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if Authorization header is missing or malformed', async () => {
    const { guard, reflector } = createGuard();
    reflector.getAllAndOverride.mockReturnValue(false); // Protected route

    // Missing header
    let context = createHttpContext({ headers: {} });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

    // Malformed header (non-Bearer)
    context = createHttpContext({ headers: { authorization: 'Basic abc' } });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should validate with Neon provider first and set request.user', async () => {
    const { guard, reflector, neonAuthService } = createGuard();
    reflector.getAllAndOverride.mockReturnValue(false);
    neonAuthService.validateAccessToken.mockResolvedValue({ id: 'user-neon' });

    const req = { headers: { authorization: 'Bearer my-neon-token' } };
    const context = createHttpContext(req);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(req['user']).toEqual({ id: 'user-neon' });
    expect(neonAuthService.validateAccessToken).toHaveBeenCalledWith('my-neon-token');
    expect(neonAuthService.validateLocalAccessToken).not.toHaveBeenCalled();
  });

  it('should fallback to local validation if Neon token validation fails', async () => {
    const { guard, reflector, neonAuthService } = createGuard();
    reflector.getAllAndOverride.mockReturnValue(false);
    neonAuthService.validateAccessToken.mockRejectedValue(new Error('Not Neon'));
    neonAuthService.validateLocalAccessToken.mockResolvedValue({ id: 'user-local' });

    const req = { headers: { authorization: 'Bearer my-local-token' } };
    const context = createHttpContext(req);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(req['user']).toEqual({ id: 'user-local' });
    expect(neonAuthService.validateAccessToken).toHaveBeenCalledWith('my-local-token');
    expect(neonAuthService.validateLocalAccessToken).toHaveBeenCalledWith('my-local-token');
  });

  it('should throw exception if both Neon and local validation fail', async () => {
    const { guard, reflector, neonAuthService } = createGuard();
    reflector.getAllAndOverride.mockReturnValue(false);
    neonAuthService.validateAccessToken.mockRejectedValue(new Error('Not Neon'));
    neonAuthService.validateLocalAccessToken.mockRejectedValue(new UnauthorizedException('Invalid local token'));

    const req = { headers: { authorization: 'Bearer bad-token' } };
    const context = createHttpContext(req);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
