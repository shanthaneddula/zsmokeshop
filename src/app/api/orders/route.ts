import { NextRequest, NextResponse } from 'next/server';
import { getOrders, getOrderStats } from '@/lib/order-storage-service';
import { OrderFilters, OrderStatus } from '@/types/orders';

/**
 * GET /api/orders
 * Get all orders with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Check if requesting stats
    if (searchParams.get('stats') === 'true') {
      const stats = await getOrderStats();
      return NextResponse.json({ stats });
    }

    // Build filters from query params
    const filters: OrderFilters = {};

    const status = searchParams.get('status');
    if (status) {
      const statusArray = status.split(',');
      const validStatuses = ['pending', 'confirmed', 'ready', 'picked-up', 'no-show', 'cancelled'];
      const filteredStatuses = statusArray.filter(s => validStatuses.includes(s));
      if (filteredStatuses.length > 0) {
        filters.status = filteredStatuses as OrderStatus[];
      }
    }

    const location = searchParams.get('location');
    if (location && (location === 'william-cannon' || location === 'cameron-rd')) {
      filters.storeLocation = location;
    }

    const dateFrom = searchParams.get('dateFrom');
    if (dateFrom) {
      filters.dateFrom = dateFrom;
    }

    const dateTo = searchParams.get('dateTo');
    if (dateTo) {
      filters.dateTo = dateTo;
    }

    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      filters.searchQuery = searchQuery;
    }

    const since = searchParams.get('since');
    if (since) {
      filters.since = since;
    }

    const orders = await getOrders(filters);

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
