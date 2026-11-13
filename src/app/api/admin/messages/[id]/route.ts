import { NextRequest, NextResponse } from 'next/server';
import { CONTACT_STATUSES, type ContactStatus } from '@/lib/inbox-config';
import { actorName, requireInboxPermission } from '@/lib/inbox-admin-auth';
import { getContactMessage, updateContactMessage } from '@/lib/contact-storage';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireInboxPermission(request, 'viewContactMessages');
  if ('error' in auth) return auth.error;
  const { id } = await context.params;
  try {
    const data = await getContactMessage(id);
    if (!data) return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin message get failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to load message' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireInboxPermission(request, 'manageContactMessages');
  if ('error' in auth) return auth.error;
  const { id } = await context.params;
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }
    const status = (body as { status?: unknown }).status;
    const noteText = (body as { note?: unknown }).note;
    const updates: { status?: ContactStatus; note?: { by: string; text: string } } = {};
    if (typeof status === 'string') {
      if (!CONTACT_STATUSES.includes(status as ContactStatus)) {
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
      }
      updates.status = status as ContactStatus;
    }
    if (typeof noteText === 'string' && noteText.trim()) {
      updates.note = { by: actorName(auth.user), text: noteText };
    }
    if (!updates.status && !updates.note) {
      return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 });
    }
    const data = await updateContactMessage(id, updates);
    if (!data) return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin message update failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to update message' }, { status: 500 });
  }
}
