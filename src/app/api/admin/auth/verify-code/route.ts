// Verify an email login code and start an admin session.

import { NextRequest, NextResponse } from 'next/server';
import { verifyLoginCode } from '@/lib/email-login-codes';
import { createAdminSessionResponse, getClientIp } from '@/lib/admin-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await verifyLoginCode(body?.email, body?.code, getClientIp(request));

    if (result.status === 'rate_limited') {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please wait 15 minutes and try again.' },
        { status: 429 }
      );
    }

    if (result.status !== 'ok') {
      return NextResponse.json(
        { success: false, error: 'That code is invalid or has expired. Request a new code and try again.' },
        { status: 401 }
      );
    }

    return createAdminSessionResponse(result.user);
  } catch (error) {
    console.error('Verify login code error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: 'Unable to verify the code right now. Please try again.' }, { status: 500 });
  }
}
