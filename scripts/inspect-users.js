#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const Redis = require('ioredis');

if (!process.env.REDIS_URL) {
  console.error('❌ REDIS_URL environment variable not set!');
  console.error('💡 Make sure .env.local has REDIS_URL configured');
  process.exit(1);
}

const REDIS_URL = process.env.REDIS_URL;

async function inspectUsers() {
  const redis = new Redis(REDIS_URL);
  
  try {
    const usersData = await redis.get('zsmokeshop:users');
    
    if (!usersData) {
      console.log('No users found');
      await redis.quit();
      return;
    }

    const users = JSON.parse(usersData);
    console.log('\n📊 Users in Redis:\n');
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Has passwordHash: ${!!user.passwordHash}`);
      console.log(`  Has password: ${!!user.password}`);
      console.log(`  passwordHash value: ${user.passwordHash ? user.passwordHash.substring(0, 20) + '...' : 'undefined'}`);
      console.log(`  password value: ${user.password ? user.password.substring(0, 20) + '...' : 'undefined'}`);
      console.log('');
    });

    await redis.quit();
  } catch (error) {
    console.error('Error:', error);
    await redis.quit();
  }
}

inspectUsers();
