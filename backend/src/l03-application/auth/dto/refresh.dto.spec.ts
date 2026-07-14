import { validate } from 'class-validator';
import { RefreshDto } from './refresh.dto';

describe('RefreshDto', () => {
  it('should validate a correct refresh token object', async () => {
    const dto = new RefreshDto();
    dto.refreshToken = 'some-valid-token';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject missing or empty refresh token', async () => {
    const dto = new RefreshDto();
    dto.refreshToken = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('refreshToken');
  });
});
