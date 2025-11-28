/**
 * User Storage Service
 * Manages user accounts in Redis KV
 */

import Redis from 'ioredis';
import { User, CreateUserRequest, UpdateUserRequest, DEFAULT_PERMISSIONS } from '@/types/users';
import bcrypt from 'bcryptjs';

const USERS_KEY = 'zsmokeshop:users';

// Initialize Redis client
let redisClient: Redis | null = null;
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    if (!redisClient) {
      console.error('Redis client not initialized');
      return [];
    }
    
    const data = await redisClient.get(USERS_KEY);
    if (!data) {
      return [];
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const users = await getAllUsers();
    return users.find(u => u.id === userId) || null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const users = await getAllUsers();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const users = await getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserRequest, createdBy: string): Promise<User> {
  try {
    // Check if username already exists
    const existingUser = await getUserByUsername(data.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await getUserByEmail(data.email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Get default permissions for role
    const permissions = {
      ...DEFAULT_PERMISSIONS[data.role],
      ...data.permissions,
    };

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      permissions,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
    };

    // Add to users list
    const users = await getAllUsers();
    users.push(newUser);
    
    if (redisClient) {
      await redisClient.set(USERS_KEY, JSON.stringify(users));
    }

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update user
 */
export async function updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
  try {
    const users = await getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const user = users[userIndex];

    // Update password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Update role permissions if role changed
    let updatedPermissions = user.permissions;
    if (data.role && data.role !== user.role) {
      updatedPermissions = {
        ...DEFAULT_PERMISSIONS[data.role],
        ...data.permissions,
      };
    } else if (data.permissions) {
      updatedPermissions = {
        ...user.permissions,
        ...data.permissions,
      };
    }

    // Update user
    users[userIndex] = {
      ...user,
      ...data,
      permissions: updatedPermissions,
      updatedAt: new Date().toISOString(),
    };

    if (redisClient) {
      await redisClient.set(USERS_KEY, JSON.stringify(users));
    }

    return users[userIndex];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const users = await getAllUsers();
    const filteredUsers = users.filter(u => u.id !== userId);

    if (filteredUsers.length === users.length) {
      throw new Error('User not found');
    }

    if (redisClient) {
      await redisClient.set(USERS_KEY, JSON.stringify(filteredUsers));
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Verify user credentials
 */
export async function verifyUserCredentials(username: string, password: string): Promise<User | null> {
  try {
    const user = await getUserByUsername(username);
    
    if (!user || !user.isActive) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return null;
    }

    // Update last login
    await updateUserLastLogin(user.id);

    return user;
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return null;
  }
}

/**
 * Update user last login
 */
async function updateUserLastLogin(userId: string): Promise<void> {
  try {
    const users = await getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
      users[userIndex].lastLogin = new Date().toISOString();
      if (redisClient) {
        await redisClient.set(USERS_KEY, JSON.stringify(users));
      }
    }
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

/**
 * Get active users count
 */
export async function getActiveUsersCount(): Promise<number> {
  try {
    const users = await getAllUsers();
    return users.filter(u => u.isActive).length;
  } catch (error) {
    console.error('Error getting active users count:', error);
    return 0;
  }
}
