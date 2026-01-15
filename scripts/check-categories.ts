/**
 * Check Redis categories and ensure 'accessories' exists
 */
import { Redis } from 'ioredis';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function checkCategories() {
  const redis = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  try {
    // Get categories
    const categoriesData = await redis.get('zsmokeshop:categories');
    const categories = categoriesData ? JSON.parse(categoriesData) : [];
    
    console.log(`\n📁 Found ${categories.length} categories:\n`);
    
    categories.forEach((cat: any) => {
      console.log(`  ${cat.name} (${cat.slug})`);
      console.log(`    Status: ${cat.status || 'no status'}`);
      console.log(`    Active: ${cat.active !== undefined ? cat.active : 'not set'}`);
      console.log(`    Display Order: ${cat.displayOrder || 'not set'}\n`);
    });

    // Check if accessories exists
    const accessoriesCategory = categories.find((c: any) => c.slug === 'accessories');
    
    if (!accessoriesCategory) {
      console.log('❌ "accessories" category NOT FOUND');
      console.log('\n📝 Creating "accessories" category...');
      
      const newCategory = {
        id: `accessories-${Date.now()}`,
        name: 'Accessories',
        slug: 'accessories',
        description: 'Smoking accessories including grinders, lighters, trays, tips, and more',
        status: 'active',
        active: true,
        displayOrder: categories.length + 1,
        image: '/images/categories/accessories.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      categories.push(newCategory);
      await redis.set('zsmokeshop:categories', JSON.stringify(categories));
      
      console.log('✅ "accessories" category created');
    } else {
      console.log(`✅ "accessories" category exists`);
      
      // Ensure it's active
      if (accessoriesCategory.status !== 'active' || accessoriesCategory.active !== true) {
        console.log('⚠️  Category is not active, updating...');
        
        accessoriesCategory.status = 'active';
        accessoriesCategory.active = true;
        
        await redis.set('zsmokeshop:categories', JSON.stringify(categories));
        console.log('✅ Category activated');
      }
    }

    // Count products by category
    const productsData = await redis.get('zsmokeshop:products');
    const products = productsData ? JSON.parse(productsData) : [];
    
    const categoryCounts = new Map<string, number>();
    products.forEach((p: any) => {
      const cat = p.category || 'uncategorized';
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    });
    
    console.log('\n📊 Products by category:');
    Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
      });

    await redis.quit();

  } catch (error) {
    console.error('❌ Error:', error);
    await redis.quit();
    process.exit(1);
  }
}

checkCategories();
