import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Test } from '@nestjs/testing';
import { ResendMailService } from '../src/l05-infrastructure/notifications/resend-mail.service';

describe('Resend Email Integration Test', () => {
  let mailService: ResendMailService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ResendMailService],
    }).compile();

    mailService = moduleRef.get(ResendMailService);
  });

  it('should send email using Resend if API key is present, otherwise throw key not configured', async () => {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // Expect it to throw the configuration error
      await expect(
        mailService.sendVerificationEmail('test@aura.com', 'dummy-verification-token'),
      ).rejects.toThrow('RESEND_API_KEY no configurado');
      console.log('Resend integration test verified fallback: RESEND_API_KEY is not configured.');
    } else {
      // Call the real API
      await expect(
        mailService.sendVerificationEmail('test-resend-integration@aura.com', 'dummy-verification-token'),
      ).resolves.toBeUndefined();
    }
  });
});
