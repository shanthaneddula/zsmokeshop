// Shared helpers for issuing the admin session cookie (API routes only).

import { NextRequest, NextResponse } from 'next/server';
import { createToken } from './auth';
import { AdminUser } from '@/types/admin';
import { User } from '@/types/users';

export const ADMIN_SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim() || 'unknown';
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

/** Builds the same success response + admin-token cookie the password login uses. */
export function createAdminSessionResponse(user: AdminUser | User): NextResponse {
  const token = createToken(user);
  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  });

  response.cookies.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    path: '/',
  });

  return response;
}
