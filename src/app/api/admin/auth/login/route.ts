// Admin login API route

import { NextRequest, NextResponse } from 'next/server';
import { createToken, checkRateLimit, recordLoginAttempt } from '@/lib/auth';
import { validateCredentialsWithBcrypt } from '@/lib/auth-server';
import { LoginCredentials } from '@/types/admin';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limiting
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      recordLoginAttempt(ip, false);
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please try again in ${Math.ceil((rateLimit.lockoutTime || 0) / 60000)} minutes.`
        },
        { status: 429 }
      );
    }

    // Parse request body
    const credentials: LoginCredentials = await request.json();

    // Use bcrypt validation only (no fallback to prevent dual password issue)
    let authResult;
    try {
      authResult = await validateCredentialsWithBcrypt(credentials.username, credentials.password);
    } catch (error) {
      console.error('Authentication error:', error);
      authResult = {
        success: false,
        error: 'Authentication failed'
      };
    }
    
    if (!authResult.success) {
      recordLoginAttempt(ip, false);
      return NextResponse.json(
        {
          success: false,
          error: authResult.error
        },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = createToken(authResult.user!);
    
    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: authResult.user!.id,
        username: authResult.user!.username,
        role: authResult.user!.role
      }
    });

    // Set authentication cookie
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    // Record successful login
    recordLoginAttempt(ip, true);

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
