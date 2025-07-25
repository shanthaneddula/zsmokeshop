// Image management utilities for admin system
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public/images/admin');
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export interface ImageInfo {
  fileName: string;
  category: string;
  size: number;
  created: Date;
  modified: Date;
  url: string;
  path: string;
}

export interface CleanupResult {
  deletedFiles: string[];
  errors: string[];
  totalDeleted: number;
  totalErrors: number;
}

// Get all images in a category
export async function getImagesInCategory(category: string): Promise<ImageInfo[]> {
  try {
    const categoryDir = path.join(UPLOAD_DIR, category);
    
    try {
      await fs.access(categoryDir);
    } catch {
      return []; // Category directory doesn't exist
    }
    
    const files = await fs.readdir(categoryDir);
    const imageFiles: ImageInfo[] = [];
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        const filePath = path.join(categoryDir, file);
        const stats = await fs.stat(filePath);
        
        imageFiles.push({
          fileName: file,
          category,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: `/images/admin/${category}/${file}`,
          path: filePath
        });
      }
    }
    
    return imageFiles.sort((a, b) => b.created.getTime() - a.created.getTime());
  } catch (error) {
    console.error(`Error getting images in category ${category}:`, error);
    return [];
  }
}

// Get all images across all categories
export async function getAllImages(): Promise<ImageInfo[]> {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const categories = await fs.readdir(UPLOAD_DIR);
    const allImages: ImageInfo[] = [];
    
    for (const category of categories) {
      const categoryPath = path.join(UPLOAD_DIR, category);
      const stats = await fs.stat(categoryPath);
      
      if (stats.isDirectory()) {
        const categoryImages = await getImagesInCategory(category);
        allImages.push(...categoryImages);
      }
    }
    
    return allImages.sort((a, b) => b.created.getTime() - a.created.getTime());
  } catch (error) {
    console.error('Error getting all images:', error);
    return [];
  }
}

// Delete a single image
export async function deleteImage(imagePath: string): Promise<boolean> {
  try {
    // Security check - ensure path is within upload directory
    const fullPath = path.resolve(imagePath);
    const uploadPath = path.resolve(UPLOAD_DIR);
    
    if (!fullPath.startsWith(uploadPath)) {
      throw new Error('Invalid file path');
    }
    
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error(`Error deleting image ${imagePath}:`, error);
    return false;
  }
}

// Delete multiple images
export async function deleteImages(imagePaths: string[]): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedFiles: [],
    errors: [],
    totalDeleted: 0,
    totalErrors: 0
  };
  
  for (const imagePath of imagePaths) {
    const success = await deleteImage(imagePath);
    if (success) {
      result.deletedFiles.push(imagePath);
      result.totalDeleted++;
    } else {
      result.errors.push(`Failed to delete: ${imagePath}`);
      result.totalErrors++;
    }
  }
  
  return result;
}

// Find orphaned images (images not referenced in products)
export async function findOrphanedImages(referencedUrls: string[]): Promise<ImageInfo[]> {
  const allImages = await getAllImages();
  const referencedSet = new Set(referencedUrls);
  
  return allImages.filter(image => !referencedSet.has(image.url));
}

// Clean up orphaned images
export async function cleanupOrphanedImages(referencedUrls: string[]): Promise<CleanupResult> {
  const orphanedImages = await findOrphanedImages(referencedUrls);
  const orphanedPaths = orphanedImages.map(img => img.path);
  
  return await deleteImages(orphanedPaths);
}

// Clean up old images (older than specified days)
export async function cleanupOldImages(daysOld: number): Promise<CleanupResult> {
  const allImages = await getAllImages();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const oldImages = allImages.filter(image => image.created < cutoffDate);
  const oldImagePaths = oldImages.map(img => img.path);
  
  return await deleteImages(oldImagePaths);
}

// Get storage statistics
export async function getStorageStats(): Promise<{
  totalImages: number;
  totalSize: number;
  categoryCounts: { [category: string]: number };
  categorySizes: { [category: string]: number };
  oldestImage?: ImageInfo;
  newestImage?: ImageInfo;
}> {
  const allImages = await getAllImages();
  
  const stats = {
    totalImages: allImages.length,
    totalSize: 0,
    categoryCounts: {} as { [category: string]: number },
    categorySizes: {} as { [category: string]: number },
    oldestImage: undefined as ImageInfo | undefined,
    newestImage: undefined as ImageInfo | undefined
  };
  
  for (const image of allImages) {
    stats.totalSize += image.size;
    
    if (!stats.categoryCounts[image.category]) {
      stats.categoryCounts[image.category] = 0;
      stats.categorySizes[image.category] = 0;
    }
    
    stats.categoryCounts[image.category]++;
    stats.categorySizes[image.category] += image.size;
  }
  
  if (allImages.length > 0) {
    stats.oldestImage = allImages.reduce((oldest, current) => 
      current.created < oldest.created ? current : oldest
    );
    stats.newestImage = allImages.reduce((newest, current) => 
      current.created > newest.created ? current : newest
    );
  }
  
  return stats;
}

// Validate image URL format
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's an admin uploaded image
  if (url.startsWith('/images/admin/')) {
    const parts = url.split('/');
    return parts.length >= 4 && parts[1] === 'images' && parts[2] === 'admin';
  }
  
  // Check if it's a regular product image
  if (url.startsWith('/images/')) {
    return true;
  }
  
  // Check if it's an external URL
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Extract category from image URL
export function getCategoryFromUrl(url: string): string | null {
  if (!url.startsWith('/images/admin/')) return null;
  
  const parts = url.split('/');
  return parts.length >= 4 ? parts[3] : null;
}

// Generate thumbnail URL (for future thumbnail generation)
export function getThumbnailUrl(originalUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  if (!originalUrl.startsWith('/images/admin/')) return originalUrl;
  
  const ext = path.extname(originalUrl);
  const baseName = originalUrl.replace(ext, '');
  
  const sizeMap = {
    small: '_thumb_150',
    medium: '_thumb_300',
    large: '_thumb_600'
  };
  
  return `${baseName}${sizeMap[size]}${ext}`;
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Create category directory if it doesn't exist
export async function ensureCategoryDirectory(category: string): Promise<void> {
  const categoryDir = path.join(UPLOAD_DIR, category);
  await fs.mkdir(categoryDir, { recursive: true });
}

// Move image to different category
export async function moveImageToCategory(
  currentPath: string, 
  newCategory: string
): Promise<{ success: boolean; newUrl?: string; error?: string }> {
  try {
    // Security check
    const fullCurrentPath = path.resolve(currentPath);
    const uploadPath = path.resolve(UPLOAD_DIR);
    
    if (!fullCurrentPath.startsWith(uploadPath)) {
      return { success: false, error: 'Invalid file path' };
    }
    
    // Ensure new category directory exists
    await ensureCategoryDirectory(newCategory);
    
    const fileName = path.basename(currentPath);
    const newPath = path.join(UPLOAD_DIR, newCategory, fileName);
    
    // Move file
    await fs.rename(fullCurrentPath, newPath);
    
    const newUrl = `/images/admin/${newCategory}/${fileName}`;
    
    return { success: true, newUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
