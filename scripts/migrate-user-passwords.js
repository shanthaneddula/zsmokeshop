#!/usr/bin/env node
/**
 * Migration script to update user password field from 'password' to 'passwordHash'
 * Run this once to migrate existing users in Redis
 */

const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://default:2MQcRbgtoGri1PPU9vD86ZOmHuZXJWFU@redis-16513.c14.us-east-1-3.ec2.redns.redis-cloud.com:16513';
const USERS_KEY = 'zsmokeshop:users';

async function migrateUsers() {
  const redis = new Redis(REDIS_URL);
  
  try {
    console.log('🔄 Fetching users from Redis...');
    const usersData = await redis.get(USERS_KEY);
    
    if (!usersData) {
      console.log('ℹ️  No users found in Redis');
      await redis.quit();
      return;
    }

    const users = JSON.parse(usersData);
    console.log(`📊 Found ${users.length} users`);

    let migratedCount = 0;
    const updatedUsers = users.map(user => {
      // If user has 'password' field but no 'passwordHash', migrate it
      if (user.password && !user.passwordHash) {
        console.log(`   Migrating user: ${user.username}`);
        migratedCount++;
        const { password, ...rest } = user;
        return {
          ...rest,
          passwordHash: password
        };
      }
      return user;
    });

    if (migratedCount > 0) {
      console.log(`\n💾 Saving ${migratedCount} migrated users...`);
      await redis.set(USERS_KEY, JSON.stringify(updatedUsers));
      console.log('✅ Migration completed successfully!');
    } else {
      console.log('✅ All users already have passwordHash field');
    }

    await redis.quit();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await redis.quit();
    process.exit(1);
  }
}

migrateUsers();
