// Public API endpoint for shop categories
// Serves only active categories from admin-managed data
import { NextResponse } from 'next/server';
import { AdminCategory } from '@/types/admin';
import { Category } from '@/types';
import { CategoriesJsonUtils } from '@/lib/admin/json-utils';

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
    // Read categories from storage (already using the right method)
    const categories = await CategoriesJsonUtils.readCategories();
    
    // Filter only active categories for public shop (show all active, even with 0 products)
    const activeCategories = categories
      .filter(category => category.status === 'active')
      .sort((a, b) => a.sortOrder - b.sortOrder) // Sort by admin-defined order
      .map(convertToPublicCategory);

    const response = NextResponse.json({
      success: true,
      data: {
        categories: activeCategories,
        total: activeCategories.length
      }
    });
    
    // Add cache headers to prevent stale data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error) {
    console.error('Error fetching shop categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
        data: {
          categories: [],
          total: 0
        }
      },
      { status: 500 }
    );
  }
}
