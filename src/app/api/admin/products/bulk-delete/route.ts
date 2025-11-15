// Bulk delete products API route
import { NextRequest, NextResponse } from 'next/server';
import * as ProductStorage from '@/lib/product-storage-service';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids } = body;

    // Validate request
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request: ids must be a non-empty array'
      }, { status: 400 });
    }

    // Perform bulk delete
    const result = await ProductStorage.bulkDeleteProducts(ids);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully deleted ${result.deleted} products`
    });

  } catch (error) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
