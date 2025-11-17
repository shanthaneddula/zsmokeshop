/**
 * Bulk Product Import Script for Z SMOKE SHOP
 * 
 * This script imports products from a CSV file into Redis storage
 * 
 * CSV Format Expected:
 * product name, category, brand, sku, price, sale price, short description, detailed description, product image
 * 
 * Usage:
 * npm run import-products
 */

import fs from 'fs';
import path from 'path';
import Redis from 'ioredis';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), '.env.local') });

// Redis key used by the application
const KV_PRODUCTS_KEY = 'zsmokeshop:products';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || '');

interface CSVRow {
  'product name': string;
  'category': string;
  'brand': string;
  'sku': string;
  'price': string;
  'sale price': string;
  'short description': string;
  'detailed description': string;
  'product image': string;
}

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
  status: 'active' | 'inactive' | 'draft';
  rating: number;
  createdAt: string;
  updatedAt: string;
  complianceLevel: 'age-restricted';
  ageRestriction: 21;
}

// Generate slug from product name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Generate unique ID
function generateId(): string {
  return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Parse CSV file
function parseCSV(filePath: string): CSVRow[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  const data: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV with support for quoted values
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim()); // Push the last value
    
    // Skip header rows or empty rows
    if (values[0].toLowerCase() === 'product name') continue;
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    // Only add valid rows
    if (row['product name'] && row['product name'].trim()) {
      data.push(row as unknown as CSVRow);
    }
  }
  
  return data;
}

// Convert CSV row to Product
function convertToProduct(row: CSVRow): Product {
  const now = new Date().toISOString();
  const productName = row['product name'].trim();
  const price = parseFloat(row['price']) || 0;
  const salePrice = row['sale price'] && row['sale price'].trim() 
    ? parseFloat(row['sale price']) 
    : undefined;
  
  // Determine category slug
  let categorySlug = 'disposable-nicotine-vapes'; // Default
  if (row['category']) {
    const catLower = row['category'].toLowerCase();
    if (catLower.includes('disposable')) {
      categorySlug = 'disposable-nicotine-vapes';
    }
    // Add more category mappings as needed
  }
  
  // Determine badges
  const badges: string[] = [];
  if (salePrice && salePrice < price) {
    badges.push('sale');
  }
  // Add 'new' badge for recently added products
  badges.push('new');
  
  const product: Product = {
    id: generateId(),
    name: productName,
    slug: generateSlug(productName),
    category: categorySlug,
    price: price,
    salePrice: salePrice,
    image: row['product image']?.trim() || '', // Empty string if no image
    shortDescription: row['short description']?.trim() || '',
    detailedDescription: row['detailed description']?.trim() || '',
    brand: row['brand']?.trim() || '',
    inStock: true,
    badges: badges,
    sku: row['sku']?.trim() || '',
    status: 'active',
    rating: 4.5, // Default rating
    createdAt: now,
    updatedAt: now,
    complianceLevel: 'age-restricted',
    ageRestriction: 21
  };
  
  return product;
}

// Main import function
async function importProducts() {
  try {
    console.log('🚀 Starting bulk product import...\n');
    
    // Check environment variables
    if (!process.env.REDIS_URL) {
      throw new Error('Missing REDIS_URL environment variable. Please check your .env.local file.');
    }
    
    // Read CSV file
    const csvPath = path.join(process.cwd(), 'disposablevape.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }
    
    console.log(`📄 Reading CSV file: ${csvPath}`);
    const csvData = parseCSV(csvPath);
    console.log(`✓ Found ${csvData.length} products in CSV\n`);
    
    // Get existing products from Redis
    console.log('📦 Fetching existing products from Redis...');
    const existingData = await redis.get(KV_PRODUCTS_KEY);
    const existingProducts = existingData ? JSON.parse(existingData) as Product[] : [];
    console.log(`✓ Found ${existingProducts.length} existing products\n`);
    
    // Convert CSV rows to products
    console.log('🔄 Processing CSV products...');
    const newProducts = csvData.map(row => convertToProduct(row));
    
    // Check for duplicates - skip products that already exist
    const existingSKUs = new Set(existingProducts.filter(p => p.sku).map(p => p.sku));
    const existingNames = new Set(existingProducts.map(p => p.name.toLowerCase()));
    
    const uniqueNewProducts: Product[] = [];
    let skipped = 0;
    
    for (const product of newProducts) {
      const isDuplicateSKU = product.sku && existingSKUs.has(product.sku);
      const isDuplicateName = existingNames.has(product.name.toLowerCase());
      
      if (isDuplicateSKU || isDuplicateName) {
        console.log(`⚠️  Skipping duplicate: ${product.name} (${product.sku})`);
        skipped++;
      } else {
        uniqueNewProducts.push(product);
        if (product.sku) existingSKUs.add(product.sku);
        existingNames.add(product.name.toLowerCase());
      }
    }
    
    console.log(`\n✓ Found ${uniqueNewProducts.length} new unique products to import`);
    if (skipped > 0) {
      console.log(`⚠️  Skipped ${skipped} duplicates\n`);
    }
    
    // Combine with existing products
    const allProducts = [...existingProducts, ...uniqueNewProducts];
    
    console.log('💾 Saving products to Redis...');
    await redis.set(KV_PRODUCTS_KEY, JSON.stringify(allProducts));
    console.log(`✓ Successfully saved ${allProducts.length} total products\n`);
    
    // Display summary
    console.log('═══════════════════════════════════════');
    console.log('📊 IMPORT SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`✓ Products imported: ${uniqueNewProducts.length}`);
    console.log(`⚠️  Duplicates skipped: ${skipped}`);
    console.log(`✓ Existing products: ${existingProducts.length}`);
    console.log(`✓ Total products: ${allProducts.length}`);
    console.log('═══════════════════════════════════════\n');
    
    // Show sample of imported products
    if (uniqueNewProducts.length > 0) {
      console.log('📋 Sample of imported products:');
      uniqueNewProducts.slice(0, 5).forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`);
        console.log(`   - ID: ${product.id}`);
        console.log(`   - SKU: ${product.sku}`);
        console.log(`   - Price: $${product.price}${product.salePrice ? ` (Sale: $${product.salePrice})` : ''}`);
        console.log(`   - Brand: ${product.brand}`);
        console.log(`   - Image: ${product.image || 'No image - will add manually'}`);
        console.log(`   - Category: ${product.category}`);
      });
      
      if (uniqueNewProducts.length > 5) {
        console.log(`\n... and ${uniqueNewProducts.length - 5} more products`);
      }
    } else {
      console.log('ℹ️  No new products were imported (all were duplicates)');
    }
    
    console.log('\n✅ Import completed successfully!\n');
    
    // Close Redis connection
    await redis.quit();
    
  } catch (error) {
    console.error('\n❌ Import failed:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    await redis.quit();
    process.exit(1);
  }
}

// Run the import
importProducts();
