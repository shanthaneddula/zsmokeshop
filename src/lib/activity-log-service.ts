/**
 * Activity Log Service
 * Tracks all user actions for admin visibility
 */

import Redis from 'ioredis';
import { ActivityLog } from '@/types/users';

const ACTIVITY_LOGS_KEY = 'zsmokeshop:activity_logs';
const MAX_LOGS = 1000; // Keep last 1000 activities

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
 * Log an activity
 */
export async function logActivity(
  userId: string,
  username: string,
  action: string,
  resource: ActivityLog['resource'],
  details: string,
  resourceId?: string,
  changes?: Record<string, { old: unknown; new: unknown }>,
  ipAddress?: string
): Promise<void> {
  try {
    const activity: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username,
      action,
      resource,
      resourceId,
      details,
      changes,
      timestamp: new Date().toISOString(),
      ipAddress,
    };

    const logs = await getAllActivityLogs();
    logs.unshift(activity); // Add to beginning

    // Keep only last MAX_LOGS entries
    const trimmedLogs = logs.slice(0, MAX_LOGS);

    if (redisClient) {
      await redisClient.set(ACTIVITY_LOGS_KEY, JSON.stringify(trimmedLogs));
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

/**
 * Get all activity logs
 */
export async function getAllActivityLogs(): Promise<ActivityLog[]> {
  try {
    if (!redisClient) {
      console.error('Redis client not initialized');
      return [];
    }
    
    const data = await redisClient.get(ACTIVITY_LOGS_KEY);
    if (!data) {
      return [];
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
}

/**
 * Get activity logs by user
 */
export async function getActivityLogsByUser(userId: string): Promise<ActivityLog[]> {
  try {
    const logs = await getAllActivityLogs();
    return logs.filter(log => log.userId === userId);
  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    return [];
  }
}

/**
 * Get activity logs by resource
 */
export async function getActivityLogsByResource(
  resource: ActivityLog['resource'],
  resourceId?: string
): Promise<ActivityLog[]> {
  try {
    const logs = await getAllActivityLogs();
    return logs.filter(log => {
      if (resourceId) {
        return log.resource === resource && log.resourceId === resourceId;
      }
      return log.resource === resource;
    });
  } catch (error) {
    console.error('Error fetching resource activity logs:', error);
    return [];
  }
}

/**
 * Get recent activity logs (last N entries)
 */
export async function getRecentActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
  try {
    const logs = await getAllActivityLogs();
    return logs.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activity logs:', error);
    return [];
  }
}

/**
 * Clear old activity logs (older than specified days)
 */
export async function clearOldActivityLogs(daysToKeep: number = 30): Promise<void> {
  try {
    const logs = await getAllActivityLogs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const recentLogs = logs.filter(log => new Date(log.timestamp) > cutoffDate);

    if (redisClient) {
      await redisClient.set(ACTIVITY_LOGS_KEY, JSON.stringify(recentLogs));
    }
  } catch (error) {
    console.error('Error clearing old activity logs:', error);
  }
}
