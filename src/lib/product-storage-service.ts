// Product Storage Service - Handles products storage in Vercel KV (production) or JSON files (development)
import { kv } from '@vercel/kv';
import { AdminProduct } from '@/types/admin';
import fs from 'fs/promises';
import path from 'path';

const KV_PRODUCTS_KEY = 'zsmokeshop:products';
const DATA_DIR = path.join(process.cwd(), 'src/data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backup');

// Determine if we should use KV based on environment
const isProduction = process.env.NODE_ENV === 'production';
const hasKVConfig = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const useKV = isProduction || hasKVConfig;

console.log('🔧 Product Storage Service Initialized:', {
  environment: process.env.NODE_ENV,
  hasKVConfig,
  useKV,
  storageMethod: useKV ? 'Vercel KV (Redis)' : 'JSON Files'
});

// Ensure directories exist (for file-based storage)
async function ensureDirectories() {
  if (!useKV) {
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
  if (!useKV) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(BACKUP_DIR, `products_${timestamp}.json`);
      
      try {
        await fs.access(PRODUCTS_FILE);
        await fs.copyFile(PRODUCTS_FILE, backupPath);
        console.log(`✅ Backup created: ${backupPath}`);
      } catch {
        console.log('ℹ️ No existing products file to backup');
      }
    } catch (error) {
      console.error('❌ Error creating backup:', error);
    }
  }
}

