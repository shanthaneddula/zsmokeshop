import { isFullAdmin } from '@/lib/is-full-admin';
import { DEFAULT_PERMISSIONS, type UserPermissions, type UserRole } from '@/types/users';

export function userHasPermission(user: unknown, permission: keyof UserPermissions): boolean {
  if (isFullAdmin(user)) return true;
  if (!user || typeof user !== 'object') return false;
  const record = user as { role?: UserRole; permissions?: Partial<UserPermissions> };
  const current = record.permissions?.[permission];
  if (current === true) return true;
  if (current === false) return false;
  const role = record.role;
  if (role && DEFAULT_PERMISSIONS[role]) {
    return DEFAULT_PERMISSIONS[role][permission] === true;
  }
  return false;
}
