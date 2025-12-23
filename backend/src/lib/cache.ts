import Redis from 'ioredis';

/**
 * Redis client for caching
 * Falls back gracefully if Redis is not available
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false'; // Enable by default

let redis: Redis | null = null;

// Initialize Redis connection
if (REDIS_ENABLED) {
  try {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true, // Don't connect immediately
    });

    redis.connect().then(() => {
      console.log('[Redis] Connected successfully');
    }).catch((err: any) => {
      console.warn('[Redis] Connection failed, caching disabled:', err.message);
      redis = null;
    });

    redis.on('error', (err: any) => {
      console.error('[Redis] Error:', err.message);
    });
  } catch (err: any) {
    console.warn('[Redis] Initialization failed, caching disabled:', err.message);
    redis = null;
  }
}

/**
 * Redis cache wrapper with fallback
 */
export const cache = {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;

    try {
      const value = await redis.get(key);
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (err: any) {
      console.error('[Redis] Get error:', err.message);
      return null;
    }
  },

  /**
   * Set value in cache with TTL (in seconds)
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 30): Promise<void> {
    if (!redis) return;

    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (err: any) {
      console.error('[Redis] Set error:', err.message);
    }
  },

  /**
   * Delete specific key
   */
  async delete(key: string): Promise<void> {
    if (!redis) return;

    try {
      await redis.del(key);
    } catch (err: any) {
      console.error('[Redis] Delete error:', err.message);
    }
  },

  /**
   * Delete all keys matching pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    if (!redis) return;

    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (err: any) {
      console.error('[Redis] Delete pattern error:', err.message);
    }
  },

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    if (!redis) return;

    try {
      await redis.flushdb();
    } catch (err: any) {
      console.error('[Redis] Clear error:', err.message);
    }
  },

  /**
   * Check if Redis is connected
   */
  isConnected(): boolean {
    return redis !== null && redis.status === 'ready';
  },

  /**
   * Get cache statistics
   */
  async stats() {
    if (!redis) return { connected: false };

    try {
      const info = await redis.info('stats');
      const dbsize = await redis.dbsize();
      
      return {
        connected: true,
        dbsize,
        info,
      };
    } catch (err: any) {
      return { connected: false, error: err.message };
    }
  },
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (redis) {
    await redis.quit();
  }
});
