'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  ShoppingBag, 
  TrendingUp, 
  Calendar,
  Award,
  Activity,
  LogIn,
  LogOut,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { User, TimesheetSummary } from '@/types/users';
import { PickupOrder } from '@/types/orders';

interface DashboardStats {
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  averageOrderValue: number;
  recentOrders: PickupOrder[];
}

export default function EmployeeDashboardClient() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [timesheet, setTimesheet] = useState<TimesheetSummary | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockAction, setClockAction] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
    // Update clock every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user info
      const userResponse = await fetch('/api/admin/auth/me');
      const userData = await userResponse.json();
      if (userData.success) {
        setCurrentUser(userData.user);
      }

      // Fetch timesheet summary
      const timesheetResponse = await fetch('/api/admin/timesheet?action=summary');
      const timesheetData = await timesheetResponse.json();
      if (timesheetData.success) {
        setTimesheet(timesheetData.summary);
      }

      // Fetch order stats (for orders-manager)
      if (userData.user?.permissions?.viewOrders) {
        const ordersResponse = await fetch('/api/orders?stats=true');
        const ordersData = await ordersResponse.json();
        
        const recentOrdersResponse = await fetch('/api/orders?limit=5');
        const recentOrdersData = await recentOrdersResponse.json();

        if (ordersData.success && recentOrdersData.success) {
          // Calculate stats
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const startOfWeek = new Date(today);
          const dayOfWeek = today.getDay();
          const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          startOfWeek.setDate(today.getDate() - diff);
          
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

          const allOrders: PickupOrder[] = recentOrdersData.orders || [];
          
          const ordersToday = allOrders.filter(order => 
            new Date(order.timeline.placedAt) >= today
          ).length;
          
          const ordersThisWeek = allOrders.filter(order => 
            new Date(order.timeline.placedAt) >= startOfWeek
          ).length;
          
          const ordersThisMonth = allOrders.filter(order => 
            new Date(order.timeline.placedAt) >= startOfMonth
          ).length;

          const totalValue = allOrders.reduce((sum, order) => sum + order.total, 0);
          const averageOrderValue = allOrders.length > 0 ? totalValue / allOrders.length : 0;

          setStats({
            ordersToday,
            ordersThisWeek,
            ordersThisMonth,
            averageOrderValue,
            recentOrders: allOrders.slice(0, 5),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickClock = async () => {
    setClockAction(true);
    setMessage(null);

    try {
      const action = timesheet?.currentlyClockedIn ? 'clock-out' : 'clock-in';
      const response = await fetch('/api/admin/timesheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          location: 'William Cannon', // Default location for quick action
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (action === 'clock-in') {
          setMessage({ type: 'success', text: 'Successfully clocked in!' });
        } else {
          setMessage({ 
            type: 'success', 
            text: `Successfully clocked out! You worked ${data.entry?.hoursWorked?.toFixed(2)} hours.` 
          });
        }
        await fetchData();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to perform clock action' });
      }
    } catch (error) {
      console.error('Error with clock action:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setClockAction(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string }> = {
      pending: { text: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-600' },
      processing: { text: 'Processing', className: 'bg-blue-100 text-blue-800 border-blue-600' },
      ready: { text: 'Ready', className: 'bg-green-100 text-green-800 border-green-600' },
      completed: { text: 'Completed', className: 'bg-gray-100 text-gray-800 border-gray-600' },
      cancelled: { text: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-600' },
    };
    
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 text-xs font-black uppercase tracking-wide border ${badge.className}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm font-bold uppercase text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isOrdersManager = currentUser?.permissions?.viewOrders;
  const isInventoryManager = currentUser?.permissions?.viewProducts;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-wide text-gray-900 mb-2">
          {getGreeting()}, {currentUser?.username}
        </h1>
        <p className="text-sm text-gray-600">
          {currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })} • {formatTime(currentTime)}
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 border-2 flex items-center space-x-3 ${
          message.type === 'success' 
            ? 'border-green-600 bg-green-50' 
            : 'border-red-600 bg-red-50'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <p className={`text-sm font-medium ${
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Quick Actions & Time Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Clock In/Out */}
        <div className="bg-white border-2 border-gray-900 p-6">
          <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Time Clock
          </h2>
          
          {timesheet?.currentlyClockedIn ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Currently Clocked In</p>
                  <p className="text-2xl font-black text-green-600">
                    {(() => {
                      const clockInTime = new Date(timesheet.currentEntry!.clockIn);
                      const now = new Date();
                      const hours = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
                      return (Math.round(hours * 100) / 100).toFixed(2);
                    })()}
                  </p>
                  <p className="text-xs text-gray-500">Hours</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Started</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(timesheet.currentEntry!.clockIn).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleQuickClock}
                disabled={clockAction}
                className="w-full flex items-center justify-center px-6 py-3 border-2 border-red-600 bg-red-600 text-sm font-black uppercase tracking-wide text-white hover:bg-white hover:text-red-600 transition-colors disabled:opacity-50"
              >
                {clockAction ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Clocking Out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Clock Out
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-2">Not Currently Clocked In</p>
                <p className="text-xs text-gray-500">Click below to start your shift</p>
              </div>
              
              <button
                onClick={handleQuickClock}
                disabled={clockAction}
                className="w-full flex items-center justify-center px-6 py-3 border-2 border-green-600 bg-green-600 text-sm font-black uppercase tracking-wide text-white hover:bg-white hover:text-green-600 transition-colors disabled:opacity-50"
              >
                {clockAction ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Clocking In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Clock In
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Work Hours Summary */}
        <div className="bg-white border-2 border-gray-900 p-6">
          <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Hours Summary
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900">{timesheet?.totalHoursToday.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">Today</p>
            </div>
            <div className="text-center border-l-2 border-r-2 border-gray-200">
              <p className="text-2xl font-black text-gray-900">{timesheet?.totalHoursThisWeek.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">This Week</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900">{timesheet?.totalHoursThisMonth.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Stats (for orders-manager) */}
      {isOrdersManager && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today's Orders */}
            <div className="bg-white border-2 border-gray-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-gray-900">Today</h3>
                <ShoppingBag className="w-5 h-5 text-gray-900" />
              </div>
              <p className="text-3xl font-black text-gray-900">{stats.ordersToday}</p>
              <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">Orders</p>
            </div>

            {/* This Week's Orders */}
            <div className="bg-white border-2 border-gray-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-gray-900">This Week</h3>
                <TrendingUp className="w-5 h-5 text-gray-900" />
              </div>
              <p className="text-3xl font-black text-gray-900">{stats.ordersThisWeek}</p>
              <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">Orders</p>
            </div>

            {/* This Month's Orders */}
            <div className="bg-white border-2 border-gray-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-gray-900">This Month</h3>
                <Calendar className="w-5 h-5 text-gray-900" />
              </div>
              <p className="text-3xl font-black text-gray-900">{stats.ordersThisMonth}</p>
              <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">Orders</p>
            </div>

            {/* Average Order Value */}
            <div className="bg-white border-2 border-gray-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-gray-900">Avg Value</h3>
                <Award className="w-5 h-5 text-gray-900" />
              </div>
              <p className="text-3xl font-black text-gray-900">{formatCurrency(stats.averageOrderValue)}</p>
              <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">Per Order</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white border-2 border-gray-900 mb-8">
            <div className="p-6 border-b-2 border-gray-900">
              <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Orders
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-900 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-900">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-900">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-900">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-900">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-900">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order, index) => (
                      <tr key={order.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          #{order.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.timeline.placedAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                        No recent orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white border-2 border-gray-900 p-6">
          <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {timesheet?.recentEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-0">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(entry.clockIn).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-600">
                    {entry.location || 'No location'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">
                    {entry.hoursWorked ? `${entry.hoursWorked.toFixed(2)}h` : 'In Progress'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(entry.clockIn).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white border-2 border-gray-900 p-6">
          <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 mb-4">Quick Links</h2>
          <div className="space-y-3">
            {isOrdersManager && (
              <Link
                href="/admin/orders"
                className="block px-4 py-3 border-2 border-gray-900 bg-white text-sm font-black uppercase tracking-wide text-gray-900 hover:bg-gray-900 hover:text-white transition-colors text-center"
              >
                View All Orders
              </Link>
            )}
            {isInventoryManager && (
              <Link
                href="/admin/products"
                className="block px-4 py-3 border-2 border-gray-900 bg-white text-sm font-black uppercase tracking-wide text-gray-900 hover:bg-gray-900 hover:text-white transition-colors text-center"
              >
                Manage Products
              </Link>
            )}
            <Link
              href="/admin/timesheet"
              className="block px-4 py-3 border-2 border-gray-900 bg-white text-sm font-black uppercase tracking-wide text-gray-900 hover:bg-gray-900 hover:text-white transition-colors text-center"
            >
              View Full Timesheet
            </Link>
            <Link
              href="/admin/profile"
              className="block px-4 py-3 border-2 border-gray-900 bg-white text-sm font-black uppercase tracking-wide text-gray-900 hover:bg-gray-900 hover:text-white transition-colors text-center"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
