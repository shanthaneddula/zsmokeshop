import { Redis } from 'ioredis';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function analyzeSchema() {
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
  console.log('📊 Total products:', products.length);
  
  // Get unique keys across all products
  const allKeys = new Set<string>();
  const keyTypes: Record<string, Set<string>> = {};
  
  products.forEach((product: any) => {
    Object.keys(product).forEach(key => {
      allKeys.add(key);
      if (!keyTypes[key]) {
        keyTypes[key] = new Set();
      }
      keyTypes[key].add(typeof product[key]);
    });
  });
  
  console.log('\n📋 All unique product fields:');
  Array.from(allKeys).sort().forEach(key => {
    const types = Array.from(keyTypes[key]).join(' | ');
    console.log(`  ${key}: ${types}`);
  });
  
  // Sample products from different brands
  console.log('\n🔍 Sample products by brand:\n');
  
  const brands = ['GRAV', 'Lookah', 'Puffco', 'RAW', 'Hometown Hero'];
  brands.forEach(brand => {
    const brandProducts = products.filter((p: any) => p.brand === brand);
    if (brandProducts.length > 0) {
      console.log(`\n--- ${brand} (${brandProducts.length} products) ---`);
      console.log(JSON.stringify(brandProducts[0], null, 2));
    }
  });
  
  // Check for products with variants
  const productsWithVariants = products.filter((p: any) => p.variants && p.variants.length > 0);
  console.log(`\n\n📦 Products with variants: ${productsWithVariants.length}`);
  if (productsWithVariants.length > 0) {
    console.log('Sample product with variants:');
    console.log(JSON.stringify(productsWithVariants[0], null, 2));
  }
  
  // Check for products with options
  const productsWithOptions = products.filter((p: any) => p.options && p.options.length > 0);
  console.log(`\n\n⚙️ Products with options: ${productsWithOptions.length}`);
  if (productsWithOptions.length > 0) {
    console.log('Sample product with options:');
    console.log(JSON.stringify(productsWithOptions[0], null, 2));
  }
  
  // Analyze categories
  const categories = new Set<string>();
  products.forEach((p: any) => {
    if (p.category) categories.add(p.category);
    if (p.categories && Array.isArray(p.categories)) {
      p.categories.forEach((cat: string) => categories.add(cat));
    }
  });
  console.log(`\n\n📂 Unique categories: ${categories.size}`);
  console.log(Array.from(categories).sort().join(', '));
  
  await redis.quit();
}

analyzeSchema().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
