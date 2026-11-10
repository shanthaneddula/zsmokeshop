// A user has full admin access if they are the env bootstrap admin (no
// permissions object) or a Redis user whose role is 'admin'.
export function isFullAdmin(user: unknown): boolean {
  if (!user || typeof user !== 'object') return false;
  const u = user as { role?: string; permissions?: unknown };
  return !('permissions' in u) || u.role === 'admin';
}
