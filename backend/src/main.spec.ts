import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { bootstrap, getConfiguredOrigins, isAllowedOrigin } from './main';

jest.mock('@nestjs/core', () => ({
  NestFactory: { create: jest.fn() },
}));

jest.mock('@nestjs/swagger', () => {
  const actual = jest.requireActual('@nestjs/swagger');
  const chain = {
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({ openapi: 'config' }),
  };

  return {
    ...actual,
    DocumentBuilder: jest.fn(() => chain),
    SwaggerModule: {
      createDocument: jest.fn().mockReturnValue({ doc: true }),
      setup: jest.fn(),
    },
  };
});

describe('main bootstrap', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('normalizes configured CORS origins and allows trusted origins', () => {
    process.env.FRONTEND_URL = 'https://app.test';
    process.env.CORS_ALLOWED_ORIGINS = ' https://one.test,https://two.test ';

    expect(getConfiguredOrigins()).toEqual(
      expect.arrayContaining(['https://app.test', 'https://one.test', 'https://two.test']),
    );
    expect(isAllowedOrigin()).toBe(true);
    expect(isAllowedOrigin('https://app.test')).toBe(true);
    expect(isAllowedOrigin('https://aura-marketplace-demo-pooldyers-projects.vercel.app')).toBe(true);
    expect(isAllowedOrigin('https://evil.test')).toBe(false);
  });

  it('configures Nest, CORS, static assets, Swagger and port', async () => {
    process.env.PORT = '4010';
    const app = {
      useGlobalPipes: jest.fn(),
      enableCors: jest.fn(),
      useStaticAssets: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };
    (NestFactory.create as jest.Mock).mockResolvedValue(app);

    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledWith(expect.any(Function), { rawBody: true });
    expect(app.useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));
    expect(app.enableCors).toHaveBeenCalledWith(expect.objectContaining({ credentials: true }));
    expect(app.useStaticAssets).toHaveBeenCalledWith(expect.stringContaining('uploads'), { prefix: '/uploads/' });
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(app, { openapi: 'config' });
    expect(SwaggerModule.setup).toHaveBeenCalledWith('api/docs', app, { doc: true });
    expect(app.listen).toHaveBeenCalledWith('4010');

    const corsOptions = app.enableCors.mock.calls[0][0];
    const callback = jest.fn();
    corsOptions.origin('http://localhost:5173', callback);
    expect(callback).toHaveBeenCalledWith(null, true);
    corsOptions.origin('https://evil.test', callback);
    expect(callback).toHaveBeenCalledWith(expect.any(Error), false);

    delete process.env.PORT;
    await bootstrap();
    expect(app.listen).toHaveBeenLastCalledWith(3000);
  });
});
