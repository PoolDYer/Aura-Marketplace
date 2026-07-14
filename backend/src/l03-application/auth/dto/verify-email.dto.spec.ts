import { validate } from 'class-validator';
import { VerifyEmailDto, ResendVerificationDto } from './verify-email.dto';

describe('verify-email.dto', () => {
  describe('VerifyEmailDto', () => {
    it('should validate a correct token object', async () => {
      const dto = new VerifyEmailDto();
      dto.token = 'some-valid-token-string';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject missing or empty token', async () => {
      const dto = new VerifyEmailDto();
      dto.token = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('token');
    });
  });

  describe('ResendVerificationDto', () => {
    it('should validate a correct email object', async () => {
      const dto = new ResendVerificationDto();
      dto.email = 'test@example.com';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid email addresses', async () => {
      const dto = new ResendVerificationDto();
      dto.email = 'not-an-email';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });
  });
});
