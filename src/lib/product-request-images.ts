import { del, list, put } from '@vercel/blob';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_REQUEST_IMAGES,
} from '@/lib/inbox-config';
import { canWriteBlob } from '@/lib/inbox-env';
import { isUuid } from '@/lib/inbox-validation';
import type { ProductRequestImage } from '@/types/inbox';

export const REQUEST_IMAGE_PREFIX = 'product-requests/';

export function isAllowedImageType(type: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

export function safeImageFileName(originalName: string): string {
  const raw = originalName.split(/[/\\]/).pop() || 'image';
  const lower = raw.toLowerCase();
  const extMatch = lower.match(/\.(jpe?g|png|webp)$/);
  const ext = extMatch ? extMatch[0] : '';
  const base = raw
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 24) || 'image';
  return `${base}${ext || '.jpg'}`;
}

export function isRequestImagePath(pathname: string, requestId?: string): boolean {
  const clean = pathname.replace(/^\/+/, '');
  if (requestId) {
    return clean.startsWith(`${REQUEST_IMAGE_PREFIX}${requestId}/`) && !clean.includes('..');
  }
  return new RegExp(`^${REQUEST_IMAGE_PREFIX}[0-9a-f-]{36}/`, 'i').test(clean) && !clean.includes('..');
}

export function requestIdFromPath(pathname: string): string | null {
  const match = pathname.replace(/^\/+/, '').match(/^product-requests\/([0-9a-f-]{36})\//i);
  if (!match) return null;
  return isUuid(match[1]) ? match[1] : null;
}

export function isAllowedBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

export function isDevMockUrl(url: string): boolean {
  return url.startsWith('/dev-blob/');
}

export function validateSubmittedImages(
  images: unknown,
  requestId: string
): { ok: true; images: ProductRequestImage[] } | { ok: false; error: string } {
  if (images == null) return { ok: true, images: [] };
  if (!Array.isArray(images)) return { ok: false, error: 'Images must be an array' };
  if (images.length > MAX_REQUEST_IMAGES) {
    return { ok: false, error: `You can attach up to ${MAX_REQUEST_IMAGES} images` };
  }
  const cleaned: ProductRequestImage[] = [];
  for (const item of images) {
    if (!item || typeof item !== 'object') return { ok: false, error: 'Invalid image metadata' };
    const record = item as Partial<ProductRequestImage>;
    if (typeof record.pathname !== 'string' || !isRequestImagePath(record.pathname, requestId)) {
      return { ok: false, error: 'Invalid image path' };
    }
    if (typeof record.url !== 'string') return { ok: false, error: 'Invalid image URL' };
    const devMock = record.devMock === true || isDevMockUrl(record.url);
    if (!devMock && !isAllowedBlobUrl(record.url)) {
      return { ok: false, error: 'Invalid image URL' };
    }
    const contentType = typeof record.contentType === 'string' ? record.contentType : '';
    if (!isAllowedImageType(contentType)) {
      return { ok: false, error: 'Images must be JPEG, PNG, or WebP' };
    }
    const size = typeof record.size === 'number' ? record.size : 0;
    if (size <= 0 || size > MAX_IMAGE_BYTES) {
      return { ok: false, error: 'Each image must be 5 MB or smaller' };
    }
    cleaned.push({
      pathname: record.pathname.replace(/^\/+/, ''),
      url: record.url,
      contentType,
      size,
      ...(devMock ? { devMock: true } : {}),
    });
  }
  return { ok: true, images: cleaned };
}

export async function uploadRequestImageToBlob(
  requestId: string,
  file: File
): Promise<ProductRequestImage> {
  const pathname = `${REQUEST_IMAGE_PREFIX}${requestId}/${safeImageFileName(file.name)}`;
  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  });
  return {
    pathname: blob.pathname,
    url: blob.url,
    contentType: file.type,
    size: file.size,
  };
}

export function mockRequestImage(requestId: string, file: File): ProductRequestImage {
  const suffix = crypto.randomUUID().slice(0, 8);
  const pathname = `${REQUEST_IMAGE_PREFIX}${requestId}/dev-${suffix}-${safeImageFileName(file.name)}`;
  return {
    pathname,
    url: `/dev-blob/${pathname}`,
    contentType: file.type,
    size: file.size,
    devMock: true,
  };
}

export async function deleteRequestImages(images: ProductRequestImage[], requestId?: string): Promise<void> {
  const realUrls = images.filter((image) => !image.devMock && isAllowedBlobUrl(image.url)).map((image) => image.url);
  if (realUrls.length && canWriteBlob()) {
    try {
      await del(realUrls);
    } catch (error) {
      console.error('Failed to delete product-request images:', error);
    }
  }
  if (requestId && canWriteBlob()) {
    try {
      const listed = await list({ prefix: `${REQUEST_IMAGE_PREFIX}${requestId}/` });
      const leftovers = listed.blobs.map((blob) => blob.url);
      if (leftovers.length) await del(leftovers);
    } catch (error) {
      console.error('Failed to list/delete leftover product-request images:', error);
    }
  }
}

export { canWriteBlob };
