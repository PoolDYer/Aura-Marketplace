import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  let originalEnv: string | undefined;

  beforeAll(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  beforeEach(() => {
    service = new AppService();
  });

  it('should return health statistics with timestamp, uptime, and environment', () => {
    process.env.NODE_ENV = 'production';
    const result = service.getHealth();

    expect(result.status).toBe('ok');
    expect(result.environment).toBe('production');
    expect(result.uptime).toBeGreaterThanOrEqual(0);
    expect(new Date(result.timestamp).getTime()).not.toBeNaN();
  });

  it('should fallback to development if environment variable is not defined', () => {
    delete process.env.NODE_ENV;
    const result = service.getHealth();

    expect(result.environment).toBe('development');
  });
});
