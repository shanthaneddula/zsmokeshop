/**
 * Check what image domains are being used by products
 */
import { Redis } from 'ioredis';
import { config } from 'dotenv';
import * as url from 'url';

config({ path: '.env.local' });

async function analyzeImageDomains() {
  const redis = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  const productsData = await redis.get('zsmokeshop:products');
  const products = productsData ? JSON.parse(productsData) : [];
  
  console.log(`📊 Analyzing ${products.length} products...\n`);
  
  const domains = new Map<string, number>();
  let missingImages = 0;
  
  products.forEach((p: any) => {
    if (!p.image) {
      missingImages++;
      return;
    }
    
    try {
      const parsed = new URL(p.image);
      const hostname = parsed.hostname;
      domains.set(hostname, (domains.get(hostname) || 0) + 1);
    } catch (e) {
      // Relative path or invalid URL
      domains.set('[relative/invalid]', (domains.get('[relative/invalid]') || 0) + 1);
    }
  });
  
  console.log('🖼️  Image Domains Used:');
  Array.from(domains.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count} images`);
    });
  
  if (missingImages > 0) {
    console.log(`\n⚠️  ${missingImages} products without images`);
  }
  
  console.log('\n📝 Add these domains to next.config.js remotePatterns:');
  Array.from(domains.keys())
    .filter(d => d !== '[relative/invalid]')
    .forEach(domain => {
      console.log(`  {
    protocol: 'https',
    hostname: '${domain}',
    port: '',
    pathname: '/**',
  },`);
    });
  
  await redis.quit();
}

analyzeImageDomains().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
