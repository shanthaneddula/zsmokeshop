import { NextRequest, NextResponse } from 'next/server';
import { CONTACT_STATUSES, type ContactStatus } from '@/lib/inbox-config';
import { requireInboxPermission } from '@/lib/inbox-admin-auth';
import { listContactMessages } from '@/lib/contact-storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireInboxPermission(request, 'viewContactMessages');
  if ('error' in auth) return auth.error;
  try {
    const statusParam = request.nextUrl.searchParams.get('status') || 'all';
    const query = request.nextUrl.searchParams.get('q') || undefined;
    const status =
      statusParam === 'all' || CONTACT_STATUSES.includes(statusParam as ContactStatus)
        ? (statusParam as ContactStatus | 'all')
        : 'all';
    const data = await listContactMessages({ status, query });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin messages list failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to load messages' }, { status: 500 });
  }
}
