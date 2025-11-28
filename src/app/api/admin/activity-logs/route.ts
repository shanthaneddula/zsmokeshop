/**
 * Activity Logs API
 * GET: Get activity logs with optional filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllActivityLogs, getActivityLogsByUser, getRecentActivityLogs } from '@/lib/activity-log-service';
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

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit');

    let logs;

    if (userId) {
      logs = await getActivityLogsByUser(userId);
    } else if (limit) {
      logs = await getRecentActivityLogs(parseInt(limit));
    } else {
      logs = await getAllActivityLogs();
    }

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}
