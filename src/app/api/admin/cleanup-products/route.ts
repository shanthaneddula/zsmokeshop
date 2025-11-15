// API endpoint to clean up old test products and invalid data
import { NextRequest, NextResponse } from 'next/server';
import * as ProductStorage from '@/lib/product-storage-service';
import { AdminProduct } from '@/types/admin';
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

    console.log('🧹 Starting cleanup of old products...');
    
    // Read all products
    const products = await ProductStorage.readProducts();
    console.log(`📊 Total products before cleanup: ${products.length}`);

    // Identify products to remove
    const testProducts = products.filter(p => {
      // Test product patterns
      const isTestName = /^(test|jnklj|hgkhgkh|asdf|qwerty)/i.test(p.name);
      const hasInvalidSKU = p.sku && /^(test|temp|xxx)/i.test(p.sku);
      const hasMissingImage = !p.image || p.image === '';
      const isOldDraft = p.status === 'draft' && new Date(p.createdAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days old
      
      return isTestName || hasInvalidSKU || hasMissingImage || isOldDraft;
    });

    console.log(`🗑️ Found ${testProducts.length} test/invalid products to remove`);

    // Log what will be removed
    testProducts.forEach(p => {
      console.log(`  - ${p.name} (${p.id}) - SKU: ${p.sku || 'N/A'}`);
    });

    // Get products to keep
    const cleanProducts = products.filter(p => {
      return !testProducts.some(tp => tp.id === p.id);
    });

    // Write cleaned products back
    await ProductStorage.writeProducts(cleanProducts);

    console.log(`✅ Cleanup complete. Removed ${testProducts.length} products`);
    console.log(`📊 Total products after cleanup: ${cleanProducts.length}`);

    return NextResponse.json({
      success: true,
      data: {
        removed: testProducts.length,
        remaining: cleanProducts.length,
        removedProducts: testProducts.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          reason: getRemovalReason(p)
        }))
      },
      message: `Successfully removed ${testProducts.length} test/invalid products`
    });

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clean up products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getRemovalReason(product: AdminProduct): string {
  const reasons = [];
  
  if (/^(test|jnklj|hgkhgkh|asdf|qwerty)/i.test(product.name)) {
    reasons.push('Test name pattern');
  }
  if (product.sku && /^(test|temp|xxx)/i.test(product.sku)) {
    reasons.push('Invalid SKU');
  }
  if (!product.image || product.image === '') {
    reasons.push('Missing image');
  }
  if (product.status === 'draft' && new Date(product.createdAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
    reasons.push('Old draft (>30 days)');
  }
  
  return reasons.join(', ');
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Use POST method to trigger cleanup',
    info: {
      endpoint: '/api/admin/cleanup-products',
      method: 'POST',
      authentication: 'Required (admin-token cookie)',
      description: 'Removes test products and invalid data',
      criteria: [
        'Test name patterns (test, jnklj, asdf, etc.)',
        'Invalid SKU patterns (test, temp, xxx)',
        'Missing images',
        'Old drafts (>30 days)'
      ]
    }
  }, { status: 405 });
}
