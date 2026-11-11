/**
 * Catalog visibility API (full admins only).
 * GET:  every static-catalog product with its compliance status and visibility.
 * POST: { slugs: string[], action: 'show' | 'hide' | 'default' }
 * Writes only the `zsmokeshop:catalog-visibility` key.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth-server';
import { isFullAdmin } from '@/lib/is-full-admin';
import { getCatalogVisibilityRows, setCatalogVisibility } from '@/lib/catalog-visibility';

export const dynamic = 'force-dynamic';

async function requireFullAdmin(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.isAuthenticated || !auth.user) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!isFullAdmin(auth.user)) {
    return { error: NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 }) };
  }
  return { user: auth.user };
}

export async function GET(request: NextRequest) {
  const { error } = await requireFullAdmin(request);
  if (error) return error;
  try {
    const data = await getCatalogVisibilityRows();
    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('catalog-visibility GET failed:', e);
    return NextResponse.json({ success: false, error: 'Failed to load catalog visibility' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireFullAdmin(request);
  if (error) return error;
  try {
    const body = await request.json().catch(() => null);
    const slugs: unknown = body?.slugs;
    const action: unknown = body?.action;
    if (!Array.isArray(slugs) || slugs.length === 0 || !slugs.every((s) => typeof s === 'string') || slugs.length > 2000) {
      return NextResponse.json({ success: false, error: 'slugs must be a non-empty array of strings' }, { status: 400 });
    }
    if (action !== 'show' && action !== 'hide' && action !== 'default') {
      return NextResponse.json({ success: false, error: "action must be 'show', 'hide' or 'default'" }, { status: 400 });
    }
    const u = user as { username?: string; email?: string; name?: string };
    await setCatalogVisibility(slugs as string[], action, u.username || u.email || u.name || 'admin');
    const data = await getCatalogVisibilityRows();
    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('catalog-visibility POST failed:', e);
    return NextResponse.json({ success: false, error: 'Failed to save catalog visibility' }, { status: 500 });
  }
}
