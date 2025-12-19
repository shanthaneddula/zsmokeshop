'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  FolderOpen, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Edit,
  ChevronRight
} from 'lucide-react';
import { DashboardStats } from '@/types/admin';

export default function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to load dashboard data');
      }
    } catch {
      setError('Network error loading dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 sm:space-y-6">
        <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 sm:w-1/3"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 sm:h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-600 bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 flex items-center space-x-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <p className="text-sm font-medium text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Overview of your Z Smoke Shop inventory
        </p>
      </div>

      {/* Stats Cards - 2x2 grid on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400 truncate">
                Products
              </p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                {stats?.totalProducts || 0}
              </p>
            </div>
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 flex-shrink-0 ml-2" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400 truncate">
                Categories
              </p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                {stats?.totalCategories || 0}
              </p>
            </div>
            <FolderOpen className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 flex-shrink-0 ml-2" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400 truncate">
                Active
              </p>
              <p className="text-2xl sm:text-3xl font-black text-green-600 mt-1">
                {stats?.activeProducts || 0}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 flex-shrink-0 ml-2" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400 truncate">
                Out of Stock
              </p>
              <p className="text-2xl sm:text-3xl font-black text-red-600 mt-1">
                {stats?.outOfStockProducts || 0}
              </p>
            </div>
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 flex-shrink-0 ml-2" />
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Products - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white mb-3 sm:mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2 sm:space-y-3">
            <Link
              href="/admin/products/add"
              className="flex items-center justify-between p-3 sm:p-4 border border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white transition-colors group active:bg-gray-100 dark:active:bg-gray-700"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">Add New Product</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </Link>
            
            <Link
              href="/admin/categories/add"
              className="flex items-center justify-between p-3 sm:p-4 border border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white transition-colors group active:bg-gray-100 dark:active:bg-gray-700"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">Add New Category</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </Link>
            
            <Link
              href="/admin/categories"
              className="flex items-center justify-between p-3 sm:p-4 border border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white transition-colors group active:bg-gray-100 dark:active:bg-gray-700"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <FolderOpen className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">Manage Categories</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </Link>
            
            <Link
              href="/admin/products"
              className="flex items-center justify-between p-3 sm:p-4 border border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white transition-colors group active:bg-gray-100 dark:active:bg-gray-700"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Package className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">Manage Products</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </Link>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white mb-3 sm:mb-4">
            Recently Added
          </h2>
          {stats?.recentlyAdded && stats.recentlyAdded.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {stats.recentlyAdded.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 sm:p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/products/edit/${product.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No products added yet. <Link href="/admin/products/add" className="text-gray-900 dark:text-white underline">Add your first product</Link>
            </p>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white mb-3 sm:mb-4">
          System Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center space-x-3 p-2 sm:p-0">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              File System: Operational
            </span>
          </div>
          <div className="flex items-center space-x-3 p-2 sm:p-0">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              Image Storage: Ready
            </span>
          </div>
          <div className="flex items-center space-x-3 p-2 sm:p-0">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              Backup System: Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
