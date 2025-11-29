/**
 * Order Storage Service using Redis
 * Handles all CRUD operations for pickup orders
 * Uses existing Redis instance (same as products/categories/settings)
 */

import Redis from 'ioredis';
import { 
  PickupOrder, 
  OrderStatus, 
  OrderFilters, 
  OrderStats,
  OrderListItem,
  StoreLocation 
} from '@/types/orders';

// Initialize Redis client if REDIS_URL is provided
let redisClient: Redis | null = null;

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: false,
      enableOfflineQueue: true,
      connectTimeout: 10000,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error (Orders):', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected for orders');
    });
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
  }
}

const hasRedis = !!process.env.REDIS_URL;

const ORDER_PREFIX = 'order:';
const ORDER_LIST_KEY = 'orders:list';
const ORDER_COUNTER_KEY = 'orders:counter';
const ORDER_BY_PHONE_PREFIX = 'orders:phone:';
const ORDER_BY_STATUS_PREFIX = 'orders:status:';
const ORDER_BY_LOCATION_PREFIX = 'orders:location:';

/**
 * Generate a unique order number (ZS-XXXXXX)
 */
async function generateOrderNumber(): Promise<string> {
  if (!hasRedis || !redisClient) {
    throw new Error('Redis is required for order management. Please set REDIS_URL environment variable.');
  }

  const counter = await redisClient.incr(ORDER_COUNTER_KEY);
  return `ZS-${counter.toString().padStart(6, '0')}`;
}

/**
 * Create a new pickup order
 */
