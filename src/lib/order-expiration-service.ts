/**
 * Order Expiration Service (Server-Side Only)
 * Automatically marks orders as no-show after 1 hour in ready status
 */

import { getOrders, updateOrderStatus } from './order-storage-service';

// Re-export client-safe utilities for convenience
export { getRemainingTime, formatRemainingTime, isOrderExpiringSoon } from './order-timer-utils';

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Check for expired ready orders and mark them as no-show
 * SERVER-SIDE ONLY - Do not import in client components
 */
export async function checkExpiredOrders(): Promise<{
  checked: number;
  expired: string[];
}> {
  try {
    // Get all orders with 'ready' status
    const orders = await getOrders({ status: 'ready' });
    
    const now = Date.now();
    const expiredOrderIds: string[] = [];

    for (const order of orders) {
      if (!order.timeline.readyAt) continue;

      const readyTime = new Date(order.timeline.readyAt).getTime();
      const expiryTime = readyTime + ONE_HOUR_MS;

      // Check if order has expired
      if (now >= expiryTime) {
        // Mark as no-show
        await updateOrderStatus(
          order.id, 
          'no-show',
          'Automatically marked as no-show - pickup window expired (1 hour)'
        );
        expiredOrderIds.push(order.id);
      }
    }

    return {
      checked: orders.length,
      expired: expiredOrderIds,
    };
  } catch (error) {
    console.error('Error checking expired orders:', error);
    throw error;
  }
}