// Read all products
export async function readProducts(): Promise<AdminProduct[]> {
  try {
    console.log('📖 Reading products...');
    
    if (useKV) {
      // Use Vercel KV in production
      console.log('📡 Reading from Vercel KV...');
      const products = await kv.get<AdminProduct[]>(KV_PRODUCTS_KEY);
      console.log(`✅ Retrieved ${products?.length || 0} products from KV`);
      return products || [];
    } else {
      // Use JSON files in development
      console.log('📁 Reading from JSON file...');
      await ensureDirectories();
      
      try {
        const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
        const products = JSON.parse(data);
        console.log(`✅ Retrieved ${products?.length || 0} products from file`);
        return products;
      } catch (error: unknown) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === 'ENOENT') {
          console.log('ℹ️ Products file doesn\'t exist, returning empty array');
          return [];
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Error reading products:', error);
    throw new Error(`Failed to read products: ${error}`);
  }
}

// Write all products
export async function writeProducts(products: AdminProduct[]): Promise<void> {
  try {
    console.log('💾 Writing products...', { count: products.length });
    
    if (!Array.isArray(products)) {
      throw new Error('Products must be an array');
    }
    
    if (useKV) {
      // Use Vercel KV in production
      console.log('📡 Writing to Vercel KV...');
      await kv.set(KV_PRODUCTS_KEY, products);
      console.log(`✅ Saved ${products.length} products to KV`);
    } else {
      // Use JSON files in development
      console.log('📁 Writing to JSON file...');
      await ensureDirectories();
      await createBackup();
      
      const jsonData = JSON.stringify(products, null, 2);
      await fs.writeFile(PRODUCTS_FILE, jsonData, 'utf-8');
      console.log(`✅ Saved ${products.length} products to file`);
    }
  } catch (error) {
    console.error('❌ Error writing products:', error);
    throw new Error(`Failed to write products: ${error}`);
  }
}

// Get a single product by ID
export async function getProduct(id: string): Promise<AdminProduct | null> {
  try {
    console.log(`🔍 Getting product: ${id}`);
    const products = await readProducts();
    const product = products.find(p => p.id === id);
    
    if (product) {
      console.log(`✅ Found product: ${product.name}`);
    } else {
      console.log(`⚠️ Product not found: ${id}`);
    }
    
    return product || null;
  } catch (error) {
    console.error('❌ Error getting product:', error);
    throw error;
  }
}

// Create a new product
export async function createProduct(product: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminProduct> {
  try {
    console.log(`➕ Creating product: ${product.name}`);
    const products = await readProducts();
    
    // Generate new product with ID and timestamps
    const newProduct: AdminProduct = {
      ...product,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageHistory: product.image ? [product.image] : [],
    };
    
    products.push(newProduct);
    await writeProducts(products);
    
    console.log(`✅ Created product: ${newProduct.name} (${newProduct.id})`);
    return newProduct;
  } catch (error) {
    console.error('❌ Error creating product:', error);
    throw error;
  }
}

// Update an existing product
export async function updateProduct(id: string, updates: Partial<AdminProduct>): Promise<AdminProduct> {
  try {
    console.log(`✏️ Updating product: ${id}`);
    const products = await readProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    const existingProduct = products[index];
    
    // Update product with new data
    const updatedProduct: AdminProduct = {
      ...existingProduct,
      ...updates,
      id, // Preserve original ID
      updatedAt: new Date().toISOString(),
      // Update image history if image changed
      imageHistory: updates.image && updates.image !== existingProduct.image
        ? [...(existingProduct.imageHistory || []), updates.image]
        : existingProduct.imageHistory,
    };
    
    products[index] = updatedProduct;
    await writeProducts(products);
    
    console.log(`✅ Updated product: ${updatedProduct.name} (${id})`);
    return updatedProduct;
  } catch (error) {
    console.error('❌ Error updating product:', error);
    throw error;
  }
}

// Delete a product
export async function deleteProduct(id: string): Promise<void> {
  try {
    console.log(`🗑️ Deleting product: ${id}`);
    const products = await readProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    const deletedProduct = products[index];
    products.splice(index, 1);
    await writeProducts(products);
    
    console.log(`✅ Deleted product: ${deletedProduct.name} (${id})`);
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    throw error;
  }
}

// Bulk delete products
export async function bulkDeleteProducts(ids: string[]): Promise<{ deleted: number; errors: string[] }> {
  try {
    console.log(`🗑️ Bulk deleting ${ids.length} products`);
    const products = await readProducts();
    const errors: string[] = [];
    let deleted = 0;
    
    const remainingProducts = products.filter(product => {
      if (ids.includes(product.id)) {
        deleted++;
        console.log(`✅ Deleting: ${product.name} (${product.id})`);
        return false;
      }
      return true;
    });
    
    await writeProducts(remainingProducts);
    
    console.log(`✅ Bulk delete complete: ${deleted} deleted, ${errors.length} errors`);
    return { deleted, errors };
  } catch (error) {
    console.error('❌ Error in bulk delete:', error);
    throw error;
  }
}

// Search products
export async function searchProducts(query: string): Promise<AdminProduct[]> {
  try {
    console.log(`🔎 Searching products: "${query}"`);
    const products = await readProducts();
    
    const lowerQuery = query.toLowerCase();
    const results = products.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description?.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery) ||
      product.brand?.toLowerCase().includes(lowerQuery)
    );
    
    console.log(`✅ Found ${results.length} products matching "${query}"`);
    return results;
  } catch (error) {
    console.error('❌ Error searching products:', error);
    throw error;
  }
}

// Get products by category
export async function getProductsByCategory(category: string): Promise<AdminProduct[]> {
  try {
    console.log(`📦 Getting products in category: ${category}`);
    const products = await readProducts();
    const results = products.filter(p => p.category === category);
    console.log(`✅ Found ${results.length} products in ${category}`);
    return results;
  } catch (error) {
    console.error('❌ Error getting products by category:', error);
    throw error;
  }
}

// Migrate from JSON to KV (useful for deployment)
export async function migrateToKV(): Promise<void> {
  try {
    console.log('🔄 Starting migration from JSON to KV...');
    
    if (!hasKVConfig) {
      throw new Error('KV configuration not available');
    }
    
    // Read from JSON file
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(data);
    
    // Write to KV
    await kv.set(KV_PRODUCTS_KEY, products);
    
    console.log(`✅ Migrated ${products.length} products to KV`);
  } catch (error) {
    console.error('❌ Error migrating to KV:', error);
    throw error;
  }
}

// Export all functions as a service object for backward compatibility
export const ProductStorageService = {
  readProducts,
  writeProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  searchProducts,
  getProductsByCategory,
  migrateToKV
};
