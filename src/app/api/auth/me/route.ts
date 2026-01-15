import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { requireTenantDb } from '@/lib/tenant-context';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * GET /api/auth/me
 * Get current authenticated user info
 */
export async function GET(request: Request) {
  try {
    // Get auth token from cookie
    const cookieHeader = request.headers.get('cookie');
    const authToken = cookieHeader
      ?.split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];

    if (!authToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(authToken, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
      storeId: string;
      tenantId: string;
      tenantSlug: string;
    };

    // Get tenant database
    const db = await requireTenantDb();

    // Fetch fresh user data
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            phone: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        store: user.store,
      },
      tenant: {
        id: decoded.tenantId,
        slug: decoded.tenantSlug,
      },
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.error('[Auth] Session check error:', error);
    return NextResponse.json(
      { 
        error: 'Session check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
