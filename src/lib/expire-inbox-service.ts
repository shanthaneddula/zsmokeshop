import { del, list } from '@vercel/blob';
import { ORPHAN_BLOB_MAX_AGE_MS, RETENTION_DAYS_AFTER_CLOSE } from '@/lib/inbox-config';
import { canWriteBlob } from '@/lib/inbox-env';
import { deleteContactMessage, getContactMessage, listAllContactIds } from '@/lib/contact-storage';
import {
  deleteProductRequest,
  getProductRequest,
  listAllProductRequestIds,
} from '@/lib/product-request-storage';
import { deleteRequestImages, REQUEST_IMAGE_PREFIX, requestIdFromPath } from '@/lib/product-request-images';

const RETENTION_MS = RETENTION_DAYS_AFTER_CLOSE * 24 * 60 * 60 * 1000;

function isExpired(closedAt?: string): boolean {
  if (!closedAt) return false;
  const closed = Date.parse(closedAt);
  if (Number.isNaN(closed)) return false;
  return Date.now() - closed >= RETENTION_MS;
}

export async function expireClosedInboxRecords(): Promise<{
  contactsDeleted: number;
  requestsDeleted: number;
  orphanImagesDeleted: number;
}> {
  let contactsDeleted = 0;
  let requestsDeleted = 0;
  let orphanImagesDeleted = 0;

  const contactIds = await listAllContactIds();
  for (const id of contactIds) {
    const item = await getContactMessage(id);
    if (!item) continue;
    if (item.status === 'closed' && isExpired(item.closedAt)) {
      await deleteContactMessage(id);
      contactsDeleted += 1;
    }
  }

  const requestIds = await listAllProductRequestIds();
  const known = new Set(requestIds);
  for (const id of requestIds) {
    const item = await getProductRequest(id);
    if (!item) continue;
    if (item.status === 'closed' && isExpired(item.closedAt)) {
      await deleteRequestImages(item.images, item.id);
      await deleteProductRequest(id);
      known.delete(id);
      requestsDeleted += 1;
    }
  }

  if (canWriteBlob()) {
    try {
      let cursor: string | undefined;
      do {
        const page = await list({ prefix: REQUEST_IMAGE_PREFIX, cursor, limit: 100 });
        const stale: string[] = [];
        for (const blob of page.blobs) {
          const requestId = requestIdFromPath(blob.pathname);
          if (requestId && known.has(requestId)) continue;
          const uploaded = Date.parse(String(blob.uploadedAt));
          if (!Number.isNaN(uploaded) && Date.now() - uploaded >= ORPHAN_BLOB_MAX_AGE_MS) {
            stale.push(blob.url);
          }
        }
        if (stale.length) {
          await del(stale);
          orphanImagesDeleted += stale.length;
        }
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
    } catch (error) {
      console.error('Failed to clean orphan product-request images:', error);
    }
  }

  return { contactsDeleted, requestsDeleted, orphanImagesDeleted };
}
