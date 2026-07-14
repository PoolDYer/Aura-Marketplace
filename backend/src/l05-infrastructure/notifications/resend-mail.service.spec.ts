import { ResendMailService } from './resend-mail.service';

describe('ResendMailService', () => {
  let mailService: ResendMailService;
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    mailService = new ResendMailService();
    process.env.RESEND_API_KEY = 'resend-api-key-test';
  });

  it('calls the Resend API when RESEND_API_KEY is present', async () => {
    const mockResponse = { ok: true } as Response;
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

    await mailService.sendVerificationEmail('test@user.com', 'my-token-123');

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer resend-api-key-test',
        }),
      }),
    );

    fetchSpy.mockRestore();
  });

  it('throws if Resend is not configured', async () => {
    delete process.env.RESEND_API_KEY;

    await expect(mailService.sendVerificationEmail('test@user.com', 'my-token-123')).rejects.toThrow(
      'RESEND_API_KEY no configurado',
    );
  });

  it('throws an error if Resend rejects the email', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      text: jest.fn().mockResolvedValue('API Error details'),
    } as any;
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
    const loggerErrorSpy = jest.spyOn((mailService as any).logger, 'error').mockImplementation();

    await expect(mailService.sendVerificationEmail('test@user.com', 'my-token-123')).rejects.toThrow(
      'No se pudo enviar el correo de verificacion',
    );

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Resend rejected verification email: 400 API Error details',
    );

    fetchSpy.mockRestore();
    loggerErrorSpy.mockRestore();
  });
});
