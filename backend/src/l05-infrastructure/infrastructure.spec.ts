jest.mock('@upstash/redis', () => {
  const redisInstance = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  };
  return {
    Redis: jest.fn(() => redisInstance),
    __redisInstance: redisInstance,
  };
});

import { of, throwError } from 'rxjs';
import { createHttpContext } from '../test-utils/mock-context';
import { AuditInterceptor } from '../l03-application/audit/audit.interceptor';
import { AuditService } from '../l03-application/audit/audit.service';
import { Argon2HasherService } from './security/argon2-hasher.service';
import { SimpleCacheService } from './cache/simple-cache.service';
import { ConsoleMailService } from './notifications/console-mail.service';
import { ResendMailService } from './notifications/resend-mail.service';
import { MockNotificationProvider } from './notifications/mock-notification.provider';
import { MockLanguageModelProvider, MockSpeechToTextProvider, MockTextToSpeechProvider } from './ai/mock-ai.providers';
import { MockStorageProvider } from './storage/mock-storage.provider';

describe('SimpleCacheService', () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.CACHE_PREFIX;
    jest.clearAllMocks();
  });

  it('loads once while in-memory cache entry is fresh and supports deletes', async () => {
    const cache = new SimpleCacheService();
    const loader = jest.fn().mockResolvedValue({ value: 1 });

    await expect(cache.getOrSet('key', 60_000, loader)).resolves.toEqual({ value: 1 });
    await expect(cache.getOrSet('key', 60_000, loader)).resolves.toEqual({ value: 1 });
    expect(loader).toHaveBeenCalledTimes(1);

    cache.delete('key');
    await cache.getOrSet('key', 60_000, loader);
    expect(loader).toHaveBeenCalledTimes(2);

    cache.deleteByPrefix('ke');
    await cache.getOrSet('key', 60_000, loader);
    expect(loader).toHaveBeenCalledTimes(3);
  });

  it('uses Redis values and tolerates Redis failures', async () => {
    const redis = jest.requireMock('@upstash/redis').__redisInstance;
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.test';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    redis.get.mockResolvedValueOnce({ from: 'redis' }).mockResolvedValueOnce(null).mockRejectedValueOnce(new Error('read'));
    redis.set.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('write'));
    redis.del.mockRejectedValueOnce(new Error('delete')).mockResolvedValue(undefined);
    redis.keys.mockResolvedValueOnce(['aura:list:1']).mockRejectedValueOnce(new Error('keys'));
    const cache = new SimpleCacheService();

    await expect(cache.getOrSet('key', 60_000, jest.fn())).resolves.toEqual({ from: 'redis' });
    await expect(cache.getOrSet('miss', 10, jest.fn().mockResolvedValue({ from: 'loader' }))).resolves.toEqual({ from: 'loader' });
    cache.delete('key');
    cache.deleteByPrefix('list:');
    await Promise.resolve();

    await expect(cache.getOrSet('fail-read', 10, jest.fn().mockResolvedValue({ fallback: true }))).resolves.toEqual({ fallback: true });
    cache.deleteByPrefix('bad:');
    await Promise.resolve();
  });

  it('uses a configured cache prefix', async () => {
    process.env.CACHE_PREFIX = 'custom';
    const cache = new SimpleCacheService();

    await cache.getOrSet('key', 60_000, jest.fn().mockResolvedValue('value'));

    expect((cache as any).entries.has('custom:key')).toBe(true);
  });
});

