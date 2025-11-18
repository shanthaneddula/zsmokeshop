/**
 * Order Timer Utilities (Client-Safe)
 * Utilities for calculating and formatting order pickup deadlines
 */

import { PickupOrder, OrderListItem } from '@/types/orders';

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Get remaining time for a ready order in milliseconds
 * Returns null if order is not ready or already expired
 */
export function getRemainingTime(readyAt: string): number | null {
  const readyTime = new Date(readyAt).getTime();
  const expiryTime = readyTime + ONE_HOUR_MS;
  const now = Date.now();
  const remaining = expiryTime - now;

  return remaining > 0 ? remaining : null;
}

/**
 * Format remaining time as human-readable string
 */
export function formatRemainingTime(readyAt: string): string {
  const remaining = getRemainingTime(readyAt);
  
  if (remaining === null) {
    return 'Expired';
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes} min ${seconds} sec`;
  }
  
  return `${seconds} sec`;
}

/**
 * Check if an order is about to expire (less than 15 minutes remaining)
 */
export function isOrderExpiringSoon(readyAt: string): boolean {
  const remaining = getRemainingTime(readyAt);
  return remaining !== null && remaining < 15 * 60 * 1000;
}

/**
 * Convert order to list item format
 */
export function orderToListItem(order: PickupOrder): OrderListItem {
  const now = Date.now();
  let timeRemaining: number | undefined;
  let isExpiringSoon = false;

  if (order.status === 'ready' && order.timeline.pickupDeadline) {
    const deadline = new Date(order.timeline.pickupDeadline).getTime();
    timeRemaining = Math.max(0, Math.floor((deadline - now) / (60 * 1000))); // Minutes
    isExpiringSoon = timeRemaining < 15 && timeRemaining > 0;
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    status: order.status,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    total: order.total,
    storeLocation: order.storeLocation,
    createdAt: order.createdAt,
    pickupDeadline: order.timeline.pickupDeadline,
    timeRemaining,
    isExpiringSoon,
  };
}
