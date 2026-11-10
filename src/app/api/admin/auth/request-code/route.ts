// Request an email login code. Always answers generically (no account enumeration).

import { NextRequest, NextResponse } from 'next/server';
import { requestLoginCode } from '@/lib/email-login-codes';
import { getClientIp } from '@/lib/admin-session';

const GENERIC_MESSAGE = 'If that email belongs to an active account, a 6-digit login code is on its way. It expires in 10 minutes.';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await requestLoginCode(body?.email, getClientIp(request));

    if (result.status === 'invalid_email') {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (result.status === 'rate_limited') {
      return NextResponse.json(
        { success: false, error: 'Too many code requests. Please wait 15 minutes and try again.' },
        { status: 429 }
      );
    }

    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  } catch (error) {
    console.error('Request login code error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: 'Unable to send a code right now. Please try again.' }, { status: 500 });
  }
}
