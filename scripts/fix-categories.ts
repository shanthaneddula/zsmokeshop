/**
 * Analyze product categories and sync with category list
 */
import { Redis } from 'ioredis';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function analyzeAndFixCategories() {
  const redis = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  // Get products
  const productsData = await redis.get('zsmokeshop:products');
  const products = productsData ? JSON.parse(productsData) : [];
  
  // Get categories
  const categoriesData = await redis.get('zsmokeshop:categories');
  const categories = categoriesData ? JSON.parse(categoriesData) : [];
  
  console.log('📊 Current Data:');
  console.log(`  Products: ${products.length}`);
  console.log(`  Categories: ${categories.length}\n`);
  
  console.log('📁 Existing Categories:');
  const existingCategorySlugs = new Set(categories.map((c: any) => c.slug));
  categories.forEach((c: any) => {
    console.log(`  - ${c.name} (slug: ${c.slug})`);
  });
  
  // Find all unique categories used by products
  const productCategories = new Map<string, number>();
  products.forEach((p: any) => {
    const cat = p.category || 'uncategorized';
    productCategories.set(cat, (productCategories.get(cat) || 0) + 1);
  });
  
  console.log('\n📦 Categories Used by Products:');
  Array.from(productCategories.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      const exists = existingCategorySlugs.has(cat);
      console.log(`  ${exists ? '✅' : '❌'} ${cat}: ${count} products ${exists ? '' : '(MISSING)'}`);
    });
  
  // Find missing categories
  const missingCategories = Array.from(productCategories.keys())
    .filter(cat => !existingCategorySlugs.has(cat));
  
  if (missingCategories.length > 0) {
    console.log('\n⚠️  Missing Categories Found:', missingCategories.length);
    console.log('\nWould you like to:');
    console.log('1. Add missing categories automatically');
    console.log('2. Map products to existing categories');
    console.log('\nLet me create the missing categories...\n');
    
    // Create category mappings
    const categoryMappings: Record<string, { name: string, description: string }> = {
      'glass': { name: 'Glass', description: 'Premium glass pipes, bongs, and smoking accessories' },
      'vaporizers': { name: 'Vaporizers', description: 'High-quality vaporizers and vape products' },
      'accessories': { name: 'Accessories', description: 'Smoking accessories and tools' },
      'cannabis-products': { name: 'Cannabis Products', description: 'Cannabis and hemp products' },
      'high-end-vaporizers': { name: 'High-End Vaporizers', description: 'Premium vaporizers and dabbing devices' },
      'dab-rigs': { name: 'Dab Rigs', description: 'Concentrate rigs and dabbing accessories' },
      'vape-batteries': { name: 'Vape Batteries', description: 'Batteries and chargers for vape devices' },
      'uncategorized': { name: 'Uncategorized', description: 'Miscellaneous products' },
    };
    
    const newCategories: any[] = [];
    missingCategories.forEach((slug) => {
      const mapping = categoryMappings[slug];
      if (mapping) {
        newCategories.push({
          id: `cat-${slug}-${Date.now()}`,
          name: mapping.name,
          slug: slug,
          description: mapping.description,
          image: '/images/categories/default.jpg',
          displayOrder: categories.length + newCategories.length,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log(`  ✅ Created category: ${mapping.name} (${slug})`);
      } else {
        console.log(`  ⚠️  No mapping for: ${slug} - skipping`);
      }
    });
    
    if (newCategories.length > 0) {
      const updatedCategories = [...categories, ...newCategories];
      await redis.set('zsmokeshop:categories', JSON.stringify(updatedCategories));
      console.log(`\n✅ Added ${newCategories.length} new categories to Redis`);
      console.log(`📊 Total categories: ${updatedCategories.length}`);
    }
  } else {
    console.log('\n✅ All product categories exist!');
  }
  
  await redis.quit();
}

analyzeAndFixCategories().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
