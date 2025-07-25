// JSON file utilities for admin data management

import { promises as fs } from 'fs';
import path from 'path';
import { AdminProduct, AdminCategory, BackupInfo } from '@/types/admin';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const BACKUP_DIR = path.join(DATA_DIR, 'backup');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

// Ensure directories exist
export async function ensureDirectories() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    // Ensure backup directory has .gitignore
    const gitignorePath = path.join(BACKUP_DIR, '.gitignore');
    try {
      await fs.access(gitignorePath);
    } catch {
      await fs.writeFile(gitignorePath, '# Ignore all backup files\n*\n!.gitignore\n');
    }
  } catch (error) {
    console.error('Error ensuring directories:', error);
    throw error;
  }
}

// Create backup of a file
export async function createBackup(type: 'products' | 'categories'): Promise<BackupInfo> {
  await ensureDirectories();
  
  const sourceFile = type === 'products' ? PRODUCTS_FILE : CATEGORIES_FILE;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = `${type}-${timestamp}.json`;
  const backupPath = path.join(BACKUP_DIR, backupFilename);
  
  try {
    // Check if source file exists
    await fs.access(sourceFile);
    
    // Copy file to backup
    await fs.copyFile(sourceFile, backupPath);
    
    // Get file size
    const stats = await fs.stat(backupPath);
    
    return {
      timestamp: new Date().toISOString(),
      filename: backupFilename,
      type,
      size: stats.size
    };
  } catch (error) {
    console.error(`Error creating backup for ${type}:`, error);
    throw error;
  }
}

// Read products from JSON file
export async function readProducts(): Promise<AdminProduct[]> {
  try {
    await ensureDirectories();
    
    // Check if file exists, create empty array if not
    try {
      await fs.access(PRODUCTS_FILE);
    } catch {
      await fs.writeFile(PRODUCTS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    
    const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data) as AdminProduct[];
  } catch (error) {
    console.error('Error reading products:', error);
    throw error;
  }
}

// Write products to JSON file
export async function writeProducts(products: AdminProduct[]): Promise<void> {
  try {
    await ensureDirectories();
    
    // Create backup before writing
    try {
      await createBackup('products');
    } catch (backupError) {
      console.warn('Failed to create backup:', backupError);
      // Continue with write operation even if backup fails
    }
    
    // Write to temporary file first, then rename (atomic operation)
    const tempFile = `${PRODUCTS_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(products, null, 2));
    await fs.rename(tempFile, PRODUCTS_FILE);
  } catch (error) {
    console.error('Error writing products:', error);
    throw error;
  }
}

// Read categories from JSON file
export async function readCategories(): Promise<AdminCategory[]> {
  try {
    await ensureDirectories();
    
    // Check if file exists, create empty array if not
    try {
      await fs.access(CATEGORIES_FILE);
    } catch {
      await fs.writeFile(CATEGORIES_FILE, JSON.stringify([], null, 2));
      return [];
    }
    
    const data = await fs.readFile(CATEGORIES_FILE, 'utf8');
    return JSON.parse(data) as AdminCategory[];
  } catch (error) {
    console.error('Error reading categories:', error);
    throw error;
  }
}

// Write categories to JSON file
export async function writeCategories(categories: AdminCategory[]): Promise<void> {
  try {
    await ensureDirectories();
    
    // Create backup before writing
    try {
      await createBackup('categories');
    } catch (backupError) {
      console.warn('Failed to create backup:', backupError);
      // Continue with write operation even if backup fails
    }
    
    // Write to temporary file first, then rename (atomic operation)
    const tempFile = `${CATEGORIES_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(categories, null, 2));
    await fs.rename(tempFile, CATEGORIES_FILE);
  } catch (error) {
    console.error('Error writing categories:', error);
    throw error;
  }
}

// Find product by ID
export async function findProductById(id: string): Promise<AdminProduct | null> {
  const products = await readProducts();
  return products.find(p => p.id === id) || null;
}

// Find category by ID
export async function findCategoryById(id: string): Promise<AdminCategory | null> {
  const categories = await readCategories();
  return categories.find(c => c.id === id) || null;
}

// Find category by slug
export async function findCategoryBySlug(slug: string): Promise<AdminCategory | null> {
  const categories = await readCategories();
  return categories.find(c => c.slug === slug) || null;
}

// Generate unique ID
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

// Validate product data
export function validateProduct(product: Partial<AdminProduct>): string[] {
  const errors: string[] = [];
  
  if (!product.name?.trim()) {
    errors.push('Product name is required');
  }
  
  if (!product.category?.trim()) {
    errors.push('Product category is required');
  }
  
  if (typeof product.price !== 'number' || product.price <= 0) {
    errors.push('Product price must be a positive number');
  }
  
  if (product.salePrice && (typeof product.salePrice !== 'number' || product.salePrice <= 0)) {
    errors.push('Sale price must be a positive number');
  }
  
  if (product.salePrice && product.price && product.salePrice >= product.price) {
    errors.push('Sale price must be less than regular price');
  }
  
  if (!product.image?.trim()) {
    errors.push('Product image is required');
  }
  
  return errors;
}

// Validate category data
export function validateCategory(category: Partial<AdminCategory>): string[] {
  const errors: string[] = [];
  
  if (!category.name?.trim()) {
    errors.push('Category name is required');
  }
  
  if (!category.slug?.trim()) {
    errors.push('Category slug is required');
  }
  
  // Validate slug format (lowercase, hyphens only)
  if (category.slug && !/^[a-z0-9-]+$/.test(category.slug)) {
    errors.push('Category slug must contain only lowercase letters, numbers, and hyphens');
  }
  
  return errors;
}

// Generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Clean up orphaned images
export async function cleanupOrphanedImages(): Promise<string[]> {
  const imagesDir = path.join(process.cwd(), 'public/images/products');
  const removedFiles: string[] = [];
  
  try {
    const products = await readProducts();
    const usedImages = new Set(products.map(p => path.basename(p.image)));
    
    // Get all files in images directory
    const files = await fs.readdir(imagesDir);
    
    for (const file of files) {
      if (!usedImages.has(file) && file.match(/\.(jpg|jpeg|png|webp)$/i)) {
        const filePath = path.join(imagesDir, file);
        await fs.unlink(filePath);
        removedFiles.push(file);
      }
    }
  } catch (error) {
    console.error('Error cleaning up orphaned images:', error);
  }
  
  return removedFiles;
}
