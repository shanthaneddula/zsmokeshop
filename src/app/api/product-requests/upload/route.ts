import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';
import { RATE_LIMITS } from '@/lib/inbox-config';
import { canWriteBlob } from '@/lib/inbox-env';
import { getClientIp, isRateLimited } from '@/lib/inbox-rate-limit';
import {
  isAllowedImageType,
  isRequestImagePath,
  mockRequestImage,
  safeImageFileName,
  uploadRequestImageToBlob,
} from '@/lib/product-request-images';
import { MAX_IMAGE_BYTES, ALLOWED_IMAGE_TYPES } from '@/lib/inbox-config';
import { isUuid } from '@/lib/inbox-validation';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

async function enforceUploadRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp(request.headers);
  if (await isRateLimited('upload-ip', ip, RATE_LIMITS.uploadPerIp, RATE_LIMITS.windowSeconds)) {
    return NextResponse.json(
      { success: false, error: 'Too many uploads. Please try again later.' },
      { status: 429 }
    );
  }
  return null;
}

export async function POST(request: NextRequest) {
  const limited = await enforceUploadRateLimit(request);
  if (limited) return limited;

  const contentType = request.headers.get('content-type') || '';

  // Client-side Blob upload handshake (used in production so files bypass the function body limit).
  if (contentType.includes('application/json')) {
    if (!canWriteBlob()) {
      return NextResponse.json(
        { success: false, error: 'Direct blob uploads are disabled in local development' },
        { status: 501 }
      );
    }
    const body = (await request.json()) as HandleUploadBody;
    try {
      const json = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          let requestId: string | undefined;
          if (clientPayload) {
            try {
              const parsed = JSON.parse(clientPayload) as { requestId?: string };
              requestId = parsed.requestId;
            } catch {
              requestId = undefined;
            }
          }
          if (!requestId || !isUuid(requestId) || !isRequestImagePath(pathname, requestId)) {
            throw new Error('Invalid upload path');
          }
          return {
            allowedContentTypes: [...ALLOWED_IMAGE_TYPES],
            maximumSizeInBytes: MAX_IMAGE_BYTES,
            addRandomSuffix: true,
            validUntil: Date.now() + 10 * 60 * 1000,
          };
        },
        onUploadCompleted: async () => {
          /* metadata is attached when the request is submitted */
        },
      });
      return NextResponse.json(json);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  }

  // Multipart fallback (local development, or a single file through the function).
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const requestId = String(formData.get('requestId') || '');
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }
    if (!isUuid(requestId)) {
      return NextResponse.json({ success: false, error: 'Invalid request id' }, { status: 400 });
    }
    if (!isAllowedImageType(file.type)) {
      return NextResponse.json({ success: false, error: 'Images must be JPEG, PNG, or WebP' }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ success: false, error: 'Each image must be 5 MB or smaller' }, { status: 400 });
    }
    // Keep the filename in the expected folder even if the original name is messy.
    void safeImageFileName(file.name);

    if (canWriteBlob()) {
      const image = await uploadRequestImageToBlob(requestId, file);
      return NextResponse.json({ success: true, data: image });
    }

    const image = mockRequestImage(requestId, file);
    return NextResponse.json({ success: true, data: image });
  } catch (error) {
    console.error('Product-request image upload failed:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
