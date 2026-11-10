/**
 * Email one-time login codes for the admin area (server-side only).
 *
 * Flow:
 *  1. requestLoginCode(email): if the email belongs to an active Redis user
 *     (zsmokeshop:users) or matches ADMIN_EMAIL (env bootstrap admin), a 6-digit
 *     code is generated, only an HMAC of it is stored in Redis for 10 minutes,
 *     and the code is emailed with Resend. Callers always get the same generic
 *     answer, so the endpoint cannot be used to discover which emails exist.
 *  2. verifyLoginCode(email, code): constant-time compare against the stored
 *     HMAC; max 5 wrong tries per code; the code is deleted on success (single use).
 */

import crypto from 'crypto';
import Redis from 'ioredis';
import { Resend } from 'resend';
import { AdminUser } from '@/types/admin';
import { User } from '@/types/users';
import { getUserByEmail, updateUserLastLogin } from './user-storage-service';

export const CODE_TTL_SECONDS = 10 * 60;
export const MAX_VERIFY_ATTEMPTS_PER_CODE = 5;
export const RATE_WINDOW_SECONDS = 15 * 60;
export const MAX_REQUESTS_PER_EMAIL = 3;
export const MAX_REQUESTS_PER_IP = 10;
export const MAX_VERIFY_FAILURES_PER_IP = 20;

const KEY_PREFIX = 'zsmokeshop:login-code';

let redisClient: Redis | null = null;
function getRedis(): Redis {
  if (!redisClient) {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL is not configured');
    }
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }
  return redisClient;
}

function getSecret(): string {
  const secret = process.env.LOGIN_CODE_SECRET || process.env.JWT_SECRET;
  if (!secret || secret === 'fallback-secret-key') {
    throw new Error('JWT_SECRET (or LOGIN_CODE_SECRET) must be set to use email login codes');
  }
  return secret;
}

export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length < 3 || trimmed.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return trimmed;
}

// Keys never contain the raw email address.
function emailKeyPart(email: string): string {
  return crypto.createHmac('sha256', getSecret()).update(`email:${email}`).digest('hex').slice(0, 32);
}

function ipKeyPart(ip: string): string {
  return crypto.createHmac('sha256', getSecret()).update(`ip:${ip}`).digest('hex').slice(0, 32);
}

