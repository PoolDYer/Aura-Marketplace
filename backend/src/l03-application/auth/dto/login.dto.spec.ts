import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('should validate a correct login object', async () => {
    const dto = new LoginDto();
    dto.email = 'test@example.com';
    dto.password = 'Password123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject an invalid email address', async () => {
    const dto = new LoginDto();
    dto.email = 'not-an-email';
    dto.password = 'Password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should reject an empty password', async () => {
    const dto = new LoginDto();
    dto.email = 'test@example.com';
    dto.password = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });
});
