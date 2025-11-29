/**
 * Timesheet Storage Service for Z SMOKE SHOP
 * Manages employee clock in/out tracking using Redis
 */

import Redis from 'ioredis';
import { TimesheetEntry, TimesheetSummary } from '@/types/users';

// Use Redis Cloud connection from environment
const redis = new Redis(process.env.REDIS_URL || '');

const TIMESHEET_KEY = 'zsmokeshop:timesheets';
const ACTIVE_SESSIONS_KEY = 'zsmokeshop:active_sessions';

/**
 * Clock in - Start a new timesheet entry
 */
export async function clockIn(
  userId: string,
  username: string,
  location?: 'William Cannon' | 'Cameron Rd',
  notes?: string
): Promise<{ success: boolean; entry?: TimesheetEntry; error?: string }> {
  try {
    // Check if user is already clocked in
    const activeSession = await redis.hget(ACTIVE_SESSIONS_KEY, userId);
    if (activeSession) {
      return {
        success: false,
        error: 'You are already clocked in. Please clock out first.',
      };
    }

    // Create new timesheet entry
    const entry: TimesheetEntry = {
      id: `timesheet_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      username,
      clockIn: new Date().toISOString(),
      location,
      notes,
    };

    // Store active session
    await redis.hset(ACTIVE_SESSIONS_KEY, userId, JSON.stringify(entry));

    // Add to timesheet history
    await redis.lpush(TIMESHEET_KEY, JSON.stringify(entry));

    return { success: true, entry };
  } catch (error) {
    console.error('Error clocking in:', error);
    return { success: false, error: 'Failed to clock in' };
  }
}

/**
 * Clock out - End the active timesheet entry
 */
export async function clockOut(
  userId: string,
  notes?: string
): Promise<{ success: boolean; entry?: TimesheetEntry; error?: string }> {
  try {
    // Get active session
    const activeSessionData = await redis.hget(ACTIVE_SESSIONS_KEY, userId);
    if (!activeSessionData) {
      return {
        success: false,
        error: 'You are not currently clocked in.',
      };
    }

    const activeSession: TimesheetEntry = JSON.parse(activeSessionData);

    // Calculate hours worked
    const clockOutTime = new Date();
    const clockInTime = new Date(activeSession.clockIn);
    const hoursWorked = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    // Update entry
    const updatedEntry: TimesheetEntry = {
      ...activeSession,
      clockOut: clockOutTime.toISOString(),
      hoursWorked: Math.round(hoursWorked * 100) / 100, // Round to 2 decimals
      notes: notes || activeSession.notes,
    };

    // Remove from active sessions
    await redis.hdel(ACTIVE_SESSIONS_KEY, userId);

    // Update in timesheet history (find and replace the entry)
    const allEntries = await redis.lrange(TIMESHEET_KEY, 0, -1);
    const updatedEntries = allEntries.map(entryStr => {
      const entry: TimesheetEntry = JSON.parse(entryStr);
      if (entry.id === activeSession.id) {
        return JSON.stringify(updatedEntry);
      }
      return entryStr;
    });

    // Replace all entries
    await redis.del(TIMESHEET_KEY);
    if (updatedEntries.length > 0) {
      await redis.rpush(TIMESHEET_KEY, ...updatedEntries);
    }

    return { success: true, entry: updatedEntry };
  } catch (error) {
    console.error('Error clocking out:', error);
    return { success: false, error: 'Failed to clock out' };
  }
}

/**
 * Get active session for a user
 */
export async function getActiveSession(userId: string): Promise<TimesheetEntry | null> {
  try {
    const activeSessionData = await redis.hget(ACTIVE_SESSIONS_KEY, userId);
    if (!activeSessionData) return null;
    return JSON.parse(activeSessionData);
  } catch (error) {
    console.error('Error getting active session:', error);
    return null;
  }
}

/**
 * Get timesheet entries for a user within a date range
 */
export async function getTimesheetEntries(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<TimesheetEntry[]> {
  try {
    const allEntries = await redis.lrange(TIMESHEET_KEY, 0, -1);
    let entries: TimesheetEntry[] = allEntries
      .map(entryStr => JSON.parse(entryStr))
      .filter(entry => entry.userId === userId);

    // Filter by date range if provided
    if (startDate || endDate) {
      entries = entries.filter(entry => {
        const clockInDate = new Date(entry.clockIn);
        if (startDate && clockInDate < startDate) return false;
        if (endDate && clockInDate > endDate) return false;
        return true;
      });
    }

    // Sort by clock in time (most recent first)
    entries.sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime());

    return entries;
  } catch (error) {
    console.error('Error getting timesheet entries:', error);
    return [];
  }
}

/**
 * Get timesheet summary for a user
 */
export async function getTimesheetSummary(userId: string): Promise<TimesheetSummary | null> {
  try {
    // Get active session
    const activeSession = await getActiveSession(userId);

    // Get all entries
    const allEntries = await getTimesheetEntries(userId);

    // Calculate today's hours
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEntries = allEntries.filter(entry => {
      const clockInDate = new Date(entry.clockIn);
      return clockInDate >= today;
    });
    const totalHoursToday = todayEntries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0);

    // Calculate this week's hours (Monday to Sunday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start
    startOfWeek.setDate(today.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekEntries = allEntries.filter(entry => {
      const clockInDate = new Date(entry.clockIn);
      return clockInDate >= startOfWeek;
    });
    const totalHoursThisWeek = weekEntries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0);

    // Calculate this month's hours
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEntries = allEntries.filter(entry => {
      const clockInDate = new Date(entry.clockIn);
      return clockInDate >= startOfMonth;
    });
    const totalHoursThisMonth = monthEntries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0);

    // Get recent entries (last 10)
    const recentEntries = allEntries.slice(0, 10);

    return {
      userId,
      username: allEntries[0]?.username || '',
      totalHoursToday: Math.round(totalHoursToday * 100) / 100,
      totalHoursThisWeek: Math.round(totalHoursThisWeek * 100) / 100,
      totalHoursThisMonth: Math.round(totalHoursThisMonth * 100) / 100,
      currentlyClockedIn: !!activeSession,
      currentEntry: activeSession || undefined,
      recentEntries,
    };
  } catch (error) {
    console.error('Error getting timesheet summary:', error);
    return null;
  }
}

/**
 * Get all active sessions (admin view)
 */
export async function getAllActiveSessions(): Promise<TimesheetEntry[]> {
  try {
    const activeSessions = await redis.hgetall(ACTIVE_SESSIONS_KEY);
    return Object.values(activeSessions).map(sessionStr => JSON.parse(sessionStr));
  } catch (error) {
    console.error('Error getting all active sessions:', error);
    return [];
  }
}

/**
 * Delete a timesheet entry (admin only)
 */
export async function deleteTimesheetEntry(entryId: string): Promise<boolean> {
  try {
    const allEntries = await redis.lrange(TIMESHEET_KEY, 0, -1);
    const filteredEntries = allEntries.filter(entryStr => {
      const entry: TimesheetEntry = JSON.parse(entryStr);
      return entry.id !== entryId;
    });

    await redis.del(TIMESHEET_KEY);
    if (filteredEntries.length > 0) {
      await redis.rpush(TIMESHEET_KEY, ...filteredEntries);
    }

    return true;
  } catch (error) {
    console.error('Error deleting timesheet entry:', error);
    return false;
  }
}
