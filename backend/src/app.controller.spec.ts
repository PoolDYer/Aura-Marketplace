import { AppController } from './app.controller';

describe('AppController', () => {
  it('should delegate health checks to AppService and return result', () => {
    const healthResult = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: 5.5,
      environment: 'test',
    };
    const appService = { getHealth: jest.fn().mockReturnValue(healthResult) };
    const controller = new AppController(appService as any);

    const result = controller.getHealth();
    expect(result).toEqual(healthResult);
    expect(appService.getHealth).toHaveBeenCalled();
  });
});
