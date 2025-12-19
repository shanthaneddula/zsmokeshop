// API route for changing user password

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth-server';
import { getUserByUsername, updateUser } from '@/lib/user-storage-service';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/lib/activity-log-service';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, currentPassword, newPassword } = await request.json();

    // Validation
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Users can only change their own password (unless they're main admin)
    const isMainAdmin = !('permissions' in authResult.user);
    if (!isMainAdmin && authResult.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only change your own password' },
        { status: 403 }
      );
    }

    // Get user to verify current password
    const user = await getUserByUsername(authResult.user.username);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      // Log failed password change attempt
      await logActivity(
        user.id,
        user.username,
        'password_change_failed',
        'user',
        'Incorrect current password',
        user.id
      );

      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update user with new password
    await updateUser(userId, {
      passwordHash: newPasswordHash,
    });

    // Log successful password change
    await logActivity(
      user.id,
      user.username,
      'password_changed',
      'user',
      'Password changed successfully',
      user.id
    );

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
