/**
 * User Management API
 * GET: Get all users
 * POST: Create new user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/lib/user-storage-service';
import { logActivity } from '@/lib/activity-log-service';
import { verifyAdminAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin can manage users
    const isMainAdmin = !('permissions' in authResult.user);
    if (!isMainAdmin && ('permissions' in authResult.user && !authResult.user.permissions.manageUsers)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const users = await getAllUsers();

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const safeUsers = users.map(({ password, ...user }) => user);

    return NextResponse.json({
      success: true,
      data: safeUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin can create users
    const isMainAdmin = !('permissions' in authResult.user);
    if (!isMainAdmin && ('permissions' in authResult.user && !authResult.user.permissions.manageUsers)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.username || !data.email || !data.password || !data.role || !data.firstName || !data.lastName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newUser = await createUser(data, 'id' in authResult.user ? authResult.user.id : 'admin');

    // Log activity
    await logActivity(
      'id' in authResult.user ? authResult.user.id : 'admin',
      authResult.user.username,
      'CREATE_USER',
      'user',
      `Created new user: ${newUser.username} (${newUser.role})`,
      newUser.id,
      {
        username: { old: null, new: newUser.username },
        role: { old: null, new: newUser.role },
      }
    );

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = newUser;

    return NextResponse.json({
      success: true,
      data: safeUser,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create user' 
      },
      { status: 500 }
    );
  }
}
