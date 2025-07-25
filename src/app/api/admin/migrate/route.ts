// Data migration API route - Convert existing data to admin-managed format

import { NextRequest, NextResponse } from 'next/server';
import { ProductsJsonUtils, CategoriesJsonUtils, JsonUtils } from '@/lib/admin/json-utils';
import { generateSlug } from '@/lib/json-utils';
import { AdminProduct, AdminCategory } from '@/types/admin';
import { categories, products } from '@/data/index';

// Check migration status
export async function GET() {
  try {
    const existingProducts = await ProductsJsonUtils.readProducts();
    const existingCategories = await CategoriesJsonUtils.readCategories();
    
    const status = {
      productsJsonExists: existingProducts.length > 0,
      categoriesJsonExists: existingCategories.length > 0,
      staticProductsCount: products.length,
      staticCategoriesCount: categories.length,
      adminProductsCount: existingProducts.length,
      adminCategoriesCount: existingCategories.length,
      migrationNeeded: existingProducts.length === 0 || existingCategories.length === 0
    };

    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Migration status check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check migration status'
      },
      { status: 500 }
    );
  }
}

// Perform migration
export async function POST(request: NextRequest) {
  try {
    const { action, force } = await request.json();

    if (action !== 'migrate') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Use "migrate"'
        },
        { status: 400 }
      );
    }

    // Initialize data files
    await JsonUtils.initializeDataFiles();

    // Check if migration already exists
    const existingProducts = await ProductsJsonUtils.readProducts();
    const existingCategories = await CategoriesJsonUtils.readCategories();
    
    if ((existingProducts.length > 0 || existingCategories.length > 0) && !force) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin data already exists. Use force=true to overwrite.',
          data: {
            existingProducts: existingProducts.length,
            existingCategories: existingCategories.length
          }
        },
        { status: 409 }
      );
    }

    const migrationResults = {
      categoriesMigrated: 0,
      productsMigrated: 0,
      errors: [] as string[]
    };

    // Migrate categories first
    try {
      const adminCategories: AdminCategory[] = categories.map((cat, index) => ({
        id: `cat_${Date.now()}_${index}`,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        image: cat.image || '',
        status: 'active' as const,
        sortOrder: index,
        productCount: 0, // Will be calculated
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        seoTitle: cat.name,
        seoDescription: cat.description || `Shop ${cat.name} products at Z Smoke Shop`
      }));

      await CategoriesJsonUtils.writeCategories(adminCategories);
      migrationResults.categoriesMigrated = adminCategories.length;
    } catch (error) {
      migrationResults.errors.push(`Category migration failed: ${error}`);
    }

    // Migrate products
    try {
      const adminProducts: AdminProduct[] = products.map((prod, index) => ({
        id: `prod_${Date.now()}_${index}`,
        name: prod.name,
        slug: generateSlug(prod.name),
        category: prod.category,
        price: prod.price,
        salePrice: prod.salePrice,
        image: prod.image,
        description: prod.description || '',
        brand: prod.brand || '',
        inStock: prod.inStock,
        badges: prod.badges || [],
        sku: `SKU-${Date.now()}-${index}`,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        imageHistory: prod.image ? [prod.image] : [],
        createdBy: 'migration',
        updatedBy: 'migration'
      }));

      await ProductsJsonUtils.writeProducts(adminProducts);
      migrationResults.productsMigrated = adminProducts.length;
    } catch (error) {
      migrationResults.errors.push(`Product migration failed: ${error}`);
    }

    // Update category product counts
    try {
      await CategoriesJsonUtils.updateProductCounts();
    } catch (error) {
      migrationResults.errors.push(`Product count update failed: ${error}`);
    }

    const success = migrationResults.errors.length === 0;

    return NextResponse.json({
      success,
      data: migrationResults,
      message: success 
        ? 'Data migration completed successfully' 
        : 'Migration completed with errors'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
