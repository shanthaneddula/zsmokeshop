// Products API routes - GET (list) and POST (create)
import { NextRequest, NextResponse } from 'next/server';
import { ProductsJsonUtils } from '@/lib/admin/json-utils';
import { AdminProduct } from '@/types';
import { generateSlug } from '@/lib/json-utils';

// Validation schema for product data
function validateProductData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Product name is required');
  }

  if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (data.price === undefined || data.price === null || typeof data.price !== 'number' || data.price < 0) {
    errors.push('Valid price is required');
  }

  if (data.salePrice !== undefined && (typeof data.salePrice !== 'number' || data.salePrice < 0)) {
    errors.push('Sale price must be a valid number');
  }

  if (data.salePrice !== undefined && data.price !== undefined && data.salePrice >= data.price) {
    errors.push('Sale price must be less than regular price');
  }

  if (!data.image || typeof data.image !== 'string' || data.image.trim().length === 0) {
    errors.push('Product image is required');
  }

  if (data.inStock !== undefined && typeof data.inStock !== 'boolean') {
    errors.push('In stock status must be true or false');
  }

  if (data.status && !['active', 'inactive', 'draft'].includes(data.status)) {
    errors.push('Status must be active, inactive, or draft');
  }

  if (data.badges && !Array.isArray(data.badges)) {
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

// GET /api/admin/products - List products with optional filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({
        success: false,
        error: 'Invalid pagination parameters'
      }, { status: 400 });
    }

    let products = await ProductsJsonUtils.readProducts();

    // Apply filters
    if (category) {
      products = products.filter(p => p.category === category);
    }

    if (search) {
      const searchResults = await ProductsJsonUtils.searchProducts(search);
      const searchIds = new Set(searchResults.map(p => p.id));
      products = products.filter(p => searchIds.has(p.id));
    }

    if (status) {
      products = products.filter(p => p.status === status);
    }

    // Apply sorting
    const validSortFields = ['name', 'price', 'category', 'status', 'createdAt', 'updatedAt', 'brand'] as const;
    type ValidSortField = typeof validSortFields[number];
    
    const safeSortBy = validSortFields.includes(sortBy as ValidSortField) ? sortBy as ValidSortField : 'updatedAt';
    
    products.sort((a, b) => {
      let aValue: string | number | Date = a[safeSortBy] || '';
      let bValue: string | number | Date = b[safeSortBy] || '';

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Calculate pagination
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        },
        filters: {
          category,
          search,
          status,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch products'
    }, { status: 500 });
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const validation = validateProductData(body);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 });
    }

    // Prepare product data with defaults
    const productData = {
      name: body.name.trim(),
      slug: generateSlug(body.name.trim()),
      category: body.category.trim(),
      price: body.price,
      salePrice: body.salePrice,
      image: body.image.trim(),

      shortDescription: body.shortDescription?.trim() || '',
      detailedDescription: body.detailedDescription?.trim() || '',
      brand: body.brand?.trim() || '',
      inStock: body.inStock !== undefined ? body.inStock : true,
      badges: body.badges || [],
      sku: body.sku?.trim() || '',
      weight: body.weight,
      dimensions: body.dimensions,
      status: body.status || 'active' as const,
      createdBy: 'admin', // TODO: Get from auth context
      updatedBy: 'admin'
    };

    // Check for duplicate SKU if provided
    if (productData.sku) {
      const existingProducts = await ProductsJsonUtils.readProducts();
      const duplicateSku = existingProducts.find(p => p.sku === productData.sku);
      if (duplicateSku) {
        return NextResponse.json({
          success: false,
          error: 'Product with this SKU already exists'
        }, { status: 409 });
      }
    }

    // Create the product
    const newProduct = await ProductsJsonUtils.createProduct(productData);

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create product'
    }, { status: 500 });
  }
}
