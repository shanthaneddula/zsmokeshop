// API endpoint to migrate products from JSON to Vercel KV
import { NextRequest, NextResponse } from 'next/server';
import { migrateToKV } from '@/lib/product-storage-service';
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

    console.log('🚀 Starting migration from JSON to KV...');
    
    // Perform migration
    await migrateToKV();

    console.log('✅ Migration completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Products successfully migrated from JSON to Vercel KV'
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to migrate products to KV',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Use POST method to trigger migration',
    info: {
      endpoint: '/api/admin/migrate-products-to-kv',
      method: 'POST',
      authentication: 'Required (admin-token cookie)',
      description: 'Migrates products from JSON files to Vercel KV storage'
    }
  }, { status: 405 });
}
