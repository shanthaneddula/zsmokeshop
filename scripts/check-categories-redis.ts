import { Redis } from 'ioredis';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function checkCategories() {
  const redis = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  const cats = await redis.get('zsmokeshop:categories');
  if (cats) {
    console.log('Categories in Redis:');
    console.log(JSON.stringify(JSON.parse(cats), null, 2));
  } else {
    console.log('No categories found in Redis');
  }
  
  await redis.quit();
}

checkCategories().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
