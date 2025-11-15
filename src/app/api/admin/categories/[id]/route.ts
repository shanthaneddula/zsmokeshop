// Individual Category API routes - GET, PUT, DELETE
import { NextRequest, NextResponse } from 'next/server';
import * as CategoryStorage from '@/lib/category-storage-service';
import * as ProductStorage from '@/lib/product-storage-service';
import { AdminCategory } from '@/types/admin';

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Validation schema for category updates
function validateCategoryUpdateData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim().length === 0)) {
    errors.push('Category name must be a non-empty string');
  }

  if (data.slug !== undefined && (typeof data.slug !== 'string' || data.slug.trim().length === 0)) {
    errors.push('Slug must be a non-empty string');
  }

  if (data.status !== undefined && !['active', 'inactive'].includes(data.status)) {
    errors.push('Status must be active or inactive');
  }

  if (data.sortOrder !== undefined && (typeof data.sortOrder !== 'number' || data.sortOrder < 0)) {
    errors.push('Sort order must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// GET /api/admin/categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Category ID is required'
      }, { status: 400 });
    }

    const category = await CategoryStorage.getCategory(id);

    if (!category) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }

    // Update product count
    await CategoryStorage.updateProductCounts();
    const updatedCategory = await CategoryStorage.getCategory(id);

    return NextResponse.json({
      success: true,
      data: updatedCategory
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch category'
    }, { status: 500 });
  }
}

// PUT /api/admin/categories/[id] - Update category
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
        error: 'Category ID is required'
      }, { status: 400 });
    }

    // Validate update data
    const validation = validateCategoryUpdateData(body);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 });
    }

    // Check if category exists
    const existingCategory = await CategoriesJsonUtils.findCategoryById(id);
    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }

    // Generate new slug if name is being updated
    let newSlug = body.slug;
    if (body.name && !body.slug) {
      newSlug = generateSlug(body.name);
    }

    // Check for duplicate name or slug if they're being updated
    if (body.name || newSlug) {
      const allCategories = await CategoryStorage.readCategories();
      
      if (body.name) {
        const duplicateName = allCategories.find(c => 
          c.name.toLowerCase() === body.name.trim().toLowerCase() && c.id !== id
        );
        if (duplicateName) {
          return NextResponse.json({
            success: false,
            error: 'Category with this name already exists'
          }, { status: 409 });
        }
      }

      if (newSlug && newSlug !== existingCategory.slug) {
        const duplicateSlug = allCategories.find(c => c.slug === newSlug && c.id !== id);
        if (duplicateSlug) {
          return NextResponse.json({
            success: false,
            error: 'Category with this slug already exists'
          }, { status: 409 });
        }
      }
    }

    // Prepare update data
    const updateData: Partial<AdminCategory> = {};
    
    // Only include fields that are being updated
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (newSlug !== undefined) updateData.slug = newSlug;
    if (body.description !== undefined) updateData.description = body.description?.trim() || '';
    if (body.image !== undefined) updateData.image = body.image?.trim() || '';
    if (body.status !== undefined) updateData.status = body.status;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle?.trim() || '';
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription?.trim() || '';
    if (body.parentId !== undefined) updateData.parentId = body.parentId?.trim() || undefined;

    // Update the category
    const updatedCategory = await CategoryStorage.updateCategory(id, updateData);

    if (!updatedCategory) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update category'
      }, { status: 500 });
    }

    // If slug changed, we need to update all products using the old slug
    if (newSlug && newSlug !== existingCategory.slug) {
      try {
        const products = await ProductStorage.readProducts();
        const productsToUpdate = products.filter(p => p.category === existingCategory.slug);
        
        for (const product of productsToUpdate) {
          await ProductStorage.updateProduct(product.id, { 
            category: newSlug,
            updatedBy: 'admin' // TODO: Get from auth context
          });
        }

        console.log(`Updated ${productsToUpdate.length} products with new category slug`);
      } catch (error) {
        console.error('Error updating products with new category slug:', error);
        // Don't fail the category update if product updates fail
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully'
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update category'
    }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const reassignTo = searchParams.get('reassignTo'); // Optional category to reassign products to

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Category ID is required'
      }, { status: 400 });
    }

    // Check if category exists
    const existingCategory = await CategoriesJsonUtils.findCategoryById(id);
    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }

    // Check for products using this category
    const productsInCategory = await ProductStorage.getProductsByCategory(existingCategory.slug);
    let targetCategory = null;
    
    if (productsInCategory.length > 0) {
      if (!reassignTo) {
        return NextResponse.json({
          success: false,
          error: `Cannot delete category with ${productsInCategory.length} products. Please reassign products first or provide a reassignTo category.`,
          details: {
            productCount: productsInCategory.length,
            products: productsInCategory.map(p => ({ id: p.id, name: p.name }))
          }
        }, { status: 409 });
      }

      // Validate reassign target category
      targetCategory = await CategoryStorage.getCategory(reassignTo);
      if (!targetCategory) {
        return NextResponse.json({
          success: false,
          error: 'Target category for reassignment not found'
        }, { status: 400 });
      }

      // Reassign all products to the target category
      try {
        for (const product of productsInCategory) {
          await ProductStorage.updateProduct(product.id, { 
            category: targetCategory.slug,
            updatedBy: 'admin' // TODO: Get from auth context
          });
        }
        console.log(`Reassigned ${productsInCategory.length} products to category ${targetCategory.name}`);
      } catch (error) {
        console.error('Error reassigning products:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to reassign products to target category'
        }, { status: 500 });
      }
    }

    // Delete the category
    await CategoryStorage.deleteCategory(id);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
      data: { 
        deletedId: id,
        reassignedProducts: productsInCategory.length,
        reassignedTo: reassignTo ? targetCategory?.name : null
      }
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete category'
    }, { status: 500 });
  }
}
