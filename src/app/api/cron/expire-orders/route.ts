import { NextResponse } from 'next/server';
import { checkExpiredOrders } from '@/lib/order-expiration-service';

/**
 * Cron endpoint to check and expire orders
 * Configure in Vercel: Run every 5 minutes
 * 
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/expire-orders",
 *     "schedule": "every 5 minutes (cron: star-slash-5 * * * *)"
 *   }]
 * }
 */
export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await checkExpiredOrders();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error('Error in expire-orders cron:', error);
    return NextResponse.json(
      { error: 'Failed to check expired orders' },
      { status: 500 }
    );
  }
}
