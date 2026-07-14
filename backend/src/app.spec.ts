import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('App health', () => {
  it('returns service health data', () => {
    process.env.NODE_ENV = 'test';
    const service = new AppService();
    const health = service.getHealth();

    expect(health).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
      uptime: expect.any(Number),
      environment: 'test',
    });
    expect(Date.parse(health.timestamp)).not.toBeNaN();
  });

  it('uses development as the default environment', () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = '';

    expect(new AppService().getHealth().environment).toBe('development');

    process.env.NODE_ENV = previousEnv;
  });

  it('delegates controller health checks to the service', () => {
    const response = { status: 'ok' };
    const service = { getHealth: jest.fn().mockReturnValue(response) } as any;

    expect(new AppController(service).getHealth()).toBe(response);
    expect(service.getHealth).toHaveBeenCalledTimes(1);
  });
});
