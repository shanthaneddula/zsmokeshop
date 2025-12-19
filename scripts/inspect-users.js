#!/usr/bin/env node
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://default:2MQcRbgtoGri1PPU9vD86ZOmHuZXJWFU@redis-16513.c14.us-east-1-3.ec2.redns.redis-cloud.com:16513';

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
