// Clear Redis Cache Script
// Run this to clear cached settings and force reload from admin-config.json
// Usage: node scripts/clear-redis-cache.js

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const Redis = require('ioredis');

if (!process.env.REDIS_URL) {
  console.error('❌ REDIS_URL environment variable not set!');
  console.log('💡 Make sure .env.local has REDIS_URL configured');
  console.log('💡 Current REDIS_URL:', process.env.REDIS_URL);
  process.exit(1);
}

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

async function clearCache() {
  try {
    console.log('🔄 Connecting to Redis...');
    
    // Check if key exists
    const exists = await redis.exists('business-settings');
    if (exists) {
      console.log('📋 Found cached settings in Redis');
      
      // Get current value for logging
      const current = await redis.get('business-settings');
      console.log('📊 Current cached value:', JSON.parse(current || '{}'));
      
      // Delete the cache
      await redis.del('business-settings');
      console.log('✅ Redis cache cleared successfully!');
      console.log('📋 Settings will reload from admin-config.json on next request');
    } else {
      console.log('ℹ️  No cached settings found in Redis');
      console.log('📋 Settings are already loading from admin-config.json');
    }
    
    await redis.quit();
    console.log('👋 Done!');
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    await redis.quit();
    process.exit(1);
  }
}

clearCache();
