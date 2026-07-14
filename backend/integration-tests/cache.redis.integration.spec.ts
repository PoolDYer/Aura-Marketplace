import * as dotenv from 'dotenv';
dotenv.config();

import { SimpleCacheService } from '../src/l05-infrastructure/cache/simple-cache.service';

describe('Cache Redis Integration Test (Upstash)', () => {
  let cacheService: SimpleCacheService;

  beforeAll(() => {
    // Verify that we have the real environment variables
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('UPSTASH_REDIS_REST_URL o UPSTASH_REDIS_REST_TOKEN no configurados en .env');
    }

    cacheService = new SimpleCacheService();
  });

  it('should successfully set, get, and delete a cached key in Upstash Redis', async () => {
    const key = 'test:integration:key1';
    const value = { data: 'hello-redis-integration-test' };
    const ttlMs = 10000; // 10 seconds

    // 1. Set key
    const loader = jest.fn().mockResolvedValue(value);
    const result = await cacheService.getOrSet(key, ttlMs, loader);
    expect(result).toEqual(value);
    expect(loader).toHaveBeenCalledTimes(1);

    // 2. Get key again (should be a cache hit, loader not called)
    loader.mockClear();
    const hitResult = await cacheService.getOrSet(key, ttlMs, loader);
    expect(hitResult).toEqual(value);
    expect(loader).not.toHaveBeenCalled();

    // 3. Delete key
    cacheService.delete(key);

    // Wait a brief moment for async delete to register on Redis
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 4. Try getting key again (should be a cache miss, loader called again)
    loader.mockClear();
    const missResult = await cacheService.getOrSet(key, ttlMs, loader);
    expect(missResult).toEqual(value);
    expect(loader).toHaveBeenCalledTimes(1);

    // Clean up
    cacheService.delete(key);
  });

  it('should delete keys by prefix successfully', async () => {
    const prefix = 'test:prefix:';
    const key1 = `${prefix}k1`;
    const key2 = `${prefix}k2`;
    const otherKey = 'test:other:k3';

    const loader = jest.fn().mockResolvedValue('val');

    // 1. Set all keys
    await cacheService.getOrSet(key1, 10000, loader);
    await cacheService.getOrSet(key2, 10000, loader);
    await cacheService.getOrSet(otherKey, 10000, loader);

    // 2. Delete by prefix
    cacheService.deleteByPrefix(prefix);

    // Wait a brief moment
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 3. Verify prefix keys miss, but otherKey hits
    loader.mockClear();
    await cacheService.getOrSet(key1, 10000, loader);
    await cacheService.getOrSet(key2, 10000, loader);
    expect(loader).toHaveBeenCalledTimes(2);

    loader.mockClear();
    await cacheService.getOrSet(otherKey, 10000, loader);
    expect(loader).not.toHaveBeenCalled();

    // Clean up
    cacheService.delete(otherKey);
  });
});
