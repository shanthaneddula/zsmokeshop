/**
 * Update all categories to have active status
 */
import { Redis } from 'ioredis';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function updateCategories() {
  const redis = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  const categoriesData = await redis.get('zsmokeshop:categories');
  const categories = categoriesData ? JSON.parse(categoriesData) : [];
  
  console.log(`📊 Found ${categories.length} categories\n`);
  
  // Update all categories to have active status and image
  const updatedCategories = categories.map((cat: any) => {
    const updated = {
      ...cat,
      active: cat.active !== undefined ? cat.active : true,
      status: cat.status || 'active',
      image: cat.image || '/images/categories/default.jpg',
      displayOrder: cat.displayOrder !== undefined ? cat.displayOrder : 999,
    };
    
    console.log(`  ${updated.status === 'active' ? '✅' : '❌'} ${updated.name} (${updated.slug})`);
    return updated;
  });
  
  await redis.set('zsmokeshop:categories', JSON.stringify(updatedCategories));
  console.log(`\n✅ Updated ${updatedCategories.length} categories in Redis`);
  
  // Show active categories
  const activeCategories = updatedCategories.filter((c: any) => c.status === 'active');
  console.log(`\n✅ ${activeCategories.length} active categories ready for shop page`);
  
  await redis.quit();
}

updateCategories().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
