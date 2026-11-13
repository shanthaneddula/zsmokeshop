import { CONTACT_STATUSES, type ContactStatus } from '@/lib/inbox-config';
import { requireInboxRedis } from '@/lib/inbox-redis';
import type { ContactMessage, InboxNote } from '@/types/inbox';

const PREFIX = 'zsmokeshop:contact:';
const INDEX = 'zsmokeshop:contact:ids';
const STATUS_PREFIX = 'zsmokeshop:contact:status:';

function keyFor(id: string): string {
  return `${PREFIX}${id}`;
}

function statusKey(status: ContactStatus): string {
  return `${STATUS_PREFIX}${status}`;
}

async function read(id: string): Promise<ContactMessage | null> {
  const redis = requireInboxRedis();
  const raw = await redis.get(keyFor(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ContactMessage;
  } catch {
    return null;
  }
}

export async function createContactMessage(
  data: Omit<ContactMessage, 'status' | 'notes' | 'createdAt' | 'updatedAt' | 'closedAt'>
): Promise<ContactMessage> {
  const redis = requireInboxRedis();
  const now = new Date().toISOString();
  const record: ContactMessage = {
    ...data,
    status: 'new',
    notes: [],
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

export async function getContactMessage(id: string): Promise<ContactMessage | null> {
  return read(id);
}

export async function listContactMessages(options?: {
  status?: ContactStatus | 'all';
  query?: string;
}): Promise<ContactMessage[]> {
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
        return JSON.parse(value) as ContactMessage;
      } catch {
        return null;
      }
    })
    .filter((item): item is ContactMessage => Boolean(item));

  const query = options?.query?.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) => {
    const haystack = [item.name, item.email, item.phone, item.subject, item.message]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });
}

export async function updateContactMessage(
  id: string,
  updates: {
    status?: ContactStatus;
    note?: { by: string; text: string };
  }
): Promise<ContactMessage | null> {
  const redis = requireInboxRedis();
  const current = await read(id);
  if (!current) return null;

  const now = new Date().toISOString();
  const next: ContactMessage = { ...current, updatedAt: now };

  if (updates.note?.text.trim()) {
    const note: InboxNote = {
      id: crypto.randomUUID(),
      at: now,
      by: updates.note.by,
      text: updates.note.text.trim().slice(0, 2000),
    };
    next.notes = [...current.notes, note];
  }

  const previousStatus = current.status;
  if (updates.status && CONTACT_STATUSES.includes(updates.status) && updates.status !== current.status) {
    next.status = updates.status;
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

export async function deleteContactMessage(id: string): Promise<boolean> {
  const redis = requireInboxRedis();
  const current = await read(id);
  if (!current) {
    await redis.zrem(INDEX, id);
    return false;
  }
  await redis
    .multi()
    .del(keyFor(id))
    .zrem(INDEX, id)
    .zrem(statusKey(current.status), id)
    .exec();
  return true;
}

export async function listAllContactIds(): Promise<string[]> {
  const redis = requireInboxRedis();
  return redis.zrange(INDEX, 0, -1);
}

