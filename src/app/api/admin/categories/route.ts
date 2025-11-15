// Admin categories API route - GET (list) and POST (create)
import { NextRequest, NextResponse } from 'next/server';
import * as CategoryStorage from '@/lib/category-storage-service';
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

// Validation schema for category data
function validateCategoryData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Category name is required');
  }

  if (data.slug && (typeof data.slug !== 'string' || data.slug.trim().length === 0)) {
    errors.push('Slug must be a non-empty string if provided');
  }

  if (data.status && !['active', 'inactive'].includes(data.status)) {
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

// GET /api/admin/categories - List categories with optional filtering and sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'sortOrder';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const updateCounts = searchParams.get('updateCounts');

    let categories = await CategoryStorage.readCategories();

    // Update product counts if requested
    if (updateCounts === 'true') {
      await CategoryStorage.updateProductCounts();
      categories = await CategoryStorage.readCategories();
    }

    // Apply filters
    if (status) {
      categories = categories.filter(c => c.status === status);
    }

    // Apply sorting
    categories.sort((a, b) => {
      let aValue: any = a[sortBy as keyof AdminCategory];
      let bValue: any = b[sortBy as keyof AdminCategory];

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        categories,
        totalCategories: categories.length,
        filters: {
          status,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch categories'
    }, { status: 500 });
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const validation = validateCategoryData(body);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 });
    }

    // Generate slug if not provided
    const slug = body.slug?.trim() || generateSlug(body.name);

    // Check for duplicate name or slug
    const existingCategories = await CategoryStorage.readCategories();
    const duplicateName = existingCategories.find(c => 
      c.name.toLowerCase() === body.name.trim().toLowerCase()
    );
    const duplicateSlug = existingCategories.find(c => c.slug === slug);

    if (duplicateName) {
      return NextResponse.json({
        success: false,
        error: 'Category with this name already exists'
      }, { status: 409 });
    }

    if (duplicateSlug) {
      return NextResponse.json({
        success: false,
        error: 'Category with this slug already exists'
      }, { status: 409 });
    }

    // Prepare category data with defaults
    const categoryData = {
      name: body.name.trim(),
      slug,
      description: body.description?.trim() || '',
      image: body.image?.trim() || '',
      status: body.status || 'active' as const,
      sortOrder: body.sortOrder !== undefined ? body.sortOrder : existingCategories.length,
      seoTitle: body.seoTitle?.trim() || body.name.trim(),
      seoDescription: body.seoDescription?.trim() || body.description?.trim() || '',
      parentId: body.parentId?.trim() || undefined,
      productCount: 0
    };

    // Create the category
    const newCategory = await CategoryStorage.createCategory(categoryData);

    return NextResponse.json({
      success: true,
      data: newCategory,
      message: 'Category created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create category'
    }, { status: 500 });
  }
}
