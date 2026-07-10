import { Injectable, Logger } from '@nestjs/common';
import { Redis } from '@upstash/redis';

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

@Injectable()
export class SimpleCacheService {
  private readonly logger = new Logger(SimpleCacheService.name);
  private readonly entries = new Map<string, CacheEntry<unknown>>();
  private readonly redis?: Redis;
  private readonly keyPrefix = process.env.CACHE_PREFIX || 'aura';

  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
      this.redis = new Redis({ url, token });
      this.logger.log('Redis cache enabled');
    } else {
      this.logger.log('Redis cache disabled; using in-memory cache');
    }
  }

  async getOrSet<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const cacheKey = this.resolveKey(key);
    const now = Date.now();
    const cached = this.entries.get(cacheKey) as CacheEntry<T> | undefined;

    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const redisValue = await this.getFromRedis<T>(cacheKey);

    if (redisValue !== undefined) {
      this.entries.set(cacheKey, { value: redisValue, expiresAt: now + ttlMs });
      return redisValue;
    }

    const value = await loader();
    this.entries.set(cacheKey, { value, expiresAt: now + ttlMs });
    await this.setInRedis(cacheKey, value, ttlMs);
    return value;
  }

  delete(key: string) {
    const cacheKey = this.resolveKey(key);
    this.entries.delete(cacheKey);
    void this.deleteFromRedis(cacheKey);
  }

  deleteByPrefix(prefix: string) {
    const cachePrefix = this.resolveKey(prefix);

    for (const key of this.entries.keys()) {
      if (key.startsWith(cachePrefix)) {
        this.entries.delete(key);
      }
    }

    void this.deleteRedisByPrefix(cachePrefix);
  }

  private resolveKey(key: string) {
    return `${this.keyPrefix}:${key}`;
  }

  private async getFromRedis<T>(key: string): Promise<T | undefined> {
    if (!this.redis) return undefined;

    try {
      const value = await this.redis.get<T>(key);
      return value === null ? undefined : value;
    } catch (error) {
      this.logger.warn(`Redis read failed for ${key}; falling back to memory`);
      return undefined;
    }
  }

  private async setInRedis<T>(key: string, value: T, ttlMs: number) {
    if (!this.redis) return;

    try {
      await this.redis.set(key, value, { ex: Math.max(1, Math.ceil(ttlMs / 1000)) });
    } catch (error) {
      this.logger.warn(`Redis write failed for ${key}; using memory only`);
    }
  }

  private async deleteFromRedis(key: string) {
    if (!this.redis) return;

    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.warn(`Redis delete failed for ${key}`);
    }
  }

  private async deleteRedisByPrefix(prefix: string) {
    if (!this.redis) return;

    try {
      const keys = await this.redis.keys(`${prefix}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.warn(`Redis prefix delete failed for ${prefix}`);
    }
  }
}
