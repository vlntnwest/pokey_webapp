/**
 * Redis cache wrapper.
 * Falls back to a no-op if REDIS_URL is not set or Redis is unavailable.
 */

const logger = require("../logger");

const REDIS_URL = process.env.REDIS_URL;
const DEFAULT_TTL = 300; // 5 minutes

let redis = null;

if (REDIS_URL) {
  const Redis = require("ioredis");
  redis = new Redis(REDIS_URL, { lazyConnect: true, enableOfflineQueue: false });
  redis.on("error", (err) => {
    logger.warn({ err: err.message }, "Redis connection error — cache disabled");
    redis = null;
  });
}

async function get(key) {
  if (!redis) return null;
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

async function set(key, value, ttl = DEFAULT_TTL) {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch {
    // ignore
  }
}

async function del(...keys) {
  if (!redis) return;
  try {
    await redis.del(...keys);
  } catch {
    // ignore
  }
}

module.exports = { get, set, del };