describe('AuditService and AuditInterceptor', () => {
  it('records audit events and swallows audit persistence failures', async () => {
    const auditRepo = { create: jest.fn().mockResolvedValue(undefined) };
    const service = new AuditService(auditRepo as any);
    const errorSpy = jest.spyOn((service as any).logger, 'error').mockImplementation();

    await service.logEvent({ usuarioId: 'u1', accion: 'POST', modulo: 'users', resultado: 'EXITO', ipCliente: '127.0.0.1' });
    auditRepo.create.mockRejectedValueOnce(new Error('db'));
    await expect(service.logEvent({ accion: 'POST', modulo: 'users', resultado: 'FALLO' })).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Error registrando evento de auditoría: db'), expect.any(String));
    errorSpy.mockRestore();
  });

  it('audits successful mutations and failed sensitive reads', (done) => {
    const audit = { logEvent: jest.fn() };
    const interceptor = new AuditInterceptor(audit as any);

    interceptor
      .intercept(createHttpContext({ method: 'POST', url: '/api/users', user: { userId: 'u1' }, ip: 'ip' }), {
        handle: () => of('ok'),
      } as any)
      .subscribe({
        next: () => {
          expect(audit.logEvent).toHaveBeenCalledWith({
            usuarioId: 'u1',
            accion: 'POST',
            modulo: 'users',
            resultado: 'EXITO',
            ipCliente: 'ip',
          });

          interceptor
            .intercept(createHttpContext({ method: 'GET', url: '/api/admin/reports', user: {}, ip: 'ip' }), {
              handle: () => throwError(() => new Error('boom')),
            } as any)
            .subscribe({
              error: () => {
                expect(audit.logEvent).toHaveBeenLastCalledWith(expect.objectContaining({ resultado: 'FALLO', modulo: 'admin' }));
                done();
              },
            });
        },
      });
  });

  it('audits requests without users and falls back to the general module', (done) => {
    const audit = { logEvent: jest.fn() };
    const interceptor = new AuditInterceptor(audit as any);

    interceptor
      .intercept(createHttpContext({ method: 'POST', url: '/', ip: 'ip' }), {
        handle: () => of('ok'),
      } as any)
      .subscribe({
        next: () => {
          expect(audit.logEvent).toHaveBeenCalledWith({
            usuarioId: undefined,
            accion: 'POST',
            modulo: 'general',
            resultado: 'EXITO',
            ipCliente: 'ip',
          });

          interceptor
            .intercept(createHttpContext({ method: 'POST', url: '/', ip: 'ip' }), {
              handle: () => throwError(() => new Error('boom')),
            } as any)
            .subscribe({
              error: () => {
                expect(audit.logEvent).toHaveBeenLastCalledWith({
                  usuarioId: undefined,
                  accion: 'POST',
                  modulo: 'general',
                  resultado: 'FALLO',
                  ipCliente: 'ip',
                });
                done();
              },
            });
        },
      });
  });
});

describe('mock infrastructure providers', () => {
  it('hashes and verifies passwords with argon2', async () => {
    const hasher = new Argon2HasherService();
    const hash = await hasher.hash('secret');

    await expect(hasher.verify(hash, 'secret')).resolves.toBe(true);
    await expect(hasher.verify(hash, 'bad')).resolves.toBe(false);
  });

  it('returns deterministic mock AI responses', async () => {
    const llm = new MockLanguageModelProvider();

    await expect(llm.generateResponse('hola')).resolves.toContain('hola');
    await expect(llm.extractEntities('zapatos')).resolves.toMatchObject({ intent: 'buscar_producto' });
    await expect(llm.generateCopilotResponse('hola', [], [])).resolves.toMatchObject({ action: { type: 'none' }, products: [] });
    await expect(new MockSpeechToTextProvider().transcribe(Buffer.from('audio'))).resolves.toContain('transcrito');
    await expect(new MockTextToSpeechProvider().synthesize('hola')).resolves.toEqual(Buffer.from('mock-audio-data'));
  });

  it('sends mock notifications and generates mock storage urls', async () => {
    jest.useFakeTimers();
    const notificationPromise = new MockNotificationProvider().sendNotification('u1', 'EMAIL', 'SEGURIDAD', 'hola');
    const storagePromise = new MockStorageProvider().generatePresignedUrl('image.png');
    await jest.runAllTimersAsync();

    await expect(notificationPromise).resolves.toBe(true);
    await expect(storagePromise).resolves.toMatchObject({
      uploadUrl: expect.stringContaining('https://mock-r2-upload.local/'),
      publicUrl: expect.stringContaining('https://mock-cdn.local/'),
    });
    jest.useRealTimers();
  });

  it('uses simulated mail when Resend is not configured', async () => {
    delete process.env.RESEND_API_KEY;
    process.env.FRONTEND_URL = 'https://front.test';

    await expect(new ConsoleMailService().sendVerificationEmail('ada@test.dev', 'token value')).resolves.toBeUndefined();
    delete process.env.FRONTEND_URL;
  });

  it('sends mail through Resend and reports provider failures', async () => {
    process.env.RESEND_API_KEY = 'key';
    const fetchMock = jest.fn().mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: jest.fn().mockResolvedValue('bad request'),
    });
    const originalFetch = global.fetch;
    global.fetch = fetchMock as any;
    const service = new ResendMailService();
    const errorSpy = jest.spyOn((service as any).logger, 'error').mockImplementation();

    await expect(service.sendVerificationEmail('ada@test.dev', 'token')).resolves.toBeUndefined();
    await expect(service.sendVerificationEmail('ada@test.dev', 'token')).rejects.toThrow('No se pudo enviar el correo de verificacion');
    expect(errorSpy).toHaveBeenCalledWith('Resend rejected verification email: 400 bad request');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer key' }),
      }),
    );

    global.fetch = originalFetch;
    delete process.env.RESEND_API_KEY;
    errorSpy.mockRestore();
  });
});
