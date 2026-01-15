/**
 * Sync Products from JSON to Redis
 * This updates Redis with the merged products from products.json
 */

import * as ProductStorage from '../src/lib/product-storage-service';
import { AdminProduct } from '../src/types/admin';
import * as fs from 'fs';
import * as path from 'path';
import Redis from 'ioredis';
import { config } from 'dotenv';

// Load .env.local
config({ path: '.env.local' });

const PRODUCTS_FILE = path.join(__dirname, '../src/data/products.json');
const KV_PRODUCTS_KEY = 'zsmokeshop:products';

async function main() {
  console.log('🚀 Syncing Products from JSON to Redis\n');
  
  // Check for Redis URL
  if (!process.env.REDIS_URL) {
    console.error('❌ REDIS_URL not found in environment');
    console.error('   Make sure .env.local has REDIS_URL set');
    process.exit(1);
  }
  
  // Read products from JSON file
  console.log('📖 Reading products from JSON file...');
  const productsJson = fs.readFileSync(PRODUCTS_FILE, 'utf8');
  const products: AdminProduct[] = JSON.parse(productsJson);
  console.log(`   Found ${products.length} products in JSON file\n`);
  
  // Show brand breakdown
  const brandCounts = products.reduce((acc, p) => {
    const brand = p.brand || 'Unknown';
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('📊 Products by brand:');
  Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([brand, count]) => {
      console.log(`   ${brand}: ${count}`);
    });
  console.log('');
  
  // Initialize Redis client
  console.log('🔌 Connecting to Redis...');
  const redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
  });
  
  try {
    // Test connection
    await redisClient.ping();
    console.log('   ✅ Connected to Redis\n');
    
    // Write products to Redis
    console.log('💾 Writing products to Redis...');
    const productsData = JSON.stringify(products);
    await redisClient.set(KV_PRODUCTS_KEY, productsData);
    console.log('   ✅ Products written to Redis\n');
    
    // Verify
    console.log('🔍 Verifying Redis data...');
    const storedData = await redisClient.get(KV_PRODUCTS_KEY);
    const storedProducts = JSON.parse(storedData || '[]');
    console.log(`   ✅ Verified: ${storedProducts.length} products in Redis\n`);
    
    // Summary
    console.log('='.repeat(60));
    console.log('✨ Sync Summary:');
    console.log(`   Products in JSON: ${products.length}`);
    console.log(`   Products in Redis: ${storedProducts.length}`);
    console.log(`   Status: ${products.length === storedProducts.length ? '✅ SYNCED' : '❌ MISMATCH'}`);
    console.log('='.repeat(60));
    console.log('\n✅ Sync complete! Refresh your admin page to see all products.');
    
  } catch (error) {
    console.error('❌ Error syncing to Redis:', error);
    throw error;
  } finally {
    await redisClient.quit();
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
