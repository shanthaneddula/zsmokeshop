// Admin-specific types for Z SMOKE SHOP

import { Product, Category } from './index';

// Enhanced Product interface for admin operations
export interface AdminProduct extends Product {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  imageHistory?: string[]; // Track image changes
  status: 'active' | 'inactive' | 'draft';
  sku?: string; // For inventory tracking
  barcode?: string; // UPC/EAN barcode for product identification
  stockQuantity?: number; // Number of items in stock for inventory management
  weight?: string; // For shipping calculations (e.g., "1.5 lbs", "250g")
  dimensions?: string; // For shipping calculations (e.g., "10x5x3 inches")
}

// Enhanced Category interface for admin operations
export interface AdminCategory extends Category {
  createdAt: string;
  updatedAt: string;
  productCount: number; // Auto-calculated
  status: 'active' | 'inactive';
  sortOrder: number; // For custom ordering
  seoTitle?: string;
  seoDescription?: string;
  parentId?: string; // For subcategories (future)
}

// Authentication types
export interface AdminUser {
  id: string;
  username: string;
  role: 'admin';
  lastLogin?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AdminUser;
  error?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

// Image upload types
export interface ImageUploadResponse {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

// Backup types
export interface BackupInfo {
  timestamp: string;
  filename: string;
  type: 'products' | 'categories' | 'full';
  size: number;
}

// Dashboard statistics
export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStockProducts: number;
  recentlyAdded: AdminProduct[];
  recentlyUpdated: AdminProduct[];
}

// Bulk operation types
export interface BulkOperation {
  action: 'delete' | 'activate' | 'deactivate' | 'update-category';
  productIds: string[];
  data?: Record<string, unknown>;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
}
