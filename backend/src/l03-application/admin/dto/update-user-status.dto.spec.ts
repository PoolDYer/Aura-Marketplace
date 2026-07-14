import { validate } from 'class-validator';
import { UpdateUserStatusDto } from './update-user-status.dto';
import { EstadoUsuario } from '../../../l04-domain/auth/usuario.entity';

describe('UpdateUserStatusDto', () => {
  it('should validate a correct status update', async () => {
    const dto = new UpdateUserStatusDto();
    dto.estado = EstadoUsuario.SUSPENDIDO;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject missing or invalid status', async () => {
    const dto = new UpdateUserStatusDto();
    // Missing status
    let errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(err => err.property === 'estado')).toBe(true);

    // Invalid status
    (dto as any).estado = 'INVALID_STATUS';
    errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(err => err.property === 'estado')).toBe(true);
  });
});
