import { Redis } from "@upstash/redis"

// Create Redis client (singleton)
let redis: Redis | null = null

export function getRedis(): Redis | null {
  // Return null if Redis is not configured (falls back to in-memory)
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }

  return redis
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

// Cache key prefixes
export const CACHE_KEYS = {
  STUDIOS: "studios:",
  STUDIO: "studio:",
  USER: "user:",
  BOOKINGS: "bookings:",
  FAVORITES: "favorites:",
  NOTIFICATIONS: "notifications:",
  MESSAGES: "messages:",
} as const

/**
 * Get cached data from Redis
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedis()
  if (!client) return null

  try {
    const data = await client.get<T>(key)
    return data
  } catch (error) {
    console.error("Redis get error:", error)
    return null
  }
}

/**
 * Set cached data in Redis
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttlSeconds - Time to live in seconds (default: 60)
 */
export async function setCache<T>(key: string, data: T, ttlSeconds = 60): Promise<void> {
  const client = getRedis()
  if (!client) return

  try {
    await client.setex(key, ttlSeconds, data)
  } catch (error) {
    console.error("Redis set error:", error)
  }
}

/**
 * Delete cached data from Redis
 */
export async function deleteCache(key: string): Promise<void> {
  const client = getRedis()
  if (!client) return

  try {
    await client.del(key)
  } catch (error) {
    console.error("Redis delete error:", error)
  }
}

/**
 * Delete all cached data matching a pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  const client = getRedis()
  if (!client) return

  try {
    // Use SCAN to find matching keys (safer than KEYS for large datasets)
    let cursor: string | number = 0
    do {
      const result = await client.scan(cursor as number, { match: pattern, count: 100 })
      cursor = result[0]
      const keys = result[1]

      if (keys.length > 0) {
        await client.del(...keys)
      }
    } while (cursor !== 0 && cursor !== "0")
  } catch (error) {
    console.error("Redis invalidate error:", error)
  }
}

// Cache TTL presets (in seconds)
export const CACHE_TTL = {
  // Very short - for frequently changing data like messages
  SHORT: 30,
  // Standard - for semi-static data
  STANDARD: 60,
  // Medium - for slower changing data like studio listings
  MEDIUM: 300,
  // Long - for mostly static data like user profiles
  LONG: 900,
  // Very long - for static data
  STATIC: 3600,
} as const
