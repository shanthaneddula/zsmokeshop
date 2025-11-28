// Server-side authentication utilities with file system access
// This file is for API routes only, not Edge Runtime

import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { AdminUser } from '@/types/admin';
import { User } from '@/types/users';
import { getUserByUsername, verifyUserCredentials } from './user-storage-service';
import { verifyToken } from './auth';

const ADMIN_CONFIG_PATH = path.join(process.cwd(), 'src/data/admin-config.json');

// Admin configuration interface
interface AdminConfig {
  admin: {
    id: string;
    username: string;
    passwordHash: string;
    role: string;
    createdAt: string;
    lastPasswordChange: string;
  };
}

// Load admin configuration
function loadAdminConfig(): AdminConfig {
  try {
    const configData = fs.readFileSync(ADMIN_CONFIG_PATH, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error loading admin config:', error);
    // Return default config with bcrypt hash for 'admin123'
    return {
      admin: {
        id: 'admin-1',
        username: 'admin',
        passwordHash: '$2b$12$LQv3c1yqBwEHXk.JHd3vVeH3pumNVdvRdqAwp/HzMiD/83Uq9Q6uW',
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastPasswordChange: new Date().toISOString()
      }
    };
  }
}

// Save admin configuration
function saveAdminConfig(config: AdminConfig): void {
  try {
    fs.writeFileSync(ADMIN_CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving admin config:', error);
    throw new Error('Failed to save admin configuration');
  }
}

// Validate credentials with bcrypt (server-side only)
// Supports both main admin and employee users
export async function validateCredentialsWithBcrypt(username: string, password: string): Promise<{ success: boolean; user?: AdminUser | User; error?: string }> {
  try {
    // First, check if it's the main admin from config file
    const config = loadAdminConfig();
    const adminUser = config.admin;
    
    if (username === adminUser.username) {
      const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);
      
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }
      
      const user: AdminUser = {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role as 'admin',
        lastLogin: new Date().toISOString()
      };
      
      return {
        success: true,
        user
      };
    }
    
    // If not main admin, check employee users from KV
    const employeeUser = await verifyUserCredentials(username, password);
    
    if (!employeeUser) {
      return {
        success: false,
        error: 'Invalid username or password'
      };
    }
    
    return {
      success: true,
      user: employeeUser
    };
  } catch (error) {
    console.error('Error validating credentials:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

// Change admin password (server-side only)
export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const config = loadAdminConfig();
    const adminUser = config.admin;
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminUser.passwordHash);
    
    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: 'Current password is incorrect'
      };
    }
    
    // Validate new password
    if (newPassword.length < 8) {
      return {
        success: false,
        error: 'New password must be at least 8 characters long'
      };
    }
    
    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update config
    config.admin.passwordHash = newPasswordHash;
    config.admin.lastPasswordChange = new Date().toISOString();
    
    // Save config
    saveAdminConfig(config);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error changing password:', error);
    return {
      success: false,
      error: 'Failed to change password'
    };
  }
}

// Get admin user info (server-side only)
export function getAdminInfo(): { username: string; lastPasswordChange: string } {
  try {
    const config = loadAdminConfig();
    return {
      username: config.admin.username,
      lastPasswordChange: config.admin.lastPasswordChange
    };
  } catch (error) {
    console.error('Error getting admin info:', error);
    return {
      username: 'admin',
      lastPasswordChange: new Date().toISOString()
    };
  }
}

// Verify admin authentication from request
export async function verifyAdminAuth(request: NextRequest): Promise<{ isAuthenticated: boolean; user?: User | AdminUser }> {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return { isAuthenticated: false };
    }
    
    const payload = verifyToken(token);
    
    if (!payload || !payload.id || !payload.username) {
      return { isAuthenticated: false };
    }
    
    // Check if it's the main admin
    const config = loadAdminConfig();
    if (payload.username === config.admin.username) {
      const adminUser: AdminUser = {
        id: payload.id,
        username: payload.username,
        role: 'admin',
        lastLogin: new Date().toISOString(),
      };
      return { isAuthenticated: true, user: adminUser };
    }
    
    // Check if it's an employee user
    const employeeUser = await getUserByUsername(payload.username);
    
    if (!employeeUser || !employeeUser.isActive) {
      return { isAuthenticated: false };
    }
    
    return { isAuthenticated: true, user: employeeUser };
  } catch (error) {
    console.error('Error verifying admin auth:', error);
    return { isAuthenticated: false };
  }
}
