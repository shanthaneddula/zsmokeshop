import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireTenantDb, getTenantInfo } from '@/lib/tenant-context';

export const dynamic = 'force-dynamic';

interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  storeId: string; // Required - which store they belong to
}

/**
 * POST /api/auth/register
 * Register new user in tenant database
 * Note: In production, this might be restricted to store owners/managers only
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
    const body: RegisterBody = await request.json();
    const { email, password, firstName, lastName, phone, storeId } = body;

    // Validate input
    if (!email || !password || !firstName || !lastName || !storeId) {
      return NextResponse.json(
        { error: 'Email, password, first name, last name, and store are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get tenant database
    const db = await requireTenantDb();

    // Check if store exists
    const store = await db.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Invalid store ID' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        storeId,
        role: 'cashier', // Default role for new registrations
        isActive: true,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        store: user.store,
      },
      tenant: {
        id: tenantInfo.id,
        name: tenantInfo.name,
        slug: tenantInfo.slug,
      },
    });

  } catch (error) {
    console.error('[Auth] Registration error:', error);
    return NextResponse.json(
      { 
        error: 'Registration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
