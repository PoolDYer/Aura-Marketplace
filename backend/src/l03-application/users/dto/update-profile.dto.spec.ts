import { validate } from 'class-validator';
import { UpdateProfileDto } from './update-profile.dto';

describe('UpdateProfileDto', () => {
  it('should validate an empty update profile object', async () => {
    const dto = new UpdateProfileDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate correct name and phone', async () => {
    const dto = new UpdateProfileDto();
    dto.nombre = 'Juan Perez';
    dto.telefono = '+123456789';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject empty name if provided', async () => {
    const dto = new UpdateProfileDto();
    dto.nombre = ''; // provided but empty

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(err => err.property === 'nombre')).toBe(true);
  });
});
