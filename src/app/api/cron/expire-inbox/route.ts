import { NextResponse } from 'next/server';
import { expireClosedInboxRecords } from '@/lib/expire-inbox-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await expireClosedInboxRecords();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error('expire-inbox cron failed:', error);
    return NextResponse.json({ error: 'Failed to expire inbox records' }, { status: 500 });
  }
}
