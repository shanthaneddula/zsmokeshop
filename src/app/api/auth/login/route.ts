import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireTenantDb, getTenantInfo } from '@/lib/tenant-context';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface LoginBody {
  email: string;
  password: string;
}

/**
 * POST /api/auth/login
 * Authenticate user against tenant database
 */
export async function POST(request: Request) {
  try {
    // Get tenant context from middleware
    const tenantInfo = await getTenantInfo();
    
    if (!tenantInfo) {
      return NextResponse.json(
        { error: 'Tenant context not available' },
        { status: 400 }
      );
    }

    // Parse request body
    const body: LoginBody = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get tenant database
    const db = await requireTenantDb();

    // Find user by email in tenant database
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact your administrator.' },
        { status: 403 }
      );
    }

    // Create JWT token with tenant and user info
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: tenantInfo.id,
        tenantSlug: tenantInfo.slug,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tenant: {
        id: tenantInfo.id,
        name: tenantInfo.name,
        slug: tenantInfo.slug,
      },
    });

    // Set JWT as httpOnly cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('[Auth] Login error:', error);
    return NextResponse.json(
      { 
        error: 'Login failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
