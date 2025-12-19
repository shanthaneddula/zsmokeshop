// Brands API - Get all unique brands from products
import { NextRequest, NextResponse } from 'next/server';
import { readProducts } from '@/lib/product-storage-service';
import { verifyAdminAuth } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAdminAuth(request);
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Read all products
    const products = await readProducts();

    // Extract unique brands (excluding empty/null values)
    const brandsSet = new Set<string>();
    
    products.forEach(product => {
      if (product.brand && product.brand.trim()) {
        brandsSet.add(product.brand.trim());
      }
    });

    // Convert to sorted array
    const brands = Array.from(brandsSet).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    return NextResponse.json({
      success: true,
      data: {
        brands,
        total: brands.length
      }
    });

  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch brands'
      },
      { status: 500 }
    );
  }
}
