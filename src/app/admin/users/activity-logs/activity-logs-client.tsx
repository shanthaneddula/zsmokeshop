'use client';

import { useState, useEffect } from 'react';
import { ActivityLog } from '@/types/users';
import { Activity, RefreshCw, Filter, User, Package, FolderOpen, Image as ImageIcon, Settings, ShoppingBag, Users } from 'lucide-react';
import Link from 'next/link';

export function ActivityLogsClient() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedUser !== 'all') params.append('userId', selectedUser);
      
      const response = await fetch(`/api/admin/activity-logs?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = selectedResource === 'all' 
    ? logs 
    : logs.filter(log => log.resource === selectedResource);

  const getResourceIcon = (resource: ActivityLog['resource']) => {
    switch (resource) {
      case 'product': return <Package className="w-4 h-4" />;
      case 'category': return <FolderOpen className="w-4 h-4" />;
      case 'order': return <ShoppingBag className="w-4 h-4" />;
      case 'store-photo': return <ImageIcon className="w-4 h-4" />;
      case 'setting': return <Settings className="w-4 h-4" />;
      case 'user': return <Users className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('ADD')) return 'text-green-700 bg-green-50 border-green-200';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'text-red-700 bg-red-50 border-red-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const uniqueUsers = Array.from(new Set(logs.map(log => log.username)));

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/admin/users"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Users
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-bold">Activity Logs</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-wide text-gray-900">
              Activity Logs
            </h1>
            <p className="text-gray-600 mt-2">
              View all user actions and changes
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white uppercase font-bold tracking-wide text-sm hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border-2 border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-bold uppercase text-gray-700">Filters:</span>
            </div>

            {/* User Filter */}
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-black focus:border-black text-sm font-medium"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map((username) => (
                <option key={username} value={username}>
                  {username}
                </option>
              ))}
            </select>

            {/* Resource Filter */}
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-black focus:border-black text-sm font-medium"
            >
              <option value="all">All Resources</option>
              <option value="product">Products</option>
              <option value="category">Categories</option>
              <option value="order">Orders</option>
              <option value="store-photo">Store Photos</option>
              <option value="setting">Settings</option>
              <option value="user">Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white border-2 border-gray-200 p-12 text-center">
          <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-black uppercase tracking-wide text-gray-900 mb-2">
            No Activity Logs
          </h3>
          <p className="text-gray-600">
            Activity logs will appear here as users make changes
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white border-2 border-gray-200 p-4 hover:border-black transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(log.resource)}
                      <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
                        {log.resource}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold uppercase border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <div className="flex items-center gap-1 text-gray-600">
                      <User className="w-3 h-3" />
                      <span className="text-xs font-medium">{log.username}</span>
                    </div>
                  </div>

                  <p className="text-gray-900 font-medium mb-2">{log.details}</p>

                  {log.changes && Object.keys(log.changes).length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 text-xs">
                      <p className="font-bold uppercase text-gray-700 mb-2">Changes:</p>
                      <div className="space-y-1">
                        {Object.entries(log.changes).map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2">
                            <span className="font-medium text-gray-700">{key}:</span>
                            <span className="text-gray-600">
                              <span className="line-through">{String(value.old)}</span>
                              {' → '}
                              <span className="font-medium">{String(value.new)}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  <p className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                  {log.ipAddress && (
                    <p className="text-xs text-gray-400 mt-1">
                      {log.ipAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
