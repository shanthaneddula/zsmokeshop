// API route for timesheet operations

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth-server';
import { 
  clockIn, 
  clockOut, 
  getActiveSession, 
  getTimesheetSummary,
  getTimesheetEntries 
} from '@/lib/timesheet-service';
import { logActivity } from '@/lib/activity-log-service';

// GET - Get timesheet summary or entries
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId') || authResult.user.id;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Users can only view their own data unless they're main admin
    const isMainAdmin = !('permissions' in authResult.user);
    if (!isMainAdmin && userId !== authResult.user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only view your own timesheet data' },
        { status: 403 }
      );
    }

    if (action === 'summary') {
      const summary = await getTimesheetSummary(userId);
      return NextResponse.json({ success: true, summary });
    } else if (action === 'entries') {
      const entries = await getTimesheetEntries(
        userId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      return NextResponse.json({ success: true, entries });
    } else if (action === 'active') {
      const activeSession = await getActiveSession(userId);
      return NextResponse.json({ success: true, activeSession });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in timesheet GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Clock in or clock out
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action, location, notes } = await request.json();

    if (action === 'clock-in') {
      const result = await clockIn(
        authResult.user.id,
        authResult.user.username,
        location,
        notes
      );

      if (result.success) {
        await logActivity(
          authResult.user.id,
          authResult.user.username,
          'clocked_in',
          'user',
          `Clocked in${location ? ` at ${location}` : ''}`,
          authResult.user.id
        );
      }

      return NextResponse.json(result);

    } else if (action === 'clock-out') {
      const result = await clockOut(authResult.user.id, notes);

      if (result.success) {
        await logActivity(
          authResult.user.id,
          authResult.user.username,
          'clocked_out',
          'user',
          `Clocked out - ${result.entry?.hoursWorked?.toFixed(2)} hours worked`,
          authResult.user.id
        );
      }

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in timesheet POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
