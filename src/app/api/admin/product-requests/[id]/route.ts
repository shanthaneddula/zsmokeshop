import { NextRequest, NextResponse } from 'next/server';
import { PRODUCT_REQUEST_STATUSES, type ProductRequestStatus } from '@/lib/inbox-config';
import { actorName, requireInboxPermission } from '@/lib/inbox-admin-auth';
import {
  defaultCustomerEmailTemplate,
  defaultManualTextMessage,
  sendProductRequestCustomerEmail,
} from '@/lib/inbox-email';
import { getProductRequest, updateProductRequest } from '@/lib/product-request-storage';
import { cleanText, multilineText } from '@/lib/inbox-validation';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireInboxPermission(request, 'viewProductRequests');
  if ('error' in auth) return auth.error;
  const { id } = await context.params;
  try {
    const data = await getProductRequest(id);
    if (!data) return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    return NextResponse.json({
      success: true,
      data,
      defaults: {
        email: defaultCustomerEmailTemplate(data),
        text: defaultManualTextMessage(data),
      },
    });
  } catch (error) {
    console.error('Admin product-request get failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to load request' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireInboxPermission(request, 'manageProductRequests');
  if ('error' in auth) return auth.error;
  const { id } = await context.params;
  const actor = actorName(auth.user);

  try {
    const current = await getProductRequest(id);
    if (!current) return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }
    const data = body as Record<string, unknown>;
    const action = typeof data.action === 'string' ? data.action : 'update';

    if (action === 'email') {
      if (!current.email || !current.emailConsent) {
        return NextResponse.json(
          { success: false, error: 'This customer did not consent to email follow-up, or no email is on file' },
          { status: 400 }
        );
      }
      const template = defaultCustomerEmailTemplate(current);
      const subject = cleanText(data.subject, 150) || template.subject;
      const bodyText = multilineText(data.body, 5000) || template.body;
      const sent = await sendProductRequestCustomerEmail(current, subject, bodyText);
      if (!sent.ok) {
        return NextResponse.json({ success: false, error: sent.error }, { status: 502 });
      }
      const updated = await updateProductRequest(id, {
        emailed: { by: actor, detail: `Emailed: ${subject}` },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'mark-texted') {
      if (!current.phone || !current.textConsent) {
        return NextResponse.json(
          { success: false, error: 'This customer did not consent to a manual text, or no phone is on file' },
          { status: 400 }
        );
      }
      const updated = await updateProductRequest(id, {
        texted: { by: actor, detail: 'Marked as texted from the store phone (512) 227-9820' },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const updates: {
      status?: ProductRequestStatus;
      note?: { by: string; text: string };
    } = {};
    if (typeof data.status === 'string') {
      if (!PRODUCT_REQUEST_STATUSES.includes(data.status as ProductRequestStatus)) {
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
      }
      updates.status = data.status as ProductRequestStatus;
    }
    if (typeof data.note === 'string' && data.note.trim()) {
      updates.note = { by: actor, text: data.note };
    }
    if (!updates.status && !updates.note) {
      return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 });
    }
    const updated = await updateProductRequest(id, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Admin product-request update failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to update request' }, { status: 500 });
  }
}
