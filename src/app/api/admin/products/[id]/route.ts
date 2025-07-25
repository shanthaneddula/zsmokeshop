// Individual Product API routes - GET, PUT, DELETE
import { NextRequest, NextResponse } from 'next/server';
import { ProductsJsonUtils } from '@/lib/admin/json-utils';
import { AdminProduct } from '@/types/admin';
import { generateSlug } from '@/lib/json-utils';

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

    const product = await ProductsJsonUtils.findProductById(id);

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
    const existingProduct = await ProductsJsonUtils.findProductById(id);
    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    // Check for duplicate SKU if SKU is being updated
    if (body.sku && body.sku !== existingProduct.sku) {
      const allProducts = await ProductsJsonUtils.readProducts();
      const duplicateSku = allProducts.find(p => p.sku === body.sku && p.id !== id);
      if (duplicateSku) {
        return NextResponse.json({
          success: false,
          error: 'Product with this SKU already exists'
        }, { status: 409 });
      }
    }

    // Prepare update data
    const updateData: Partial<AdminProduct> = {};
    
    // Only include fields that are being updated
    if (body.name !== undefined) {
      updateData.name = body.name.trim();
      updateData.slug = generateSlug(body.name.trim());
    }
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.price !== undefined) updateData.price = body.price;
    if (body.salePrice !== undefined) updateData.salePrice = body.salePrice;
    if (body.image !== undefined) updateData.image = body.image.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || '';
    if (body.brand !== undefined) updateData.brand = body.brand?.trim() || '';
    if (body.inStock !== undefined) updateData.inStock = body.inStock;
    if (body.badges !== undefined) updateData.badges = body.badges;
    if (body.sku !== undefined) updateData.sku = body.sku?.trim() || '';
    if (body.weight !== undefined) updateData.weight = body.weight;
    if (body.dimensions !== undefined) updateData.dimensions = body.dimensions;
    if (body.status !== undefined) updateData.status = body.status;
    
    // Add metadata
    updateData.updatedBy = 'admin'; // TODO: Get from auth context

    // Update the product
    const updatedProduct = await ProductsJsonUtils.updateProduct(id, updateData);

    if (!updatedProduct) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update product'
      }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 });
    }

    // Check if product exists before deletion
    const existingProduct = await ProductsJsonUtils.findProductById(id);
    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    // Delete the product
    const deleted = await ProductsJsonUtils.deleteProduct(id);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete product'
      }, { status: 500 });
    }

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
