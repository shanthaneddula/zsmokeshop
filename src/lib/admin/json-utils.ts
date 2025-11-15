// JSON file utilities for admin data management
import fs from 'fs/promises';
import path from 'path';
import { AdminProduct, AdminCategory } from '@/types/admin';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const BACKUP_DIR = path.join(DATA_DIR, 'backup');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Create backup of existing file
async function createBackup(filename: string): Promise<void> {
  try {
    const sourcePath = path.join(DATA_DIR, filename);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `${filename.replace('.json', '')}_${timestamp}.json`);
    
    // Check if source file exists
    try {
      await fs.access(sourcePath);
      await fs.copyFile(sourcePath, backupPath);
      console.log(`Backup created: ${backupPath}`);
    } catch {
      // Source file doesn't exist, skip backup
      console.log(`No existing file to backup: ${filename}`);
    }
  } catch (error) {
    console.error(`Error creating backup for ${filename}:`, error);
    throw error;
  }
}

// Read JSON file with error handling
async function readJsonFile<T>(filename: string): Promise<T[]> {
  try {
    await ensureDirectories();
    const filePath = path.join(DATA_DIR, filename);
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error: unknown) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === 'ENOENT') {
        // File doesn't exist, return empty array
        console.log(`File ${filename} doesn't exist, returning empty array`);
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    throw new Error(`Failed to read ${filename}: ${error}`);
  }
}

// Write JSON file with backup and validation
async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  try {
    await ensureDirectories();
    
    // Create backup before writing
    await createBackup(filename);
    
    // Validate data is an array
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    const filePath = path.join(DATA_DIR, filename);
    const jsonData = JSON.stringify(data, null, 2);
    
    await fs.writeFile(filePath, jsonData, 'utf-8');
    console.log(`Successfully wrote ${data.length} items to ${filename}`);
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw new Error(`Failed to write ${filename}: ${error}`);
  }
}

// Products-specific utilities
export const ProductsJsonUtils = {
  async readProducts(): Promise<AdminProduct[]> {
    return readJsonFile<AdminProduct>('products.json');
  },

  async writeProducts(products: AdminProduct[]): Promise<void> {
    try {
      console.log('💾 ProductsJsonUtils.writeProducts - Starting...');
      console.log('📊 ProductsJsonUtils.writeProducts - Products count:', products.length);
      await writeJsonFile('products.json', products);
      console.log('✅ ProductsJsonUtils.writeProducts - Success');
    } catch (error) {
      console.error('❌ ProductsJsonUtils.writeProducts - Error:', error);
      throw error;
    }
  },

  async findProductById(id: string): Promise<AdminProduct | null> {
    const products = await this.readProducts();
    return products.find(p => p.id === id) || null;
  },

  async createProduct(product: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminProduct> {
    try {
      console.log('🏗️ ProductsJsonUtils.createProduct - Starting...');
      console.log('📦 ProductsJsonUtils.createProduct - Product data:', JSON.stringify(product, null, 2));
      
      const products = await this.readProducts();
      console.log('📊 ProductsJsonUtils.createProduct - Existing products count:', products.length);
      
      const newProduct: AdminProduct = {
        ...product,
        id: `prod_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        imageHistory: product.image ? [product.image] : [],
      };
      
      console.log('🆕 ProductsJsonUtils.createProduct - New product:', JSON.stringify(newProduct, null, 2));
      
      products.push(newProduct);
      console.log('📝 ProductsJsonUtils.createProduct - Writing products to file...');
      
      await this.writeProducts(products);
      console.log('✅ ProductsJsonUtils.createProduct - Product created successfully');
      
      return newProduct;
    } catch (error) {
      console.error('❌ ProductsJsonUtils.createProduct - Error:', error);
      throw error;
    }
  },

  async updateProduct(id: string, updates: Partial<AdminProduct>): Promise<AdminProduct | null> {
    const products = await this.readProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const existingProduct = products[index];
    const updatedProduct: AdminProduct = {
      ...existingProduct,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
      // Update image history if image changed
      imageHistory: updates.image && updates.image !== existingProduct.image
        ? [...(existingProduct.imageHistory || []), updates.image]
        : existingProduct.imageHistory,
    };
    
    products[index] = updatedProduct;
    await this.writeProducts(products);
    
    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.readProducts();
    const initialLength = products.length;
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === initialLength) {
      return false; // Product not found
    }
    
    await this.writeProducts(filteredProducts);
    return true;
  },

  async getProductsByCategory(categorySlug: string): Promise<AdminProduct[]> {
    const products = await this.readProducts();
    return products.filter(p => p.category === categorySlug);
  },

  async searchProducts(query: string): Promise<AdminProduct[]> {
    const products = await this.readProducts();
    const searchTerm = query.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm) ||
      product.sku?.toLowerCase().includes(searchTerm)
    );
  }
};

// Categories-specific utilities
export const CategoriesJsonUtils = {
  async readCategories(): Promise<AdminCategory[]> {
    return readJsonFile<AdminCategory>('categories.json');
  },

  async writeCategories(categories: AdminCategory[]): Promise<void> {
    return writeJsonFile('categories.json', categories);
  },

  async findCategoryById(id: string): Promise<AdminCategory | null> {
    const categories = await this.readCategories();
    return categories.find(c => c.id === id) || null;
  },

  async findCategoryBySlug(slug: string): Promise<AdminCategory | null> {
    const categories = await this.readCategories();
    return categories.find(c => c.slug === slug) || null;
  },

  async createCategory(category: Omit<AdminCategory, 'id' | 'createdAt' | 'updatedAt' | 'productCount'>): Promise<AdminCategory> {
    const categories = await this.readCategories();
    
    const newCategory: AdminCategory = {
      ...category,
      id: `cat_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      productCount: 0, // Will be calculated
    };
    
    categories.push(newCategory);
    await this.writeCategories(categories);
    
    return newCategory;
  },

  async updateCategory(id: string, updates: Partial<AdminCategory>): Promise<AdminCategory | null> {
    const categories = await this.readCategories();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedCategory: AdminCategory = {
      ...categories[index],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };
    
    categories[index] = updatedCategory;
    await this.writeCategories(categories);
    
    return updatedCategory;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const categories = await this.readCategories();
    const initialLength = categories.length;
    const filteredCategories = categories.filter(c => c.id !== id);
    
    if (filteredCategories.length === initialLength) {
      return false; // Category not found
    }
    
    await this.writeCategories(filteredCategories);
    return true;
  },

  async updateProductCounts(): Promise<void> {
    const categories = await this.readCategories();
    const products = await ProductsJsonUtils.readProducts();
    
    const updatedCategories = categories.map(category => ({
      ...category,
      productCount: products.filter(p => p.category === category.slug).length,
    }));
    
    await this.writeCategories(updatedCategories);
  }
};

// General utilities
export const JsonUtils = {
  ProductsJsonUtils,
  CategoriesJsonUtils,
  
  async initializeDataFiles(): Promise<void> {
    await ensureDirectories();
    
    // Initialize empty files if they don't exist
    const productsExist = await fs.access(path.join(DATA_DIR, 'products.json')).then(() => true).catch(() => false);
    const categoriesExist = await fs.access(path.join(DATA_DIR, 'categories.json')).then(() => true).catch(() => false);
    
    if (!productsExist) {
      await writeJsonFile('products.json', []);
    }
    
    if (!categoriesExist) {
      await writeJsonFile('categories.json', []);
    }
  }
};
