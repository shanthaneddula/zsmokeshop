// Individual Product API routes - GET, PUT, DELETE
import { NextRequest, NextResponse } from 'next/server';
import * as ProductStorage from '@/lib/product-storage-service';
import { AdminProduct } from '@/types';
import { generateSlug } from '@/lib/json-utils';
import { verifyAdminAuth } from '@/lib/auth-server';
import { logActivity } from '@/lib/activity-log-service';

// Validation schema for product updates
function validateProductUpdateData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim().length === 0)) {
    errors.push('Product name must be a non-empty string');
  }

  if (data.category !== undefined && (typeof data.category !== 'string' || data.category.trim().length === 0)) {
    errors.push('Category must be a non-empty string');
  }

  if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
    errors.push('Price must be a positive number');
  }

  if (data.salePrice !== undefined && (typeof data.salePrice !== 'number' || data.salePrice < 0)) {
    errors.push('Sale price must be a positive number');
  }

  if (data.salePrice !== undefined && data.price !== undefined && data.salePrice >= data.price) {
    errors.push('Sale price must be less than regular price');
  }

  if (data.image !== undefined && (typeof data.image !== 'string' || data.image.trim().length === 0)) {
    errors.push('Image must be a non-empty string');
  }

  if (data.inStock !== undefined && typeof data.inStock !== 'boolean') {
    errors.push('In stock status must be true or false');
  }

  if (data.status !== undefined && !['active', 'inactive', 'draft'].includes(data.status)) {
    errors.push('Status must be active, inactive, or draft');
  }

  if (data.badges !== undefined && !Array.isArray(data.badges)) {
    errors.push('Badges must be an array');
  }

  if (data.weight !== undefined && (typeof data.weight !== 'number' || data.weight < 0)) {
    errors.push('Weight must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// GET /api/admin/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 });
    }

    const product = await ProductStorage.getProduct(id);

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch product'
    }, { status: 500 });
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Check edit permission for employee users
    if ('permissions' in user && !user.permissions.editProducts) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to edit products' },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 });
    }

    // Validate update data
    const validation = validateProductUpdateData(body);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await ProductStorage.getProduct(id);
    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    // Check for duplicate SKU if SKU is being updated
    if (body.sku && body.sku !== existingProduct.sku) {
      const allProducts = await ProductStorage.readProducts();
      const duplicateSku = allProducts.find(p => p.sku === body.sku && p.id !== id);
      if (duplicateSku) {
        return NextResponse.json({
          success: false,
          error: 'Product with this SKU already exists'
        }, { status: 409 });
      }
    }

    // Track changes for activity log
    const changes: Record<string, { old: any; new: any }> = {};

    // Prepare update data
    const updateData: Partial<AdminProduct> = {};
    
    // Only include fields that are being updated
    if (body.name !== undefined && body.name !== existingProduct.name) {
      updateData.name = body.name.trim();
      updateData.slug = generateSlug(body.name.trim());
      changes.name = { old: existingProduct.name, new: body.name.trim() };
    }
    if (body.category !== undefined && body.category !== existingProduct.category) {
      updateData.category = body.category.trim();
      changes.category = { old: existingProduct.category, new: body.category.trim() };
    }
    if (body.price !== undefined && body.price !== existingProduct.price) {
      updateData.price = body.price;
      changes.price = { old: existingProduct.price, new: body.price };
    }
    if (body.salePrice !== undefined && body.salePrice !== existingProduct.salePrice) {
      updateData.salePrice = body.salePrice;
      changes.salePrice = { old: existingProduct.salePrice, new: body.salePrice };
    }
    if (body.image !== undefined && body.image !== existingProduct.image) {
      updateData.image = body.image.trim();
      changes.image = { old: existingProduct.image, new: body.image.trim() };
    }
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription?.trim() || '';
    if (body.detailedDescription !== undefined) updateData.detailedDescription = body.detailedDescription?.trim() || '';
    if (body.brand !== undefined && body.brand !== existingProduct.brand) {
      updateData.brand = body.brand?.trim() || '';
      changes.brand = { old: existingProduct.brand, new: body.brand?.trim() || '' };
    }
    if (body.inStock !== undefined && body.inStock !== existingProduct.inStock) {
      updateData.inStock = body.inStock;
      changes.inStock = { old: existingProduct.inStock, new: body.inStock };
    }
    if (body.stockQuantity !== undefined && body.stockQuantity !== existingProduct.stockQuantity) {
      updateData.stockQuantity = body.stockQuantity;
      changes.stockQuantity = { old: existingProduct.stockQuantity, new: body.stockQuantity };
      
      // Automatically update badges based on stock quantity
      const currentBadges = existingProduct.badges || [];
      if (body.stockQuantity > 0) {
        // Remove 'out-of-stock' badge if stock is available
        updateData.badges = currentBadges.filter(badge => badge !== 'out-of-stock');
      } else {
        // Add 'out-of-stock' badge if stock is 0 and not already present
        if (!currentBadges.includes('out-of-stock')) {
          updateData.badges = [...currentBadges, 'out-of-stock'];
        }
      }
    }
    if (body.badges !== undefined) updateData.badges = body.badges;
    if (body.sku !== undefined) updateData.sku = body.sku?.trim() || '';
    if (body.weight !== undefined) updateData.weight = body.weight;
    if (body.dimensions !== undefined) updateData.dimensions = body.dimensions;
    if (body.status !== undefined && body.status !== existingProduct.status) {
      updateData.status = body.status;
      changes.status = { old: existingProduct.status, new: body.status };
    }
    
    // Add metadata
    updateData.updatedBy = user.username;

    // Update the product
    const updatedProduct = await ProductStorage.updateProduct(id, updateData);

    if (!updatedProduct) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update product'
      }, { status: 500 });
    }

    // Log activity if there were changes
    if (Object.keys(changes).length > 0) {
      await logActivity(
        'id' in user ? user.id : 'admin',
        user.username,
        'UPDATE_PRODUCT',
        'product',
        `Updated product: ${updatedProduct.name}`,
        id,
        changes
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update product'
    }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Check delete permission for employee users
    if ('permissions' in user && !user.permissions.deleteProducts) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to delete products' },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 });
    }

    // Check if product exists before deletion
    const existingProduct = await ProductStorage.getProduct(id);
    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    // Delete the product
    await ProductStorage.deleteProduct(id);

    // Log activity
    await logActivity(
      'id' in user ? user.id : 'admin',
      user.username,
      'DELETE_PRODUCT',
      'product',
      `Deleted product: ${existingProduct.name}`,
      id,
      {
        name: { old: existingProduct.name, new: null },
        category: { old: existingProduct.category, new: null },
      }
    );

    // TODO: Clean up associated images
    // This would be implemented in Phase 3 with image management

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      data: { deletedId: id }
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete product'
    }, { status: 500 });
  }
}
