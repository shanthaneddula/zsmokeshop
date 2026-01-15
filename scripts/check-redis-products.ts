import { Redis } from 'ioredis';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function checkRedis() {
  const redis = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  const key = 'zsmokeshop:products';
  const data = await redis.get(key);
  
  if (!data) {
    console.log('❌ No products found in Redis');
    await redis.quit();
    return;
  }
  
  const products = JSON.parse(data);
  console.log('📊 Total products in Redis:', products.length);
  
  // Count by brand
  const brandCounts: Record<string, number> = {};
  products.forEach((p: any) => {
    const brand = p.brand || 'No Brand';
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });
  
  console.log('\n📈 Products by brand:');
  Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([brand, count]) => {
      console.log(`  ${brand}: ${count} products`);
    });
  
  // Check GRAV products specifically
  const gravProducts = products.filter((p: any) => p.brand === 'GRAV');
  console.log(`\n🔍 GRAV products: ${gravProducts.length}`);
  if (gravProducts.length > 0) {
    console.log('Sample GRAV products:');
    gravProducts.slice(0, 5).forEach((p: any) => {
      console.log(`  - ${p.name} ($${p.price})`);
    });
  }
  
  await redis.quit();
}

checkRedis().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
