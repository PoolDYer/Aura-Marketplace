import { MockNotificationProvider } from './mock-notification.provider';

describe('MockNotificationProvider', () => {
  it('should log and return true after delay', async () => {
    const provider = new MockNotificationProvider();
    const loggerSpy = jest.spyOn((provider as any).logger, 'log').mockImplementation();

    const result = await provider.sendNotification('user-1', 'SMS', 'MARKETING', 'Hello user');
    expect(result).toBe(true);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Enviando notificación [MARKETING] por canal [SMS] al usuario user-1: Hello user')
    );

    loggerSpy.mockRestore();
  });
});
