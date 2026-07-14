import { RolesGuard } from './roles.guard';
import { createHttpContext } from '../../../test-utils/mock-context';
import { RolUsuario } from '../../../l04-domain/auth/usuario.entity';

describe('RolesGuard', () => {
  const createGuard = () => {
    const reflector = { getAllAndOverride: jest.fn() };
    const guard = new RolesGuard(reflector as any);
    return { guard, reflector };
  };

  it('should return true if no roles are required', () => {
    const { guard, reflector } = createGuard();
    reflector.getAllAndOverride.mockReturnValue(null); // No metadata

    const context = createHttpContext();
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return true if user role matches one of the required roles', () => {
    const { guard, reflector } = createGuard();
    reflector.getAllAndOverride.mockReturnValue([RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDOR]);

    const req = { user: { rol: RolUsuario.VENDEDOR } };
    const context = createHttpContext(req);
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return false if user role does not match required roles', () => {
    const { guard, reflector } = createGuard();
    reflector.getAllAndOverride.mockReturnValue([RolUsuario.ADMINISTRADOR]);

    const req = { user: { rol: RolUsuario.COMPRADOR } };
    const context = createHttpContext(req);
    const result = guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should return false if user is missing from request', () => {
    const { guard, reflector } = createGuard();
    reflector.getAllAndOverride.mockReturnValue([RolUsuario.COMPRADOR]);

    const req = {}; // No user object
    const context = createHttpContext(req);
    const result = guard.canActivate(context);
    expect(result).toBe(false);
  });
});