export async function createOrder(order: Omit<PickupOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<PickupOrder> {
  if (!hasRedis || !redisClient) {
    throw new Error('Redis is required for order management. Please set REDIS_URL environment variable.');
  }

  const id = crypto.randomUUID();
  const orderNumber = await generateOrderNumber();
  const now = new Date().toISOString();
  
  const newOrder: PickupOrder = {
    ...order,
    id,
    orderNumber,
    createdAt: now,
    updatedAt: now,
  };

  // Store the order
  await redisClient.set(`${ORDER_PREFIX}${id}`, JSON.stringify(newOrder));
  
  // Add to indices
  await redisClient.sadd(ORDER_LIST_KEY, id);
  await redisClient.sadd(`${ORDER_BY_PHONE_PREFIX}${order.customerPhone}`, id);
  await redisClient.sadd(`${ORDER_BY_STATUS_PREFIX}${order.status}`, id);
  await redisClient.sadd(`${ORDER_BY_LOCATION_PREFIX}${order.storeLocation}`, id);

  return newOrder;
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<PickupOrder | null> {
  if (!hasRedis || !redisClient) return null;
  
  const data = await redisClient.get(`${ORDER_PREFIX}${orderId}`);
  if (!data) return null;
  return JSON.parse(data);
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string): Promise<PickupOrder | null> {
  if (!hasRedis || !redisClient) return null;
  
  const allOrderIds = await redisClient.smembers(ORDER_LIST_KEY) as string[];
  
  for (const orderId of allOrderIds) {
    const order = await getOrderById(orderId);
    if (order && order.orderNumber === orderNumber) {
      return order;
    }
  }
  
  return null;
}

/**
 * Update order
 */
export async function updateOrder(orderId: string, updates: Partial<PickupOrder>): Promise<PickupOrder | null> {
  if (!hasRedis || !redisClient) return null;
  
  const existingOrder = await getOrderById(orderId);
  if (!existingOrder) return null;

  const oldStatus = existingOrder.status;
  const oldLocation = existingOrder.storeLocation;

  const updatedOrder: PickupOrder = {
    ...existingOrder,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Update the order
  await redisClient.set(`${ORDER_PREFIX}${orderId}`, JSON.stringify(updatedOrder));

  // Update status index if status changed
  if (updates.status && updates.status !== oldStatus) {
    await redisClient.srem(`${ORDER_BY_STATUS_PREFIX}${oldStatus}`, orderId);
    await redisClient.sadd(`${ORDER_BY_STATUS_PREFIX}${updates.status}`, orderId);
  }

  // Update location index if location changed
  if (updates.storeLocation && updates.storeLocation !== oldLocation) {
    await redisClient.srem(`${ORDER_BY_LOCATION_PREFIX}${oldLocation}`, orderId);
    await redisClient.sadd(`${ORDER_BY_LOCATION_PREFIX}${updates.storeLocation}`, orderId);
  }

  return updatedOrder;
}

/**
 * Update order status and timeline
 */
export async function updateOrderStatus(
  orderId: string, 
  status: OrderStatus,
  storeNotes?: string
): Promise<PickupOrder | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;

  const now = new Date().toISOString();
  const timeline = { ...order.timeline };

  // Update timeline based on status
  switch (status) {
    case 'confirmed':
      timeline.confirmedAt = now;
      break;
    case 'ready':
      timeline.readyAt = now;
      // Set pickup deadline (1 hour from now)
      const deadline = new Date(Date.now() + 60 * 60 * 1000);
      timeline.pickupDeadline = deadline.toISOString();
      break;
    case 'picked-up':
    case 'no-show':
      timeline.completedAt = now;
      break;
    case 'cancelled':
      timeline.cancelledAt = now;
      break;
  }

  const updates: Partial<PickupOrder> = {
    status,
    timeline,
  };

  if (storeNotes !== undefined) {
    updates.storeNotes = storeNotes;
  }

  return updateOrder(orderId, updates);
}

/**
 * Get orders by customer phone
 */
export async function getOrdersByPhone(phone: string): Promise<PickupOrder[]> {
  if (!hasRedis || !redisClient) return [];
  
  const orderIds = await redisClient.smembers(`${ORDER_BY_PHONE_PREFIX}${phone}`) as string[];
  
  const orders = await Promise.all(
    orderIds.map(id => getOrderById(id))
  );
  
  return orders
    .filter((order): order is PickupOrder => order !== null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(status: OrderStatus): Promise<PickupOrder[]> {
  if (!hasRedis || !redisClient) return [];
  
  const orderIds = await redisClient.smembers(`${ORDER_BY_STATUS_PREFIX}${status}`) as string[];
  
  const orders = await Promise.all(
    orderIds.map(id => getOrderById(id))
  );
  
  return orders
    .filter((order): order is PickupOrder => order !== null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get orders by location
 */
export async function getOrdersByLocation(location: StoreLocation): Promise<PickupOrder[]> {
  if (!hasRedis || !redisClient) return [];
  
  const orderIds = await redisClient.smembers(`${ORDER_BY_LOCATION_PREFIX}${location}`) as string[];
  
  const orders = await Promise.all(
    orderIds.map(id => getOrderById(id))
  );
  
  return orders
    .filter((order): order is PickupOrder => order !== null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get all orders with filters
 */
export async function getOrders(filters?: OrderFilters): Promise<PickupOrder[]> {
  if (!hasRedis || !redisClient) return [];
  
  const orderIds = await redisClient.smembers(ORDER_LIST_KEY) as string[];
  
  // Get all orders
  const allOrders = await Promise.all(
    orderIds.map(id => getOrderById(id))
  );
  
  let orders = allOrders.filter((order): order is PickupOrder => order !== null);

  // Apply filters
  if (filters) {
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      orders = orders.filter(order => statuses.includes(order.status));
    }

    if (filters.storeLocation) {
      orders = orders.filter(order => order.storeLocation === filters.storeLocation);
    }

    if (filters.since) {
      const sinceDate = new Date(filters.since);
      orders = orders.filter(order => {
        const orderDate = new Date(order.timeline.placedAt || order.createdAt);
        return orderDate > sinceDate;
      });
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      orders = orders.filter(order => new Date(order.createdAt) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      orders = orders.filter(order => new Date(order.createdAt) <= toDate);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      orders = orders.filter(order => 
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerPhone.includes(query)
      );
    }
  }

  // Sort by creation date (newest first)
  return orders.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get order statistics
 */
export async function getOrderStats(): Promise<OrderStats> {
  const allOrders = await getOrders();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= todayStart);
  const weekOrders = allOrders.filter(o => new Date(o.createdAt) >= weekStart);

  return {
    today: {
      total: todayOrders.length,
      pending: todayOrders.filter(o => o.status === 'pending').length,
      ready: todayOrders.filter(o => o.status === 'ready').length,
      pickedUp: todayOrders.filter(o => o.status === 'picked-up').length,
      noShow: todayOrders.filter(o => o.status === 'no-show').length,
    },
    thisWeek: {
      total: weekOrders.length,
      pickedUp: weekOrders.filter(o => o.status === 'picked-up').length,
      noShow: weekOrders.filter(o => o.status === 'no-show').length,
    },
    byLocation: {
      'william-cannon': allOrders.filter(o => o.storeLocation === 'william-cannon').length,
      'cameron-rd': allOrders.filter(o => o.storeLocation === 'cameron-rd').length,
    },
  };
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

/**
 * Delete an order (admin only, use with caution)
 */
export async function deleteOrder(orderId: string): Promise<boolean> {
  if (!hasRedis || !redisClient) return false;
  
  const order = await getOrderById(orderId);
  if (!order) return false;

  // Remove from all indices
  await redisClient.srem(ORDER_LIST_KEY, orderId);
  await redisClient.srem(`${ORDER_BY_PHONE_PREFIX}${order.customerPhone}`, orderId);
  await redisClient.srem(`${ORDER_BY_STATUS_PREFIX}${order.status}`, orderId);
  await redisClient.srem(`${ORDER_BY_LOCATION_PREFIX}${order.storeLocation}`, orderId);

  // Delete the order
  await redisClient.del(`${ORDER_PREFIX}${orderId}`);

  return true;
}
