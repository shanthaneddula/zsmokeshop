// Public API endpoint for shop categories
// Serves only active categories from admin-managed data
import { NextResponse } from 'next/server';
import { CategoriesJsonUtils } from '@/lib/admin/json-utils';
import { AdminCategory } from '@/types/admin';
import { Category } from '@/types';

// Convert AdminCategory to public Category format
function convertToPublicCategory(adminCategory: AdminCategory): Category {
  return {
    id: adminCategory.id,
    name: adminCategory.name,
    slug: adminCategory.slug,
    image: adminCategory.image || '/images/categories/default.svg'
  };
}

export async function GET() {
  try {
    // Update product counts first
    await CategoriesJsonUtils.updateProductCounts();
    
    // Re-read categories after product count update
    const updatedCategories = await CategoriesJsonUtils.readCategories();
    
    // Filter only active categories for public shop (show all active, even with 0 products)
    const activeCategories = updatedCategories
      .filter(category => category.status === 'active')
      .sort((a, b) => a.sortOrder - b.sortOrder) // Sort by admin-defined order
      .map(convertToPublicCategory);

    return NextResponse.json({
      success: true,
      categories: activeCategories,
      total: activeCategories.length
    });

  } catch (error) {
    console.error('Error fetching shop categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
        categories: [],
        total: 0
      },
      { status: 500 }
    );
  }
}
