// Category Storage Service - Handles categories storage in Redis (production) or JSON files (development)
import { kv } from '@vercel/kv';
import { AdminCategory } from '@/types/admin';
import fs from 'fs/promises';
import path from 'path';
import Redis from 'ioredis';

const KV_CATEGORIES_KEY = 'zsmokeshop:categories';
const DATA_DIR = path.join(process.cwd(), 'src/data');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backup');

// Initialize Redis client if REDIS_URL is provided
let redisClient: Redis | null = null;
if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });
    console.log('📊 Redis client initialized for categories...');
  } catch (error) {
    console.error('❌ Failed to initialize Redis client:', error);
  }
}

// Determine storage method based on environment and available services
const isProduction = process.env.NODE_ENV === 'production';
const hasRedis = !!process.env.REDIS_URL;
const hasKVConfig = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const useRedis = hasRedis;
const useKV = !hasRedis && (isProduction || hasKVConfig);

console.log('🔧 Category Storage Service Initialized:', {
  environment: process.env.NODE_ENV,
  hasRedis,
  hasKVConfig,
  useRedis,
  useKV,
  storageMethod: useRedis ? 'Redis Cloud' : useKV ? 'Vercel KV' : 'JSON Files'
});

// Ensure directories exist (for file-based storage)
async function ensureDirectories() {
  if (!useRedis && !useKV) {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.mkdir(BACKUP_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }
}

// Create backup of existing file (for file-based storage)
async function createBackup(): Promise<void> {
  if (!useRedis && !useKV) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(BACKUP_DIR, `categories_${timestamp}.json`);
      
      try {
        await fs.access(CATEGORIES_FILE);
        await fs.copyFile(CATEGORIES_FILE, backupPath);
        console.log(`✅ Backup created: ${backupPath}`);
      } catch {
        console.log('ℹ️ No existing categories file to backup');
      }
    } catch (error) {
      console.error('❌ Error creating backup:', error);
    }
  }
}

