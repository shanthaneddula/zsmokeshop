import { getInboxRedis } from '@/lib/inbox-redis';

function keyPart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9:@._-]/g, '').slice(0, 120) || 'unknown';
}

async function bump(key: string, windowSeconds: number): Promise<number> {
  const redis = getInboxRedis();
  if (!redis) return Number.MAX_SAFE_INTEGER;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  return count;
}

export async function isRateLimited(
  bucket: string,
  id: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  const count = await bump(`zsmokeshop:rl:${bucket}:${keyPart(id)}`, windowSeconds);
  return count > max;
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return headers.get('x-real-ip')?.trim() || 'unknown';
}
