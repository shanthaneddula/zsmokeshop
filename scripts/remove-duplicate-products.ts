/**
 * Remove Duplicate Products Script
 * 
 * This script removes duplicate products from Redis based on SKU or name
 * Keeps the most recently created version of each product
 */

import path from 'path';
import Redis from 'ioredis';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), '.env.local') });

// Redis key used by the application
const KV_PRODUCTS_KEY = 'zsmokeshop:products';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || '');

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  salePrice?: number;
  image: string;
  shortDescription: string;
  detailedDescription: string;
  brand: string;
  inStock: boolean;
  badges: string[];
  sku: string;
  status: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

async function removeDuplicates() {
  try {
    console.log('🧹 Starting duplicate removal process...\n');
    
    // Check environment variables
    if (!process.env.REDIS_URL) {
      throw new Error('Missing REDIS_URL environment variable. Please check your .env.local file.');
    }
    
    // Get existing products from Redis
    console.log('📦 Fetching products from Redis...');
    const existingData = await redis.get(KV_PRODUCTS_KEY);
    const products = existingData ? JSON.parse(existingData) as Product[] : [];
    console.log(`✓ Found ${products.length} total products\n`);
    
    if (products.length === 0) {
      console.log('No products to process.');
      await redis.quit();
      return;
    }
    
    // Track duplicates by SKU and name
    const seenBySKU = new Map<string, Product>();
    const seenByName = new Map<string, Product>();
    const uniqueProducts: Product[] = [];
    let duplicatesRemoved = 0;
    
    console.log('🔍 Identifying duplicates...\n');
    
    for (const product of products) {
      let isDuplicate = false;
      
      // Check for SKU duplicates
      if (product.sku && product.sku.trim()) {
        const existing = seenBySKU.get(product.sku);
        if (existing) {
          isDuplicate = true;
          duplicatesRemoved++;
          console.log(`❌ Duplicate SKU: ${product.sku} - "${product.name}"`);
          
          // Keep the one with more recent createdAt
          if (new Date(product.createdAt) > new Date(existing.createdAt)) {
            // Replace existing with newer one
            const index = uniqueProducts.findIndex(p => p.id === existing.id);
            if (index !== -1) {
              uniqueProducts[index] = product;
              seenBySKU.set(product.sku, product);
              seenByName.set(product.name.toLowerCase(), product);
              console.log(`  ↳ Kept newer version (${product.createdAt})`);
            }
          } else {
            console.log(`  ↳ Kept existing version (${existing.createdAt})`);
          }
        } else {
          seenBySKU.set(product.sku, product);
        }
      }
      
      // Check for name duplicates if not already marked as duplicate
      if (!isDuplicate) {
        const nameLower = product.name.toLowerCase();
        const existing = seenByName.get(nameLower);
        if (existing) {
          isDuplicate = true;
          duplicatesRemoved++;
          console.log(`❌ Duplicate Name: "${product.name}"`);
          
          // Keep the one with more recent createdAt
          if (new Date(product.createdAt) > new Date(existing.createdAt)) {
            // Replace existing with newer one
            const index = uniqueProducts.findIndex(p => p.id === existing.id);
            if (index !== -1) {
              uniqueProducts[index] = product;
              seenByName.set(nameLower, product);
              if (product.sku && product.sku.trim()) {
                seenBySKU.set(product.sku, product);
              }
              console.log(`  ↳ Kept newer version (${product.createdAt})`);
            }
          } else {
            console.log(`  ↳ Kept existing version (${existing.createdAt})`);
          }
        } else {
          seenByName.set(nameLower, product);
        }
      }
      
      // Add to unique list if not a duplicate
      if (!isDuplicate) {
        uniqueProducts.push(product);
      }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('📊 DEDUPLICATION SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Original products: ${products.length}`);
    console.log(`Duplicates removed: ${duplicatesRemoved}`);
    console.log(`Unique products: ${uniqueProducts.length}`);
    console.log('═══════════════════════════════════════\n');
    
    if (duplicatesRemoved > 0) {
      console.log('💾 Saving deduplicated products to Redis...');
      await redis.set(KV_PRODUCTS_KEY, JSON.stringify(uniqueProducts));
      console.log(`✓ Successfully saved ${uniqueProducts.length} unique products\n`);
    } else {
      console.log('✓ No duplicates found. Database is clean!\n');
    }
    
    console.log('✅ Deduplication completed successfully!\n');
    
    // Close Redis connection
    await redis.quit();
    
  } catch (error) {
    console.error('\n❌ Deduplication failed:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    await redis.quit();
    process.exit(1);
  }
}

// Run the deduplication
removeDuplicates();
