'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, LogIn, LogOut, MapPin, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { TimesheetSummary, TimesheetEntry } from '@/types/users';

export default function TimesheetClient() {
  const [summary, setSummary] = useState<TimesheetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [location, setLocation] = useState<'William Cannon' | 'Cameron Rd'>('William Cannon');
  const [notes, setNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<TimesheetEntry[]>([]);

  useEffect(() => {
    fetchSummary();
    // Update clock every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (summary) {
      filterEntries();
    }
  }, [dateFilter, customStartDate, customEndDate, summary]);

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/admin/timesheet?action=summary');
      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = useCallback(() => {
    if (!summary) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = summary.recentEntries;

    if (dateFilter === 'today') {
      filtered = summary.recentEntries.filter(entry => {
        const entryDate = new Date(entry.clockIn);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      });
    } else if (dateFilter === 'week') {
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(today.getDate() - diff);
      filtered = summary.recentEntries.filter(entry => {
        return new Date(entry.clockIn) >= startOfWeek;
      });
    } else if (dateFilter === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      filtered = summary.recentEntries.filter(entry => {
        return new Date(entry.clockIn) >= startOfMonth;
      });
    } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      filtered = summary.recentEntries.filter(entry => {
        const entryDate = new Date(entry.clockIn);
        return entryDate >= start && entryDate <= end;
      });
    }

    setFilteredEntries(filtered);
  }, [summary, dateFilter, customStartDate, customEndDate]);

  const handleClockIn = async () => {
    setActionLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/timesheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock-in',
          location,
          notes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Successfully clocked in!' });
        setNotes('');
        await fetchSummary();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to clock in' });
      }
    } catch (error) {
      console.error('Error clocking in:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/timesheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock-out',
          notes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `Successfully clocked out! You worked ${data.entry?.hoursWorked?.toFixed(2)} hours.` 
        });
        setNotes('');
        await fetchSummary();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to clock out' });
      }
    } catch (error) {
      console.error('Error clocking out:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const calculateCurrentSessionHours = () => {
    if (!summary?.currentEntry) return 0;
    const clockInTime = new Date(summary.currentEntry.clockIn);
    const now = new Date();
    const hours = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
    return Math.round(hours * 100) / 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-bold uppercase text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const currentSessionHours = calculateCurrentSessionHours();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wide text-gray-900 mb-1 sm:mb-2">My Timesheet</h1>
        <p className="text-xs sm:text-sm text-gray-600">Track your work hours and attendance</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 sm:mb-6 p-3 sm:p-4 border-2 flex items-start sm:items-center gap-2 sm:gap-3 ${
          message.type === 'success' 
            ? 'border-green-600 bg-green-50' 
            : 'border-red-600 bg-red-50'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
          )}
          <p className={`text-xs sm:text-sm font-medium ${
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
        {/* Current Time */}
        <div className="bg-white border-2 border-gray-900 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900">Current Time</h2>
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">{formatTime(currentTime)}</p>
          <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mt-1 sm:mt-2">{currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</p>
        </div>

        {/* Today's Hours */}
        <div className="bg-white border-2 border-gray-900 p-4 sm:p-6">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900 mb-2 sm:mb-4">Today</h2>
          <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">{summary?.totalHoursToday.toFixed(2) || '0.00'}</p>
          <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mt-1 sm:mt-2">Hours Worked</p>
        </div>

        {/* This Week's Hours */}
        <div className="bg-white border-2 border-gray-900 p-4 sm:p-6">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900 mb-2 sm:mb-4">This Week</h2>
          <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">{summary?.totalHoursThisWeek.toFixed(2) || '0.00'}</p>
          <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mt-1 sm:mt-2">Hours Worked</p>
        </div>
      </div>

      {/* Clock In/Out Card */}
      <div className="bg-white border-2 border-gray-900 p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8">
        {summary?.currentlyClockedIn ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg lg:text-xl font-black uppercase tracking-wide text-gray-900 mb-1 sm:mb-2">Currently Clocked In</h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Started at {formatDateTime(summary.currentEntry!.clockIn)}
                  {summary.currentEntry?.location && ` - ${summary.currentEntry.location}`}
                </p>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <p className="text-2xl sm:text-3xl font-black text-green-600">{currentSessionHours.toFixed(2)}</p>
                <p className="text-xs sm:text-sm text-gray-600">Hours</p>
              </div>
            </div>

            {/* Notes Input */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900 mb-1.5 sm:mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your shift..."
                rows={3}
                className="w-full border-2 border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleClockOut}
              disabled={actionLoading}
              className="w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 border-2 border-red-600 bg-red-600 text-xs sm:text-sm font-black uppercase tracking-wide text-white hover:bg-white hover:text-red-600 active:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 animate-spin" />
                  Clocking Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  Clock Out
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-base sm:text-lg lg:text-xl font-black uppercase tracking-wide text-gray-900 mb-4 sm:mb-6">Clock In</h2>

            {/* Location Selection */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900 mb-1.5 sm:mb-2">
                Location
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <button
                  onClick={() => setLocation('William Cannon')}
                  className={`flex items-center justify-center px-2 sm:px-4 py-2.5 sm:py-3 border-2 text-[10px] sm:text-xs lg:text-sm font-black uppercase tracking-wide transition-colors ${
                    location === 'William Cannon'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white text-gray-900 hover:border-gray-900 active:bg-gray-50'
                  }`}
                >
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="truncate">William Cannon</span>
                </button>
                <button
                  onClick={() => setLocation('Cameron Rd')}
                  className={`flex items-center justify-center px-2 sm:px-4 py-2.5 sm:py-3 border-2 text-[10px] sm:text-xs lg:text-sm font-black uppercase tracking-wide transition-colors ${
                    location === 'Cameron Rd'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white text-gray-900 hover:border-gray-900 active:bg-gray-50'
                  }`}
                >
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="truncate">Cameron Rd</span>
                </button>
              </div>
            </div>

            {/* Notes Input */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900 mb-1.5 sm:mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your shift..."
                rows={3}
                className="w-full border-2 border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleClockIn}
              disabled={actionLoading}
              className="w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 border-2 border-green-600 bg-green-600 text-xs sm:text-sm font-black uppercase tracking-wide text-white hover:bg-white hover:text-green-600 active:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 animate-spin" />
                  Clocking In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  Clock In
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Time Period Selector */}
      <div className="bg-white border-2 border-gray-900 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-gray-900 mb-3 sm:mb-4">View History</h2>
        
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 sm:px-4 py-2 border-2 text-[10px] sm:text-xs lg:text-sm font-black uppercase tracking-wide transition-colors active:scale-95 ${
              dateFilter === 'today'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-900 hover:border-gray-900 active:bg-gray-50'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-3 sm:px-4 py-2 border-2 text-[10px] sm:text-xs lg:text-sm font-black uppercase tracking-wide transition-colors active:scale-95 ${
              dateFilter === 'week'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-900 hover:border-gray-900 active:bg-gray-50'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 sm:px-4 py-2 border-2 text-[10px] sm:text-xs lg:text-sm font-black uppercase tracking-wide transition-colors active:scale-95 ${
              dateFilter === 'month'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-900 hover:border-gray-900 active:bg-gray-50'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateFilter('custom')}
            className={`px-3 sm:px-4 py-2 border-2 text-[10px] sm:text-xs lg:text-sm font-black uppercase tracking-wide transition-colors active:scale-95 ${
              dateFilter === 'custom'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-900 hover:border-gray-900 active:bg-gray-50'
            }`}
          >
            Custom
          </button>
        </div>

        {dateFilter === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-wide text-gray-900 mb-1.5 sm:mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full border-2 border-gray-300 px-3 sm:px-4 py-2 text-sm font-medium text-gray-900 focus:border-gray-900 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-wide text-gray-900 mb-1.5 sm:mb-2">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full border-2 border-gray-300 px-3 sm:px-4 py-2 text-sm font-medium text-gray-900 focus:border-gray-900 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Timesheet History */}
      <div className="bg-white border-2 border-gray-900">
        <div className="p-4 sm:p-6 border-b-2 border-gray-900">
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-gray-900">Timesheet History</h2>
        </div>
        
        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-900 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-900">Clock In</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-900">Clock Out</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-900">Hours</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-900">Location</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-900">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry, index) => (
                  <tr key={entry.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatDate(entry.clockIn)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(entry.clockIn).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {entry.clockOut ? (
                        new Date(entry.clockOut).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                      ) : (
                        <span className="text-green-600 font-bold">In Progress</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {entry.hoursWorked ? entry.hoursWorked.toFixed(2) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {entry.location || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {entry.notes || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No timesheet entries found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View - Shown only on mobile/tablet */}
        <div className="lg:hidden divide-y divide-gray-200">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{formatDate(entry.clockIn)}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{entry.location || 'No location'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-bold ${
                      entry.clockOut 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {entry.hoursWorked ? `${entry.hoursWorked.toFixed(2)} hrs` : 'In Progress'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <LogIn className="w-3 h-3 text-green-600" />
                    <span>
                      {new Date(entry.clockIn).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>
                  {entry.clockOut && (
                    <div className="flex items-center gap-1">
                      <LogOut className="w-3 h-3 text-red-600" />
                      <span>
                        {new Date(entry.clockOut).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </span>
                    </div>
                  )}
                </div>
                {entry.notes && (
                  <p className="mt-2 text-xs text-gray-500 italic line-clamp-2">{entry.notes}</p>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 sm:p-12 text-center text-xs sm:text-sm text-gray-500">
              No timesheet entries found for the selected period.
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {filteredEntries.length > 0 && (
          <div className="p-4 sm:p-6 border-t-2 border-gray-900 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900">Total Hours:</span>
              <span className="text-xl sm:text-2xl font-black text-gray-900">
                {filteredEntries
                  .reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
