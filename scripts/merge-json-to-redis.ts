/**
 * Merge JSON products into Redis
 * Keeps existing products and adds new ones
 */
import { Redis } from 'ioredis';
import { config } from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';

config({ path: '.env.local' });

async function mergeProductsToRedis() {
  console.log('📊 Loading products from JSON file...');
  const jsonPath = path.join(process.cwd(), 'src/data/products.json');
  const jsonData = await fs.readFile(jsonPath, 'utf8');
  const jsonProducts = JSON.parse(jsonData);
  console.log(`  ✅ Loaded ${jsonProducts.length} products from JSON\n`);

  console.log('🔌 Connecting to Redis...');
  const redis = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  const key = 'zsmokeshop:products';
  
  console.log('📥 Fetching existing products from Redis...');
  const existingData = await redis.get(key);
  const existingProducts = existingData ? JSON.parse(existingData) : [];
  console.log(`  📊 Existing products in Redis: ${existingProducts.length}\n`);
  
  // Create a map of existing products by ID
  const existingMap = new Map(existingProducts.map((p: any) => [p.id, p]));
  
  console.log('🔄 Merging products...');
  let added = 0;
  let updated = 0;
  
  jsonProducts.forEach((product: any) => {
    if (existingMap.has(product.id)) {
      // Update existing product
      existingMap.set(product.id, product);
      updated++;
    } else {
      // Add new product
      existingMap.set(product.id, product);
      added++;
    }
  });
  
  const mergedProducts = Array.from(existingMap.values());
  
  console.log(`  ✅ Added: ${added} new products`);
  console.log(`  ✅ Updated: ${updated} existing products`);
  console.log(`  📊 Total products after merge: ${mergedProducts.length}\n`);
  
  // Show breakdown by brand
  const brandCounts: Record<string, number> = {};
  mergedProducts.forEach((p: any) => {
    const brand = p.brand || 'No Brand';
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });
  
  console.log('📈 Products by brand:');
  Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([brand, count]) => {
      console.log(`  ${brand}: ${count} products`);
    });
  
  console.log('\n💾 Saving merged products to Redis...');
  await redis.set(key, JSON.stringify(mergedProducts));
  console.log(`  ✅ Saved ${mergedProducts.length} total products to Redis\n`);
  
  await redis.quit();
  console.log('✅ Merge completed successfully!');
}

mergeProductsToRedis().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
