import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';
import { RolUsuario } from '../../../l04-domain/auth/usuario.entity';

describe('RegisterDto', () => {
  it('should validate a correct register object', async () => {
    const dto = new RegisterDto();
    dto.nombre = 'Juan Perez';
    dto.email = 'juan@example.com';
    dto.rol = RolUsuario.COMPRADOR;
    dto.password = 'Password123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject missing nombre', async () => {
    const dto = new RegisterDto();
    dto.nombre = '';
    dto.email = 'juan@example.com';
    dto.password = 'Password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(err => err.property === 'nombre')).toBe(true);
  });

  it('should reject invalid email', async () => {
    const dto = new RegisterDto();
    dto.nombre = 'Juan Perez';
    dto.email = 'not-an-email';
    dto.password = 'Password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(err => err.property === 'email')).toBe(true);
  });

  it('should reject invalid password criteria', async () => {
    // Short password
    const dto1 = new RegisterDto();
    dto1.nombre = 'Juan Perez';
    dto1.email = 'juan@example.com';
    dto1.password = 'Pass1';

    let errors = await validate(dto1);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(err => err.property === 'password')).toBe(true);

    // No capital letter
    const dto2 = new RegisterDto();
    dto2.nombre = 'Juan Perez';
    dto2.email = 'juan@example.com';
    dto2.password = 'password123';

    errors = await validate(dto2);
    expect(errors.length).toBeGreaterThan(0);

    // No number
    const dto3 = new RegisterDto();
    dto3.nombre = 'Juan Perez';
    dto3.email = 'juan@example.com';
    dto3.password = 'Password';

    errors = await validate(dto3);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should allow optional role but reject invalid roles', async () => {
    const dto = new RegisterDto();
    dto.nombre = 'Juan Perez';
    dto.email = 'juan@example.com';
    dto.password = 'Password123';
    
    // role omitted is fine
    let errors = await validate(dto);
    expect(errors.length).toBe(0);

    // invalid role
    (dto as any).rol = 'INVALID_ROLE';
    errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(err => err.property === 'rol')).toBe(true);
  });
});
