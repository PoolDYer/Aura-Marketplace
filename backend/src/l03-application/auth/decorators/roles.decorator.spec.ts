import { Roles, ROLES_KEY } from './roles.decorator';
import { RolUsuario } from '../../../l04-domain/auth/usuario.entity';

describe('Roles decorator', () => {
  it('should set metadata roles on decorated method', () => {
    class TestController {
      @Roles(RolUsuario.ADMINISTRADOR)
      adminEndpoint() {}

      @Roles(RolUsuario.COMPRADOR, RolUsuario.VENDEDOR)
      multiRoleEndpoint() {}

      noRoleEndpoint() {}
    }

    const controller = new TestController();

    const adminRoles = Reflect.getMetadata(ROLES_KEY, controller.adminEndpoint);
    expect(adminRoles).toEqual([RolUsuario.ADMINISTRADOR]);

    const multiRoles = Reflect.getMetadata(ROLES_KEY, controller.multiRoleEndpoint);
    expect(multiRoles).toEqual([RolUsuario.COMPRADOR, RolUsuario.VENDEDOR]);

    const noRoles = Reflect.getMetadata(ROLES_KEY, controller.noRoleEndpoint);
    expect(noRoles).toBeUndefined();
  });
});
