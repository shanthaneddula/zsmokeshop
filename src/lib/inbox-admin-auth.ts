import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth-server';
import { userHasPermission } from '@/lib/user-permissions';
import type { UserPermissions } from '@/types/users';
import type { AdminUser } from '@/types/admin';
import type { User } from '@/types/users';

export type InboxActor = User | AdminUser;

export async function requireInboxPermission(
  request: NextRequest,
  permission: keyof UserPermissions
): Promise<{ user: InboxActor } | { error: NextResponse }> {
  const auth = await verifyAdminAuth(request);
  if (!auth.isAuthenticated || !auth.user) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!userHasPermission(auth.user, permission)) {
    return { error: NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 }) };
  }
  return { user: auth.user };
}

export function actorName(user: InboxActor): string {
  if ('username' in user && user.username) return user.username;
  if ('email' in user && typeof user.email === 'string' && user.email) return user.email;
  return 'admin';
}
