// Admin dashboard API route

import { NextResponse } from 'next/server';
import { readProducts, readCategories } from '@/lib/json-utils';
import { DashboardStats } from '@/types/admin';

export async function GET() {
  try {
    // Read products and categories
    const [products, categories] = await Promise.all([
      readProducts(),
      readCategories()
    ]);

    // Calculate statistics
    const totalProducts = products.length;
    const totalCategories = categories.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const inactiveProducts = products.filter(p => p.status === 'inactive').length;
    const outOfStockProducts = products.filter(p => !p.inStock).length;

    // Get recently added products (last 5)
    const recentlyAdded = products
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Get recently updated products (last 5)
    const recentlyUpdated = products
      .filter(p => p.updatedAt !== p.createdAt)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    const stats: DashboardStats = {
      totalProducts,
      totalCategories,
      activeProducts,
      inactiveProducts,
      outOfStockProducts,
      recentlyAdded,
      recentlyUpdated
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load dashboard data'
      },
      { status: 500 }
    );
  }
}
