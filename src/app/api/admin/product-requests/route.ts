import { NextRequest, NextResponse } from 'next/server';
import { PRODUCT_REQUEST_STATUSES, type ProductRequestStatus } from '@/lib/inbox-config';
import { requireInboxPermission } from '@/lib/inbox-admin-auth';
import { listProductRequests } from '@/lib/product-request-storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireInboxPermission(request, 'viewProductRequests');
  if ('error' in auth) return auth.error;
  try {
    const statusParam = request.nextUrl.searchParams.get('status') || 'all';
    const query = request.nextUrl.searchParams.get('q') || undefined;
    const status =
      statusParam === 'all' || PRODUCT_REQUEST_STATUSES.includes(statusParam as ProductRequestStatus)
        ? (statusParam as ProductRequestStatus | 'all')
        : 'all';
    const data = await listProductRequests({ status, query });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin product-requests list failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to load product requests' }, { status: 500 });
  }
}
