import * as fs from 'fs';
import * as path from 'path';
import { Redis } from 'ioredis';

async function syncToProductionRedis() {
  console.log('🚀 Syncing products to production Redis...\n');

  // Get production Redis URL from environment
  const productionRedisUrl = process.env.REDIS_URL;
  
  if (!productionRedisUrl) {
    console.error('❌ Error: REDIS_URL environment variable not found');
    console.log('Please set REDIS_URL to your production Redis connection string');
    process.exit(1);
  }

  console.log('📡 Connecting to production Redis...');
  const redis = new Redis(productionRedisUrl);

  try {
    // Read the local products.json with updated Vercel Blob URLs
    const productsPath = path.join(process.cwd(), 'src/data/products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    
    console.log(`📦 Found ${productsData.length} products to sync\n`);

    // Verify products have Vercel Blob URLs
    const puffcoProducts = productsData.filter((p: any) => p.brand === 'Puffco');
    const localImageProducts = puffcoProducts.filter((p: any) => 
      p.image?.startsWith('/images/products/puffco/')
    );
    const blobImageProducts = puffcoProducts.filter((p: any) => 
      p.image?.includes('blob.vercel-storage.com')
    );

    console.log(`📊 Puffco products analysis:`);
    console.log(`   Total Puffco products: ${puffcoProducts.length}`);
    console.log(`   With local paths: ${localImageProducts.length}`);
    console.log(`   With Vercel Blob URLs: ${blobImageProducts.length}\n`);

    if (localImageProducts.length > 0) {
      console.log('⚠️  Warning: Some products still have local image paths!');
      console.log('   These will cause 400 errors in production.\n');
      
      // Show first few examples
      console.log('Examples of products with local paths:');
      localImageProducts.slice(0, 3).forEach((p: any) => {
        console.log(`   - ${p.name}: ${p.image}`);
      });
      console.log();
    }

    // Write to production Redis using correct key
    console.log('💾 Writing to production Redis...');
    const REDIS_KEY = 'zsmokeshop:products';
    await redis.set(REDIS_KEY, JSON.stringify(productsData));
    
    console.log('✅ Products synced successfully to production Redis!');
    console.log(`\n📈 Total products synced: ${productsData.length}`);
    
    // Verify the sync
    const verifyData = await redis.get(REDIS_KEY);
    if (verifyData) {
      const verifyProducts = JSON.parse(verifyData as string);
      console.log(`✅ Verification: ${verifyProducts.length} products in production Redis (key: ${REDIS_KEY})`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing to production Redis:', error);
    process.exit(1);
  }
}

syncToProductionRedis();
