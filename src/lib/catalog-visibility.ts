// Server-only: which static catalog products are visible on the storefront.
//
// Visibility = admin override (if any) else the static default from
// src/data/catalog/compliance.ts (watermarked photos, products in doubt, etc.).
//
// Overrides live in ONE Redis key, `zsmokeshop:catalog-visibility`, as JSON:
//   { "overrides": { "<product-slug>": "show" | "hide" }, "updatedAt": "...", "updatedBy": "..." }
// Nothing else in Redis is read or written here. If Redis is unavailable the
// storefront falls back to the static defaults (fail-safe: hidden stays hidden).
import Redis from 'ioredis';
import { kv } from '@vercel/kv';
import { getAllCatalogProducts, type CatalogProduct } from '@/data/catalog';
import { getComplianceInfo, type ComplianceInfo } from '@/data/catalog/compliance';

export const CATALOG_VISIBILITY_KEY = 'zsmokeshop:catalog-visibility';

export type VisibilityOverride = 'show' | 'hide';

interface StoredVisibility {
  overrides: Record<string, VisibilityOverride>;
  updatedAt?: string;
  updatedBy?: string;
}

const CACHE_MS = 15_000;
const TIMEOUT_MS = 1_500;

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      lazyConnect: false,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: TIMEOUT_MS,
      retryStrategy: (times) => Math.min(times * 200, 5_000),
    });
    redis.on('error', () => {
      /* handled per call; avoid unhandled error spam */
    });
  }
  return redis;
}
const kvConfigured = () => !process.env.REDIS_URL && !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

let cache: { at: number; value: StoredVisibility } | null = null;
// Local dev without Redis/KV: keep overrides in memory only.
let memoryStore: StoredVisibility = { overrides: {} };

function withTimeout<T>(p: Promise<T>): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('catalog-visibility timeout')), TIMEOUT_MS)),
  ]);
}

function parse(raw: unknown): StoredVisibility {
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (obj && typeof obj === 'object' && obj !== null && 'overrides' in obj) {
      const o = (obj as StoredVisibility).overrides || {};
      const clean: Record<string, VisibilityOverride> = {};
      for (const [k, v] of Object.entries(o)) if (v === 'show' || v === 'hide') clean[k] = v;
      return { ...(obj as StoredVisibility), overrides: clean };
    }
  } catch {
    /* ignore */
  }
  return { overrides: {} };
}

// With the offline queue off, commands fail until the connection is ready; wait briefly for it.
function whenReady(r: Redis): Promise<void> {
  if (r.status === 'ready') return Promise.resolve();
  return withTimeout(new Promise<void>((resolve) => r.once('ready', () => resolve())));
}

async function readStored(): Promise<StoredVisibility> {
  const r = getRedis();
  if (r) {
    await whenReady(r);
    return parse(await withTimeout(r.get(CATALOG_VISIBILITY_KEY)));
  }
  if (kvConfigured()) return parse(await withTimeout(kv.get(CATALOG_VISIBILITY_KEY)));
  return memoryStore;
}

/** Admin overrides (cached briefly). Returns {} when storage is unreachable. */
export async function getVisibilityOverrides(fresh = false): Promise<StoredVisibility> {
  if (!fresh && cache && Date.now() - cache.at < CACHE_MS) return cache.value;
  try {
    const value = await readStored();
    cache = { at: Date.now(), value };
    return value;
  } catch (err) {
    console.warn('catalog-visibility: using static defaults:', (err as Error).message);
    if (fresh) throw err;
    return cache?.value ?? { overrides: {} };
  }
}

export function resolveHidden(p: CatalogProduct, overrides: Record<string, VisibilityOverride>, info?: ComplianceInfo) {
  const o = overrides[p.slug];
  if (o === 'hide') return true;
  if (o === 'show') return false;
  return (info ?? getComplianceInfo(p)).defaultHidden;
}

/** Slugs that must not appear anywhere on the storefront (pages, search, APIs, sitemap). */
export async function getHiddenCatalogSlugs(): Promise<Set<string>> {
  const { overrides } = await getVisibilityOverrides();
  return new Set(getAllCatalogProducts().filter((p) => resolveHidden(p, overrides)).map((p) => p.slug));
}

export interface CatalogVisibilityRow {
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  image: string;
  status: ComplianceInfo['status'];
  reasons: string[];
  defaultHidden: boolean;
  suggestHide: boolean;
  override: VisibilityOverride | null;
  hidden: boolean;
}

export async function getCatalogVisibilityRows(): Promise<{ rows: CatalogVisibilityRow[]; meta: Omit<StoredVisibility, 'overrides'>; storage: string }> {
  const stored = await getVisibilityOverrides(true);
  const rows = getAllCatalogProducts().map((p) => {
    const info = getComplianceInfo(p);
    return {
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      brandSlug: p.brandSlug,
      category: p.category,
      categorySlug: p.categorySlug,
      image: p.image,
      status: info.status,
      reasons: info.reasons,
      defaultHidden: info.defaultHidden,
      suggestHide: info.suggestHide,
      override: stored.overrides[p.slug] ?? null,
      hidden: resolveHidden(p, stored.overrides, info),
    };
  });
  return {
    rows,
    meta: { updatedAt: stored.updatedAt, updatedBy: stored.updatedBy },
    storage: getRedis() ? 'redis' : kvConfigured() ? 'kv' : 'memory (local dev only, not persisted)',
  };
}

/**
 * Set visibility for the given slugs. action 'show'/'hide' stores an override;
 * 'default' removes the override so the static default applies again.
 * Only the `zsmokeshop:catalog-visibility` key is written.
 */
export async function setCatalogVisibility(
  slugs: string[],
  action: 'show' | 'hide' | 'default',
  updatedBy?: string
): Promise<StoredVisibility> {
  const known = new Map(getAllCatalogProducts().map((p) => [p.slug, p]));
  const current = await getVisibilityOverrides(true);
  const overrides = { ...current.overrides };
  for (const slug of slugs) {
    const p = known.get(slug);
    if (!p) continue;
    if (action === 'default') {
      delete overrides[slug];
      continue;
    }
    const defaultHidden = getComplianceInfo(p).defaultHidden;
    const wantHidden = action === 'hide';
    // Only store real overrides; matching the default just clears the override.
    if (wantHidden === defaultHidden) delete overrides[slug];
    else overrides[slug] = action;
  }
  const next: StoredVisibility = { overrides, updatedAt: new Date().toISOString(), updatedBy };
  const r = getRedis();
  if (r) {
    await whenReady(r);
    await withTimeout(r.set(CATALOG_VISIBILITY_KEY, JSON.stringify(next)));
  }
  else if (kvConfigured()) await withTimeout(kv.set(CATALOG_VISIBILITY_KEY, JSON.stringify(next)));
  else memoryStore = next;
  cache = { at: Date.now(), value: next };
  return next;
}