// Read all categories
export async function readCategories(): Promise<AdminCategory[]> {
  try {
    console.log('📖 Reading categories...');
    
    if (useRedis && redisClient) {
      console.log('📡 Reading from Redis Cloud...');
      
      try {
        const data = await redisClient.get(KV_CATEGORIES_KEY);
        if (data) {
          const categories = JSON.parse(data);
          console.log(`✅ Retrieved ${categories?.length || 0} categories from Redis`);
          return categories;
        }
        console.log('ℹ️ No categories found in Redis, returning empty array');
        return [];
      } catch (redisError) {
        console.error('❌ Redis error:', redisError);
        throw redisError;
      }
    } else if (useKV) {
      console.log('📡 Reading from Vercel KV...');
      
      try {
        const categories = await kv.get<AdminCategory[]>(KV_CATEGORIES_KEY);
        console.log(`✅ Retrieved ${categories?.length || 0} categories from KV`);
        return categories || [];
      } catch (kvError) {
        console.error('❌ Vercel KV error:', kvError);
        
        if (isProduction) {
          throw new Error(
            'Neither Redis nor Vercel KV is configured. Please set REDIS_URL or configure Vercel KV in your Vercel dashboard.'
          );
        }
        
        throw kvError;
      }
    } else {
      console.log('📁 Reading from JSON file...');
      await ensureDirectories();
      
      try {
        const data = await fs.readFile(CATEGORIES_FILE, 'utf-8');
        const categories = JSON.parse(data);
        console.log(`✅ Retrieved ${categories?.length || 0} categories from file`);
        return categories;
      } catch (error: unknown) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === 'ENOENT') {
          console.log('ℹ️ Categories file doesn\'t exist, returning empty array');
          return [];
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Error reading categories:', error);
    throw new Error(`Failed to read categories: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Write all categories
export async function writeCategories(categories: AdminCategory[]): Promise<void> {
  try {
    console.log('💾 Writing categories...', { count: categories.length });
    
    if (!Array.isArray(categories)) {
      throw new Error('Categories must be an array');
    }
    
    if (useRedis && redisClient) {
      console.log('📡 Writing to Redis Cloud...');
      
      try {
        await redisClient.set(KV_CATEGORIES_KEY, JSON.stringify(categories));
        console.log(`✅ Saved ${categories.length} categories to Redis`);
      } catch (redisError) {
        console.error('❌ Redis error:', redisError);
        throw redisError;
      }
    } else if (useKV) {
      console.log('📡 Writing to Vercel KV...');
      
      try {
        await kv.set(KV_CATEGORIES_KEY, categories);
        console.log(`✅ Saved ${categories.length} categories to KV`);
      } catch (kvError) {
        console.error('❌ Vercel KV error:', kvError);
        
        if (isProduction) {
          throw new Error(
            'Neither Redis nor Vercel KV is configured. Please set REDIS_URL or configure Vercel KV in your Vercel dashboard.'
          );
        }
        
        throw kvError;
      }
    } else {
      console.log('📁 Writing to JSON file...');
      await ensureDirectories();
      await createBackup();
      
      const jsonData = JSON.stringify(categories, null, 2);
      await fs.writeFile(CATEGORIES_FILE, jsonData, 'utf-8');
      console.log(`✅ Saved ${categories.length} categories to file`);
    }
  } catch (error) {
    console.error('❌ Error writing categories:', error);
    throw new Error(`Failed to write categories: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Get a single category by ID
export async function getCategory(id: string): Promise<AdminCategory | null> {
  try {
    console.log(`🔍 Getting category: ${id}`);
    const categories = await readCategories();
    const category = categories.find(c => c.id === id);
    
    if (category) {
      console.log(`✅ Found category: ${category.name}`);
    } else {
      console.log(`⚠️ Category not found: ${id}`);
    }
    
    return category || null;
  } catch (error) {
    console.error('❌ Error getting category:', error);
    throw error;
  }
}

// Create a new category
export async function createCategory(category: Omit<AdminCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminCategory> {
  try {
    console.log(`➕ Creating category: ${category.name}`);
    const categories = await readCategories();
    
    const newCategory: AdminCategory = {
      ...category,
      id: `cat_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      productCount: 0
    };
    
    categories.push(newCategory);
    await writeCategories(categories);
    
    console.log(`✅ Created category: ${newCategory.name} (${newCategory.id})`);
    return newCategory;
  } catch (error) {
    console.error('❌ Error creating category:', error);
    throw error;
  }
}

// Update an existing category
export async function updateCategory(id: string, updates: Partial<AdminCategory>): Promise<AdminCategory> {
  try {
    console.log(`✏️ Updating category: ${id}`);
    const categories = await readCategories();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error(`Category with ID ${id} not found`);
    }
    
    const existingCategory = categories[index];
    
    const updatedCategory: AdminCategory = {
      ...existingCategory,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    
    categories[index] = updatedCategory;
    await writeCategories(categories);
    
    console.log(`✅ Updated category: ${updatedCategory.name} (${id})`);
    return updatedCategory;
  } catch (error) {
    console.error('❌ Error updating category:', error);
    throw error;
  }
}

// Delete a category
export async function deleteCategory(id: string): Promise<void> {
  try {
    console.log(`🗑️ Deleting category: ${id}`);
    const categories = await readCategories();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error(`Category with ID ${id} not found`);
    }
    
    const deletedCategory = categories[index];
    categories.splice(index, 1);
    await writeCategories(categories);
    
    console.log(`✅ Deleted category: ${deletedCategory.name} (${id})`);
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    throw error;
  }
}

// Get category by slug
export async function getCategoryBySlug(slug: string): Promise<AdminCategory | null> {
  try {
    console.log(`🔎 Finding category by slug: ${slug}`);
    const categories = await readCategories();
    const category = categories.find(c => c.slug === slug);
    
    if (category) {
      console.log(`✅ Found category: ${category.name}`);
    }
    
    return category || null;
  } catch (error) {
    console.error('❌ Error finding category by slug:', error);
    throw error;
  }
}

// Update product counts for all categories
export async function updateProductCounts(): Promise<void> {
  try {
    console.log('🔄 Updating category product counts...');
    
    const { readProducts } = await import('@/lib/product-storage-service');
    const categories = await readCategories();
    const products = await readProducts();
    
    const updatedCategories = categories.map(category => ({
      ...category,
      productCount: products.filter(p => p.category === category.slug).length,
      updatedAt: new Date().toISOString()
    }));
    
    await writeCategories(updatedCategories);
    console.log('✅ Product counts updated');
  } catch (error) {
    console.error('❌ Error updating product counts:', error);
    throw error;
  }
}

// Migrate from JSON to Redis/KV
export async function migrateToKV(): Promise<void> {
  try {
    console.log('🔄 Starting categories migration from JSON to storage...');
    
    if (!hasRedis && !hasKVConfig) {
      throw new Error('Redis or KV configuration not available');
    }
    
    const data = await fs.readFile(CATEGORIES_FILE, 'utf-8');
    const categories = JSON.parse(data);
    
    if (useRedis && redisClient) {
      await redisClient.set(KV_CATEGORIES_KEY, JSON.stringify(categories));
      console.log(`✅ Migrated ${categories.length} categories to Redis`);
    } else if (useKV) {
      await kv.set(KV_CATEGORIES_KEY, categories);
      console.log(`✅ Migrated ${categories.length} categories to KV`);
    }
  } catch (error) {
    console.error('❌ Error migrating categories:', error);
    throw error;
  }
}

// Export all functions
export const CategoryStorageService = {
  readCategories,
  writeCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryBySlug,
  updateProductCounts,
  migrateToKV
};