function hashCode(email: string, code: string): string {
  return crypto.createHmac('sha256', getSecret()).update(`code:${email}:${code}`).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Increments a fixed-window counter and returns the new count. */
async function bumpCounter(key: string, windowSeconds: number): Promise<number> {
  const redis = getRedis();
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  return count;
}

export type LoginAccount =
  | { kind: 'redis'; user: User }
  | { kind: 'env'; user: AdminUser };

/** Finds the account a login email belongs to, or null. Only active accounts qualify. */
export async function findAccountByEmail(email: string): Promise<LoginAccount | null> {
  const redisUser = await getUserByEmail(email);
  if (redisUser && redisUser.isActive) {
    return { kind: 'redis', user: redisUser };
  }

  const envEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  const envUsername = process.env.ADMIN_USERNAME?.trim();
  if (envEmail && envUsername && envEmail === email) {
    return {
      kind: 'env',
      user: {
        id: 'admin-env',
        username: envUsername,
        role: 'admin',
        lastLogin: new Date().toISOString(),
      },
    };
  }

  return null;
}

export type CodeSender = (to: string, code: string) => Promise<void>;

export const sendCodeWithResend: CodeSender = async (to, code) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'orders@zsmokeshop.com';
  const resend = new Resend(apiKey);
  const minutes = Math.round(CODE_TTL_SECONDS / 60);

  const { error } = await resend.emails.send({
    from: `Z SMOKE SHOP <${fromEmail}>`,
    to: [to],
    subject: `Your Z Smoke Shop login code: ${code}`,
    text: `Your Z Smoke Shop admin login code is ${code}.\n\nIt expires in ${minutes} minutes and can be used once.\nIf you did not request this, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
  <h2 style="margin:0 0 16px;text-transform:uppercase;letter-spacing:1px">Z Smoke Shop</h2>
  <p>Your admin login code is:</p>
  <p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:16px 0">${code}</p>
  <p>It expires in ${minutes} minutes and can be used once.</p>
  <p style="color:#666;font-size:13px">If you did not request this, you can ignore this email.</p>
</div>`,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
};

export type RequestCodeResult = { status: 'ok' } | { status: 'rate_limited' } | { status: 'invalid_email' };

export async function requestLoginCode(
  rawEmail: unknown,
  ip: string,
  sender: CodeSender = sendCodeWithResend
): Promise<RequestCodeResult> {
  const email = normalizeEmail(rawEmail);
  if (!email) return { status: 'invalid_email' };

  // Count every request (known or unknown email) so limits reveal nothing about accounts.
  const ipCount = await bumpCounter(`${KEY_PREFIX}:rl:req-ip:${ipKeyPart(ip)}`, RATE_WINDOW_SECONDS);
  const emailCount = await bumpCounter(`${KEY_PREFIX}:rl:req-email:${emailKeyPart(email)}`, RATE_WINDOW_SECONDS);
  if (ipCount > MAX_REQUESTS_PER_IP || emailCount > MAX_REQUESTS_PER_EMAIL) {
    return { status: 'rate_limited' };
  }

  const account = await findAccountByEmail(email);
  if (!account) {
    return { status: 'ok' };
  }

  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  const codeKey = `${KEY_PREFIX}:code:${emailKeyPart(email)}`;
  const redis = getRedis();
  // A new request replaces any previous code and resets its attempt counter.
  await redis
    .multi()
    .del(codeKey)
    .hset(codeKey, { hash: hashCode(email, code), attempts: '0' })
    .expire(codeKey, CODE_TTL_SECONDS)
    .exec();

  try {
    await sender(email, code);
  } catch (error) {
    // Don't leave a code that was never delivered; still answer generically.
    await redis.del(codeKey);
    console.error('Login code email failed:', error instanceof Error ? error.message : error);
  }

  return { status: 'ok' };
}

export type VerifyCodeResult =
  | { status: 'ok'; user: User | AdminUser }
  | { status: 'invalid' }
  | { status: 'rate_limited' };

export async function verifyLoginCode(rawEmail: unknown, rawCode: unknown, ip: string): Promise<VerifyCodeResult> {
  const email = normalizeEmail(rawEmail);
  const code = typeof rawCode === 'string' ? rawCode.replace(/\s+/g, '') : '';
  const redis = getRedis();
  const ipFailKey = `${KEY_PREFIX}:rl:verify-ip:${ipKeyPart(ip)}`;

  const ipFailures = Number(await redis.get(ipFailKey)) || 0;
  if (ipFailures >= MAX_VERIFY_FAILURES_PER_IP) {
    return { status: 'rate_limited' };
  }

  const fail = async (): Promise<VerifyCodeResult> => {
    await bumpCounter(ipFailKey, RATE_WINDOW_SECONDS);
    return { status: 'invalid' };
  };

  if (!email || !/^\d{6}$/.test(code)) {
    return fail();
  }

  const codeKey = `${KEY_PREFIX}:code:${emailKeyPart(email)}`;
  const storedHash = await redis.hget(codeKey, 'hash');
  if (!storedHash) {
    return fail();
  }

  // Count the attempt before comparing so parallel guesses can't exceed the limit.
  const attempts = await redis.hincrby(codeKey, 'attempts', 1);
  if (attempts > MAX_VERIFY_ATTEMPTS_PER_CODE) {
    await redis.del(codeKey);
    return fail();
  }

  if (!safeEqualHex(hashCode(email, code), storedHash)) {
    if (attempts >= MAX_VERIFY_ATTEMPTS_PER_CODE) {
      await redis.del(codeKey);
    }
    return fail();
  }

  // Single use: only the request that actually deletes the key wins.
  const deleted = await redis.del(codeKey);
  if (deleted !== 1) {
    return fail();
  }

  // Re-check the account is still active at the moment of login.
  const account = await findAccountByEmail(email);
  if (!account) {
    return fail();
  }

  if (account.kind === 'redis') {
    await updateUserLastLogin(account.user.id);
  }

  return { status: 'ok', user: account.user };
}
