// Authentication utilities for admin system (Edge Runtime compatible)

import jwt from 'jsonwebtoken';
import { AdminUser, LoginCredentials, AuthResponse } from '@/types/admin';
import { User } from '@/types/users';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const SESSION_DURATION = '24h';

// Default admin config with bcrypt hash for 'admin123'
const DEFAULT_ADMIN_CONFIG = {
  admin: {
    id: 'admin-1',
    username: 'admin',
    passwordHash: '$2b$12$LQv3c1yqBwEHXk.JHd3vVeH3pumNVdvRdqAwp/HzMiD/83Uq9Q6uW',
    role: 'admin',
    createdAt: '2025-01-01T00:00:00.000Z',
    lastPasswordChange: '2025-01-01T00:00:00.000Z'
  }
};

// Simple credential validation for Edge Runtime
export async function validateCredentials(credentials: LoginCredentials): Promise<AuthResponse> {
  const { username, password } = credentials;
  
  if (!username || !password) {
    return {
      success: false,
      error: 'Username and password are required'
    };
  }
  
  // For Edge Runtime compatibility, we'll validate against environment variables
  // or use a simple hardcoded check as fallback
  const adminUsername = process.env.ADMIN_USERNAME || DEFAULT_ADMIN_CONFIG.admin.username;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (username !== adminUsername || password !== adminPassword) {
    return {
      success: false,
      error: 'Invalid username or password'
    };
  }
  
  const user: AdminUser = {
    id: DEFAULT_ADMIN_CONFIG.admin.id,
    username: adminUsername,
    role: 'admin',
    lastLogin: new Date().toISOString()
  };
  
  return {
    success: true,
    user
  };
}

// Create JWT token
export function createToken(user: AdminUser | User): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: SESSION_DURATION }
  );
}

// Verify JWT token (Edge Runtime compatible)
export function verifyToken(token: string): AdminUser | null {
  console.log('🔐 verifyToken - Starting verification');
  console.log('🔑 verifyToken - Token:', token ? `${token.substring(0, 20)}...` : 'none');
  
  try {
    // Use proper JWT verification instead of manual parsing
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
      id: string;
      username: string;
      role: string;
    };
    console.log('✅ verifyToken - Token verified successfully:', decoded);
    
    const user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role as 'admin'
    };
    console.log('👤 verifyToken - Returning user:', user);
    return user;
  } catch (error) {
    console.log('❌ verifyToken - Verification failed:', error);
    return null;
  }
}

// Note: Cookie functions are handled in API routes, not here
// These functions are kept for compatibility but should be used in API routes only

// Check if user is authenticated (for client-side use)
export function isAuthenticated(): boolean {
  // This will be implemented client-side or in API routes
  return false;
}

// Require authentication (for API routes)
export function requireAuth(): AdminUser {
  throw new Error('Authentication required - use in API routes only');
}

// Note: Crypto functions removed to avoid Edge Runtime issues
// These can be implemented in API routes if needed

// Rate limiting (simple in-memory implementation)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts?: number; lockoutTime?: number } {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  
  if (!attempts) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }
  
  // Reset if lockout period has passed
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(ip);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }
  
  // Check if locked out
  if (attempts.count >= MAX_ATTEMPTS) {
    const lockoutTime = LOCKOUT_DURATION - (now - attempts.lastAttempt);
    return { allowed: false, lockoutTime };
  }
  
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - attempts.count - 1 };
}

export function recordLoginAttempt(ip: string, success: boolean) {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: now };
  
  if (success) {
    // Clear attempts on successful login
    loginAttempts.delete(ip);
  } else {
    // Increment failed attempts
    attempts.count += 1;
    attempts.lastAttempt = now;
    loginAttempts.set(ip, attempts);
  }
}
