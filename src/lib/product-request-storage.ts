import { PRODUCT_REQUEST_STATUSES, type ProductRequestStatus } from '@/lib/inbox-config';
import { requireInboxRedis } from '@/lib/inbox-redis';
import type { InboxNote, InboxTimelineEvent, ProductRequest } from '@/types/inbox';

const PREFIX = 'zsmokeshop:product-request:';
const INDEX = 'zsmokeshop:product-request:ids';
const STATUS_PREFIX = 'zsmokeshop:product-request:status:';

function keyFor(id: string): string {
  return `${PREFIX}${id}`;
}

function statusKey(status: ProductRequestStatus): string {
  return `${STATUS_PREFIX}${status}`;
}

async function read(id: string): Promise<ProductRequest | null> {
  const redis = requireInboxRedis();
  const raw = await redis.get(keyFor(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProductRequest;
  } catch {
    return null;
  }
}

function event(
  by: string,
  type: InboxTimelineEvent['type'],
  detail: string,
  at = new Date().toISOString()
): InboxTimelineEvent {
  return { id: crypto.randomUUID(), at, by, type, detail };
}

export async function createProductRequest(
  data: Omit<ProductRequest, 'status' | 'notes' | 'timeline' | 'createdAt' | 'updatedAt' | 'closedAt'>
): Promise<ProductRequest> {
  const redis = requireInboxRedis();
  const now = new Date().toISOString();
  const record: ProductRequest = {
    ...data,
    status: 'new',
    notes: [],
    timeline: [event('customer', 'created', 'Request submitted', now)],
    createdAt: now,
    updatedAt: now,
  };
  const score = Date.parse(now);
  await redis
    .multi()
    .set(keyFor(record.id), JSON.stringify(record))
    .zadd(INDEX, score, record.id)
    .zadd(statusKey('new'), score, record.id)
    .exec();
  return record;
}

export async function getProductRequest(id: string): Promise<ProductRequest | null> {
  return read(id);
}

export async function productRequestExists(id: string): Promise<boolean> {
  const redis = requireInboxRedis();
  return (await redis.exists(keyFor(id))) === 1;
}

export async function listProductRequests(options?: {
  status?: ProductRequestStatus | 'all';
  query?: string;
}): Promise<ProductRequest[]> {
  const redis = requireInboxRedis();
  const status = options?.status && options.status !== 'all' ? options.status : undefined;
  const ids = status
    ? await redis.zrevrange(statusKey(status), 0, -1)
    : await redis.zrevrange(INDEX, 0, -1);
  if (ids.length === 0) return [];
  const raw = await redis.mget(ids.map(keyFor));
  const items = raw
    .map((value) => {
      if (!value) return null;
      try {
        return JSON.parse(value) as ProductRequest;
      } catch {
        return null;
      }
    })
    .filter((item): item is ProductRequest => Boolean(item));

  const query = options?.query?.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) => {
    const haystack = [
      item.productName,
      item.brand,
      item.details,
      item.customerName,
      item.email,
      item.phone,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });
}

export async function updateProductRequest(
  id: string,
  updates: {
    status?: ProductRequestStatus;
    note?: { by: string; text: string };
    emailed?: { by: string; detail: string };
    texted?: { by: string; detail?: string };
  }
): Promise<ProductRequest | null> {
  const redis = requireInboxRedis();
  const current = await read(id);
  if (!current) return null;

  const now = new Date().toISOString();
  const next: ProductRequest = { ...current, updatedAt: now };
  const actor = updates.note?.by || updates.emailed?.by || updates.texted?.by || 'staff';

  if (updates.note?.text.trim()) {
    const note: InboxNote = {
      id: crypto.randomUUID(),
      at: now,
      by: updates.note.by,
      text: updates.note.text.trim().slice(0, 2000),
    };
    next.notes = [...current.notes, note];
    next.timeline = [...current.timeline, event(actor, 'note', note.text, now)];
  }

  if (updates.emailed) {
    next.lastEmailedAt = now;
    next.timeline = [...next.timeline, event(updates.emailed.by, 'emailed', updates.emailed.detail, now)];
  }

  if (updates.texted) {
    next.lastTextedAt = now;
    next.timeline = [
      ...next.timeline,
      event(updates.texted.by, 'texted', updates.texted.detail || 'Marked as texted from the store phone', now),
    ];
  }

  const previousStatus = current.status;
  if (updates.status && PRODUCT_REQUEST_STATUSES.includes(updates.status) && updates.status !== current.status) {
    next.status = updates.status;
    next.timeline = [
      ...next.timeline,
      event(actor, 'status', `Status changed from ${previousStatus} to ${updates.status}`, now),
    ];
    if (updates.status === 'closed') {
      next.closedAt = now;
    } else if (previousStatus === 'closed') {
      next.closedAt = undefined;
    }
  }

  const tx = redis.multi().set(keyFor(id), JSON.stringify(next));
  if (next.status !== previousStatus) {
    const score = Date.parse(next.createdAt);
    tx.zrem(statusKey(previousStatus), id);
    tx.zadd(statusKey(next.status), score, id);
  }
  await tx.exec();
  return next;
}

export async function deleteProductRequest(id: string): Promise<ProductRequest | null> {
  const redis = requireInboxRedis();
  const current = await read(id);
  if (!current) {
    await redis.zrem(INDEX, id);
    return null;
  }
  await redis
    .multi()
    .del(keyFor(id))
    .zrem(INDEX, id)
    .zrem(statusKey(current.status), id)
    .exec();
  return current;
}

export async function listAllProductRequestIds(): Promise<string[]> {
  const redis = requireInboxRedis();
  return redis.zrange(INDEX, 0, -1);
}

