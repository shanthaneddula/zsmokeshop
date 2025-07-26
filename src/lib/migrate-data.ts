// Data migration utility to convert existing static data to JSON files

import { writeProducts, writeCategories, generateId } from './json-utils';
import { AdminProduct, AdminCategory } from '@/types/admin';
import { products as staticProducts, categories as staticCategories } from '@/data';

// Migrate existing static data to JSON files
export async function migrateStaticData() {
  try {
    console.log('Starting data migration...');

    // Convert categories
    const adminCategories: AdminCategory[] = staticCategories.map((category, index) => ({
      ...category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      productCount: staticProducts.filter(p => p.category === category.slug).length,
      status: 'active' as const,
      sortOrder: index + 1,
      seoTitle: `${category.name} | Z Smoke Shop - Austin, TX`,
      seoDescription: category.description || `Shop ${category.name.toLowerCase()} at Z Smoke Shop in Austin, TX. Premium quality products with fast delivery.`
    }));

    // Convert products
    const adminProducts: AdminProduct[] = staticProducts.map((product) => ({
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active' as const,
      imageHistory: [product.image],
      sku: `ZSS-${product.id.toUpperCase()}`,
      weight: `${(Math.random() * 2 + 0.1).toFixed(1)} lbs`, // Random weight between 0.1-2.1 lbs
      dimensions: `${Math.floor(Math.random() * 10) + 2}x${Math.floor(Math.random() * 8) + 2}x${Math.floor(Math.random() * 6) + 1} inches`
    }));

    // Write to JSON files
    await writeCategories(adminCategories);
    await writeProducts(adminProducts);

    console.log(`Migration completed successfully:`);
    console.log(`- ${adminCategories.length} categories migrated`);
    console.log(`- ${adminProducts.length} products migrated`);

    return {
      success: true,
      categoriesCount: adminCategories.length,
      productsCount: adminProducts.length
    };

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Create sample admin data if no data exists
export async function createSampleData() {
  try {
    console.log('Creating sample admin data...');

    // Sample categories
    const sampleCategories: AdminCategory[] = [
      {
        id: generateId('cat'),
        name: 'Vapes & Mods',
        slug: 'vapes-mods',
        description: 'Electronic vaporizers and mod devices',
        image: '/images/categories/vapes.svg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        productCount: 0,
        status: 'active',
        sortOrder: 1,
        seoTitle: 'Vapes & Mods | Z Smoke Shop - Austin, TX',
        seoDescription: 'Shop premium vapes and mod devices at Z Smoke Shop in Austin, TX.'
      },
      {
        id: generateId('cat'),
        name: 'Glass',
        slug: 'glass',
        description: 'Premium glass smoking accessories',
        image: '/images/categories/glass.svg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        productCount: 0,
        status: 'active',
        sortOrder: 2,
        seoTitle: 'Glass | Z Smoke Shop - Austin, TX',
        seoDescription: 'Premium glass smoking accessories at Z Smoke Shop in Austin, TX.'
      }
    ];

    // Sample products
    const sampleProducts: AdminProduct[] = [
      
    ];

    // Write sample data
    await writeCategories(sampleCategories);
    await writeProducts(sampleProducts);

    console.log('Sample data created successfully');

    return {
      success: true,
      categoriesCount: sampleCategories.length,
      productsCount: sampleProducts.length
    };

  } catch (error) {
    console.error('Failed to create sample data:', error);
    throw error;
  }
}

// Check if migration is needed
export async function checkMigrationStatus() {
  try {
    const { readProducts, readCategories } = await import('./json-utils');
    const [products, categories] = await Promise.all([
      readProducts(),
      readCategories()
    ]);

    return {
      hasProducts: products.length > 0,
      hasCategories: categories.length > 0,
      productsCount: products.length,
      categoriesCount: categories.length,
      needsMigration: products.length === 0 && categories.length === 0
    };
  } catch (error) {
    return {
      hasProducts: false,
      hasCategories: false,
      productsCount: 0,
      categoriesCount: 0,
      needsMigration: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
