import { validate } from 'class-validator';
import { UpdatePreferencesDto } from './update-preferences.dto';

describe('UpdatePreferencesDto', () => {
  it('should validate an empty or correct preferences update object', async () => {
    const dto = new UpdatePreferencesDto();
    let errors = await validate(dto);
    expect(errors.length).toBe(0);

    dto.notifNuevaOrden = true;
    dto.notifEstadoOrden = false;
    dto.notifMarketing = true;
    errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject non-boolean preference choices', async () => {
    const dto = new UpdatePreferencesDto();
    dto.notifMarketing = 'yes' as any; // Invalid type

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(err => err.property === 'notifMarketing')).toBe(true);
  });
});
