/**
 * User Management Types for Z SMOKE SHOP
 * Role-based Access Control (RBAC) System
 */

export type UserRole = 'admin' | 'orders-manager' | 'inventory-manager';

export interface UserPermissions {
  // Orders permissions
  viewOrders: boolean;
  manageOrders: boolean;
  
  // Products permissions
  viewProducts: boolean;
  addProducts: boolean;
  editProducts: boolean;
  deleteProducts: boolean;
  
  // Categories permissions
  viewCategories: boolean;
  manageCategories: boolean;
  
  // Store photos permissions
  viewStorePhotos: boolean;
  manageStorePhotos: boolean;
  
  // Settings permissions
  viewSettings: boolean;
  manageSettings: boolean;
  
  // User management (admin only)
  manageUsers: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Hashed password
  role: UserRole;
  permissions: UserPermissions;
  
  // Profile info
  firstName: string;
  lastName: string;
  phone?: string;
  
  // Status
  isActive: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string; // Admin who created this user
  lastLogin?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  permissions?: Partial<UserPermissions>;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  permissions?: Partial<UserPermissions>;
  isActive?: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: 'product' | 'category' | 'order' | 'store-photo' | 'setting' | 'user';
  resourceId?: string;
  details: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  timestamp: string;
  ipAddress?: string;
}

// Default permissions for each role
export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    viewOrders: true,
    manageOrders: true,
    viewProducts: true,
    addProducts: true,
    editProducts: true,
    deleteProducts: true,
    viewCategories: true,
    manageCategories: true,
    viewStorePhotos: true,
    manageStorePhotos: true,
    viewSettings: true,
    manageSettings: true,
    manageUsers: true,
  },
  'orders-manager': {
    viewOrders: true,
    manageOrders: true,
    viewProducts: false,
    addProducts: false,
    editProducts: false,
    deleteProducts: false,
    viewCategories: false,
    manageCategories: false,
    viewStorePhotos: false,
    manageStorePhotos: false,
    viewSettings: false,
    manageSettings: false,
    manageUsers: false,
  },
  'inventory-manager': {
    viewOrders: false,
    manageOrders: false,
    viewProducts: true,
    addProducts: true,
    editProducts: true,
    deleteProducts: true,
    viewCategories: true,
    manageCategories: true,
    viewStorePhotos: true,
    manageStorePhotos: true,
    viewSettings: false,
    manageSettings: false,
    manageUsers: false,
  },
};
