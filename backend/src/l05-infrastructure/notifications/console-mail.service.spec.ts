import { ConsoleMailService } from './console-mail.service';

describe('ConsoleMailService', () => {
  let mailService: ConsoleMailService;
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    mailService = new ConsoleMailService();
  });

  it('sends a simulated email to the logger', async () => {
    const loggerSpy = jest.spyOn((mailService as any).logger, 'log').mockImplementation();

    await mailService.sendVerificationEmail('test@user.com', 'my-token-123');

    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('CORREO SIMULADO'));
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('test@user.com'));
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('my-token-123'));

    loggerSpy.mockRestore();
  });

  it('sends a simulated password reset email to the logger', async () => {
    const loggerSpy = jest.spyOn((mailService as any).logger, 'log').mockImplementation();

    await mailService.sendPasswordResetEmail('test@user.com', 'reset-token-123');

    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Restablecer Contrasena'));
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('test@user.com'));
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('reset-token-123'));

    loggerSpy.mockRestore();
  });
});
