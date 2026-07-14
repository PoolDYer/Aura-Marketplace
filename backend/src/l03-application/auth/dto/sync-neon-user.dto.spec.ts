import { validate } from 'class-validator';
import { SyncNeonUserDto, CompleteGoogleRegistrationDto } from './sync-neon-user.dto';
import { RolUsuario } from '../../../l04-domain/auth/usuario.entity';

describe('sync-neon-user.dto', () => {
  describe('SyncNeonUserDto', () => {
    it('should validate an empty or correct sync object', async () => {
      const dto = new SyncNeonUserDto();
      let errors = await validate(dto);
      expect(errors.length).toBe(0);

      dto.nombre = 'Al';
      dto.rol = RolUsuario.COMPRADOR;
      errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject short nombre', async () => {
      const dto = new SyncNeonUserDto();
      dto.nombre = 'A'; // less than 2 chars

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(err => err.property === 'nombre')).toBe(true);
    });

    it('should reject invalid role options', async () => {
      const dto = new SyncNeonUserDto();
      dto.rol = 'ADMINISTRADOR' as any; // not in ['COMPRADOR', 'VENDEDOR']

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(err => err.property === 'rol')).toBe(true);
    });
  });

  describe('CompleteGoogleRegistrationDto', () => {
    it('should validate a correct complete registration object', async () => {
      const dto = new CompleteGoogleRegistrationDto();
      dto.nombre = 'Ada';
      dto.password = 'SuperSecret123';
      dto.rol = RolUsuario.VENDEDOR;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should require nombre and password with min limits', async () => {
      const dto = new CompleteGoogleRegistrationDto();
      // missing nombre & password
      let errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      dto.nombre = 'A';
      dto.password = '123';
      errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
