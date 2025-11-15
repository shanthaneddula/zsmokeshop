// API endpoint to migrate categories from JSON to Redis
import { NextRequest, NextResponse } from 'next/server';
import { migrateToKV } from '@/lib/category-storage-service';
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

    console.log('🚀 Starting categories migration from JSON to Redis...');
    
    // Perform migration
    await migrateToKV();

    console.log('✅ Categories migration completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Categories successfully migrated from JSON to Redis'
    });

  } catch (error) {
    console.error('❌ Categories migration failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to migrate categories to Redis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Use POST method to trigger migration',
    info: {
      endpoint: '/api/admin/migrate-categories-to-kv',
      method: 'POST',
      authentication: 'Required (admin-token cookie)',
      description: 'Migrates categories from JSON files to Redis storage'
    }
  }, { status: 405 });
}
