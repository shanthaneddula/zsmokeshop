import Redis from 'ioredis';

const TIMEOUT_MS = 2_000;

let redis: Redis | null = null;
let warned = false;

export function getInboxRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      lazyConnect: false,
      enableOfflineQueue: true,
      maxRetriesPerRequest: 3,
      connectTimeout: TIMEOUT_MS,
      retryStrategy: (times) => Math.min(times * 200, 5_000),
    });
    redis.on('error', () => {
      /* per-call handling; avoid unhandled error spam */
    });
  }
  return redis;
}

export function requireInboxRedis(): Redis {
  const client = getInboxRedis();
  if (!client) {
    if (!warned) {
      console.error('Inbox Redis is not configured (REDIS_URL missing)');
      warned = true;
    }
    throw new Error('Storage is not configured');
  }
  return client;
}
