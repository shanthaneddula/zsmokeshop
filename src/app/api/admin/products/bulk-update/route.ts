// Bulk Update API - Update multiple products at once
import { NextRequest, NextResponse } from 'next/server';
import { readProducts, writeProducts } from '@/lib/product-storage-service';
import { verifyAdminAuth } from '@/lib/auth-server';
import { logActivity } from '@/lib/activity-log-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type PriceUpdateType = 
  | 'set-price'
  | 'set-sale-price'
  | 'increase-percent'
  | 'decrease-percent'
  | 'increase-amount'
  | 'decrease-amount'
  | 'remove-sale-price';

interface BulkUpdateRequest {
  productIds: string[];
  // For status updates
  status?: 'active' | 'inactive' | 'draft';
  // For category updates
  category?: string;
  // For price updates
  priceUpdateType?: PriceUpdateType;
  priceValue?: number;
}

function roundToTwoDecimals(num: number): number {
  return Math.round(num * 100) / 100;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAdminAuth(request);
    
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Check permissions for employee users
    if ('permissions' in user && !user.permissions.editProducts) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to update products' },
        { status: 403 }
      );
    }

    const body: BulkUpdateRequest = await request.json();
    const { productIds, status, category, priceUpdateType, priceValue } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product IDs are required' },
        { status: 400 }
      );
    }

    // Validate that at least one update type is provided
    if (!status && !category && !priceUpdateType) {
      return NextResponse.json(
        { success: false, error: 'Either status, category, or priceUpdateType must be provided' },
        { status: 400 }
      );
    }

    // Validate price update parameters
    if (priceUpdateType && priceUpdateType !== 'remove-sale-price') {
      if (priceValue === undefined || priceValue <= 0) {
        return NextResponse.json(
          { success: false, error: 'Valid price value is required for price updates' },
          { status: 400 }
        );
      }
    }

    // Read all products
    const products = await readProducts();
    
    let updatedCount = 0;
    const errors: string[] = [];
    const updatedProductNames: string[] = [];

    // Update products
    const updatedProducts = products.map(product => {
      if (!productIds.includes(product.id)) {
        return product;
      }

      try {
        const updates: Record<string, unknown> = {
          updatedAt: new Date().toISOString(),
          updatedBy: user.username
        };

        // Handle status update
        if (status) {
          updates.status = status;
        }

        // Handle category update
        if (category) {
          updates.category = category;
        }

        // Handle price updates
        if (priceUpdateType) {
          const currentPrice = product.price || 0;
          const currentSalePrice = product.salePrice;

          switch (priceUpdateType) {
            case 'set-price':
              updates.price = priceValue;
              break;

            case 'set-sale-price':
              if (priceValue && priceValue >= currentPrice) {
                errors.push(`${product.name}: Sale price must be less than regular price`);
                return product;
              }
              updates.salePrice = priceValue;
              break;

            case 'increase-percent':
              updates.price = roundToTwoDecimals(currentPrice * (1 + (priceValue! / 100)));
              // Also increase sale price if it exists
              if (currentSalePrice) {
                updates.salePrice = roundToTwoDecimals(currentSalePrice * (1 + (priceValue! / 100)));
              }
              break;

            case 'decrease-percent':
              const decreasedPrice = roundToTwoDecimals(currentPrice * (1 - (priceValue! / 100)));
              if (decreasedPrice < 0.01) {
                errors.push(`${product.name}: Price would become zero or negative`);
                return product;
              }
              updates.price = decreasedPrice;
              // Also decrease sale price if it exists
              if (currentSalePrice) {
                const decreasedSalePrice = roundToTwoDecimals(currentSalePrice * (1 - (priceValue! / 100)));
                if (decreasedSalePrice >= 0.01) {
                  updates.salePrice = decreasedSalePrice;
                } else {
                  updates.salePrice = undefined;
                }
              }
              break;

            case 'increase-amount':
              updates.price = roundToTwoDecimals(currentPrice + priceValue!);
              // Also increase sale price if it exists
              if (currentSalePrice) {
                updates.salePrice = roundToTwoDecimals(currentSalePrice + priceValue!);
              }
              break;

            case 'decrease-amount':
              const newPrice = roundToTwoDecimals(currentPrice - priceValue!);
              if (newPrice < 0.01) {
                errors.push(`${product.name}: Price would become zero or negative`);
                return product;
              }
              updates.price = newPrice;
              // Also decrease sale price if it exists
              if (currentSalePrice) {
                const newSalePrice = roundToTwoDecimals(currentSalePrice - priceValue!);
                if (newSalePrice >= 0.01 && newSalePrice < newPrice) {
                  updates.salePrice = newSalePrice;
                } else {
                  updates.salePrice = undefined;
                }
              }
              break;

            case 'remove-sale-price':
              updates.salePrice = undefined;
              break;
          }
        }

        updatedCount++;
        updatedProductNames.push(product.name);

        return {
          ...product,
          ...updates
        };
      } catch (err) {
        errors.push(`${product.name}: ${err instanceof Error ? err.message : 'Update failed'}`);
        return product;
      }
    });
category
      ? `Bulk updated category to "${category}" for ${updatedCount} products`
      : 
    // Save updated products
    await writeProducts(updatedProducts);

    // Log activity
    const actionDescription = status 
      ? `Bulk updated status to "${status}" for ${updatedCount} products`
      : `Bulk updated prices (${priceUpdateType}) for ${updatedCount} products`;

    await logActivity(
      'id' in user ? user.id : 'admin',
      user.username,
      'BULK_UPDATE_PRODUCTS',
      'product',
      actionDescription,
      undefined,
      {
        operation: { 
          old: null, 
          new: JSON.stringify({ 
            productIds, 
            status, 
            priceUpdateType, 
            priceValue, 
            updatedCount,
            errors: errors.length > 0 ? errors : undefined 
          })
        }
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        updatedCount,
        totalRequested: productIds.length,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `Successfully updated ${updatedCount} product${updatedCount !== 1 ? 's' : ''}`
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update products'
      },
      { status: 500 }
    );
  }
}
