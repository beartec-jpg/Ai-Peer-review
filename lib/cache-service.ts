// lib/cache-service.ts
// Redis-based caching service for peer review results

import { createHash } from 'crypto';
import type { Result, CacheStats } from './types';
import type Redis from 'ioredis';

// In-memory cache as fallback (for development without Redis)
const memoryCache = new Map<string, { result: Result; timestamp: number; ttl: number }>();
let cacheStats = {
  totalQueries: 0,
  cacheHits: 0,
  cacheMisses: 0,
};

// Redis client (lazy initialization)
let redisClient: Redis | null = null;

// Initialize Redis client if REDIS_URL is available
const getRedisClient = async () => {
  if (redisClient) return redisClient;
  
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl || redisUrl === 'redis://localhost:6379') {
    console.log('Redis not configured, using in-memory cache');
    return null;
  }

  try {
    const Redis = (await import('ioredis')).default;
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });
    
    await redisClient.connect();
    console.log('Redis connected successfully');
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    return null;
  }
};

// Generate cache key from query (consistent hashing)
export const generateCacheKey = (query: string): string => {
  const normalized = query.trim().toLowerCase();
  const hash = createHash('sha256').update(normalized).digest('hex');
  return `peer-review:${hash}`;
};

// Get cached result
export const getCachedResult = async (query: string): Promise<Result | null> => {
  const key = generateCacheKey(query);
  cacheStats.totalQueries++;

  try {
    const redis = await getRedisClient();
    
    if (redis) {
      // Use Redis
      const cached = await redis.get(key);
      if (cached) {
        cacheStats.cacheHits++;
        return JSON.parse(cached) as Result;
      }
    } else {
      // Use memory cache
      const cached = memoryCache.get(key);
      if (cached) {
        const now = Date.now() / 1000;
        if (now - cached.timestamp < cached.ttl) {
          cacheStats.cacheHits++;
          return cached.result;
        } else {
          // Expired
          memoryCache.delete(key);
        }
      }
    }

    cacheStats.cacheMisses++;
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    cacheStats.cacheMisses++;
    return null;
  }
};

// Store result in cache
export const setCachedResult = async (query: string, result: Result): Promise<void> => {
  const key = generateCacheKey(query);
  const ttl = parseInt(process.env.CACHE_TTL || '86400', 10); // Default 24 hours

  try {
    const redis = await getRedisClient();
    
    if (redis) {
      // Use Redis with TTL
      await redis.setex(key, ttl, JSON.stringify(result));
    } else {
      // Use memory cache
      memoryCache.set(key, {
        result,
        timestamp: Date.now() / 1000,
        ttl,
      });
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

// Clear specific cache entry
export const clearCacheEntry = async (query: string): Promise<void> => {
  const key = generateCacheKey(query);

  try {
    const redis = await getRedisClient();
    
    if (redis) {
      await redis.del(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};

// Clear all cache
export const clearAllCache = async (): Promise<void> => {
  try {
    const redis = await getRedisClient();
    
    if (redis) {
      const keys = await redis.keys('peer-review:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      memoryCache.clear();
    }
    
    // Reset stats
    cacheStats = {
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  } catch (error) {
    console.error('Cache clear all error:', error);
  }
};

// Get cache statistics
export const getCacheStats = async (): Promise<CacheStats> => {
  try {
    const redis = await getRedisClient();
    let cacheSize = 0;

    if (redis) {
      const keys = await redis.keys('peer-review:*');
      cacheSize = keys.length;
    } else {
      cacheSize = memoryCache.size;
    }

    const hitRate = cacheStats.totalQueries > 0
      ? (cacheStats.cacheHits / cacheStats.totalQueries) * 100
      : 0;

    return {
      totalQueries: cacheStats.totalQueries,
      cacheHits: cacheStats.cacheHits,
      cacheMisses: cacheStats.cacheMisses,
      hitRate: Math.round(hitRate * 100) / 100,
      cacheSize,
    };
  } catch (error) {
    console.error('Get cache stats error:', error);
    return {
      totalQueries: cacheStats.totalQueries,
      cacheHits: cacheStats.cacheHits,
      cacheMisses: cacheStats.cacheMisses,
      hitRate: 0,
      cacheSize: 0,
    };
  }
};
