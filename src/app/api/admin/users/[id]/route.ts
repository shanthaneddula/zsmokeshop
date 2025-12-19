/**
 * User Management API - Individual User
 * GET: Get user by ID
 * PUT: Update user
 * DELETE: Delete user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/lib/user-storage-service';
import { logActivity } from '@/lib/activity-log-service';
import { verifyAdminAuth } from '@/lib/auth-server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin can view users
    const isMainAdmin = !('permissions' in authResult.user);
    if (!isMainAdmin && ('permissions' in authResult.user && !authResult.user.permissions.manageUsers)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      data: safeUser,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin can update users
    const isMainAdmin = !('permissions' in authResult.user);
    if (!isMainAdmin && ('permissions' in authResult.user && !authResult.user.permissions.manageUsers)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const oldUser = await getUserById(id);

    if (!oldUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = await updateUser(id, data);

    // Log activity with changes
    const changes: Record<string, { old: unknown; new: unknown }> = {};
    
    if (data.role && data.role !== oldUser.role) {
      changes.role = { old: oldUser.role, new: data.role };
    }
    if (data.isActive !== undefined && data.isActive !== oldUser.isActive) {
      changes.isActive = { old: oldUser.isActive, new: data.isActive };
    }

    await logActivity(
      'id' in authResult.user ? authResult.user.id : 'admin',
      authResult.user.username,
      'UPDATE_USER',
      'user',
      `Updated user: ${updatedUser.username}`,
      updatedUser.id,
      changes
    );

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = updatedUser;

    return NextResponse.json({
      success: true,
      data: safeUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update user' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin can delete users
    const isMainAdmin = !('permissions' in authResult.user);
    if (!isMainAdmin && ('permissions' in authResult.user && !authResult.user.permissions.manageUsers)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Prevent deleting self
    const currentUserId = 'id' in authResult.user ? authResult.user.id : 'admin';
    if (id === currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    await deleteUser(id);

    // Log activity
    await logActivity(
      currentUserId,
      authResult.user.username,
      'DELETE_USER',
      'user',
      `Deleted user: ${user.username}`,
      id,
      {
        username: { old: user.username, new: null },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete user' 
      },
      { status: 500 }
    );
  }
}
