import { SimpleCacheService } from './simple-cache.service';

describe('SimpleCacheService Colocated Edge Cases', () => {
  let cacheService: SimpleCacheService;
  const originalRedisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const originalRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const originalCachePrefix = process.env.CACHE_PREFIX;

  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.CACHE_PREFIX = `test-${Date.now()}-${Math.random()}`;
    cacheService = new SimpleCacheService();
  });

  afterAll(() => {
    if (originalRedisUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = originalRedisUrl;

    if (originalRedisToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = originalRedisToken;

    if (originalCachePrefix === undefined) delete process.env.CACHE_PREFIX;
    else process.env.CACHE_PREFIX = originalCachePrefix;
  });

  it('getOrSet should cache and return value from loader on cache miss', async () => {
    const loader = jest.fn().mockResolvedValue('value-123');

    // Miss
    let val = await cacheService.getOrSet('key1', 5000, loader);
    expect(val).toBe('value-123');
    expect(loader).toHaveBeenCalledTimes(1);

    // Hit
    val = await cacheService.getOrSet('key1', 5000, loader);
    expect(val).toBe('value-123');
    expect(loader).toHaveBeenCalledTimes(1); // Still 1
  });

  it('delete should clear a specific cached key', async () => {
    const loader = jest.fn().mockResolvedValue('value-456');

    await cacheService.getOrSet('key2', 5000, loader);
    cacheService.delete('key2');

    // Should miss again
    await cacheService.getOrSet('key2', 5000, loader);
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('deleteByPrefix should delete all keys starting with prefix', async () => {
    const loader = jest.fn().mockResolvedValue('data');

    await cacheService.getOrSet('prefix:key1', 5000, loader);
    await cacheService.getOrSet('prefix:key2', 5000, loader);
    await cacheService.getOrSet('other:key3', 5000, loader);

    cacheService.deleteByPrefix('prefix:');

    // Should miss on prefix:key1 and prefix:key2
    loader.mockClear();
    await cacheService.getOrSet('prefix:key1', 5000, loader);
    await cacheService.getOrSet('prefix:key2', 5000, loader);
    expect(loader).toHaveBeenCalledTimes(2);

    // Should hit on other:key3
    loader.mockClear();
    await cacheService.getOrSet('other:key3', 5000, loader);
    expect(loader).not.toHaveBeenCalled();
  });
});
