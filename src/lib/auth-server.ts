// Server-side authentication utilities
// This file is for API routes only, not Edge Runtime

import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { AdminUser } from '@/types/admin';
import { User } from '@/types/users';
import { getUserByUsername, updateUser, verifyUserCredentials } from './user-storage-service';
import { verifyToken } from './auth';

function getEnvBootstrapUsername(): string | undefined {
  const username = process.env.ADMIN_USERNAME?.trim();
  return username || undefined;
}

async function validateEnvBootstrapAdmin(username: string, password: string): Promise<AdminUser | null> {
  const envUsername = getEnvBootstrapUsername();
  const envHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (!envUsername || !envHash || username !== envUsername) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, envHash);
  if (!isValidPassword) {
    return null;
  }

  return {
    id: 'admin-env',
    username: envUsername,
    role: 'admin',
    lastLogin: new Date().toISOString(),
  };
}

// Validate credentials with bcrypt (server-side only)
// Production users live in Redis. A optional dev/bootstrap admin can be
// configured with ADMIN_USERNAME + ADMIN_PASSWORD_HASH (never a committed hash).
export async function validateCredentialsWithBcrypt(username: string, password: string): Promise<{ success: boolean; user?: AdminUser | User; error?: string }> {
  try {
    const redisUser = await verifyUserCredentials(username, password);
    if (redisUser) {
      return {
        success: true,
        user: redisUser,
      };
    }

    const envUser = await validateEnvBootstrapAdmin(username, password);
    if (envUser) {
      return {
        success: true,
        user: envUser,
      };
    }

    return {
      success: false,
      error: 'Invalid username or password',
    };
  } catch (error) {
    console.error('Error validating credentials:', error);
    return {
      success: false,
      error: 'Authentication failed',
    };
  }
}

// Change admin password. Prefers the Redis user; the env bootstrap hash cannot be updated from the app.
export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
  username?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const targetUsername = username || getEnvBootstrapUsername();
    if (!targetUsername) {
      return {
        success: false,
        error: 'Unable to determine which admin account to update',
      };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        error: 'New password must be at least 8 characters long',
      };
    }

    const redisUser = await getUserByUsername(targetUsername);
    if (redisUser) {
      const storedHash = redisUser.passwordHash || (redisUser as User & { password?: string }).password;
      if (!storedHash) {
        return {
          success: false,
          error: 'No password hash found for this user',
        };
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, storedHash);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          error: 'Current password is incorrect',
        };
      }

      // updateUser hashes passwordHash for us; pass the plaintext new password
      await updateUser(redisUser.id, { passwordHash: newPassword });
      return { success: true };
    }

    const envUsername = getEnvBootstrapUsername();
    const envHash = process.env.ADMIN_PASSWORD_HASH?.trim();
    if (envUsername && envHash && targetUsername === envUsername) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, envHash);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          error: 'Current password is incorrect',
        };
      }

      return {
        success: false,
        error: 'The env bootstrap admin password cannot be changed from the app. Update ADMIN_PASSWORD_HASH in your environment.',
      };
    }

    return {
      success: false,
      error: 'Admin user not found',
    };
  } catch (error) {
    console.error('Error changing password:', error);
    return {
      success: false,
      error: 'Failed to change password',
    };
  }
}

// Get admin user info (server-side only)
export function getAdminInfo(): { username: string; lastPasswordChange: string } {
  return {
    username: getEnvBootstrapUsername() || 'admin',
    lastPasswordChange: '',
  };
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

    const employeeUser = await getUserByUsername(payload.username);
    if (employeeUser && employeeUser.isActive) {
      return { isAuthenticated: true, user: employeeUser };
    }

    const envUsername = getEnvBootstrapUsername();
    if (envUsername && payload.username === envUsername && (process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_EMAIL)) {
      const adminUser: AdminUser = {
        id: payload.id,
        username: payload.username,
        role: 'admin',
        lastLogin: new Date().toISOString(),
      };
      return { isAuthenticated: true, user: adminUser };
    }

    return { isAuthenticated: false };
  } catch (error) {
    console.error('Error verifying admin auth:', error);
    return { isAuthenticated: false };
  }
}
