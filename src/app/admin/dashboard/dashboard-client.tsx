'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  FolderOpen, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Edit
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
      <div className="p-6 sm:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <div className="border border-red-600 bg-red-50 dark:bg-red-900/20 p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of your Z Smoke Shop inventory and operations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Total Products
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {stats?.totalProducts || 0}
              </p>
            </div>
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Categories
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {stats?.totalCategories || 0}
              </p>
            </div>
            <FolderOpen className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Active Products
              </p>
              <p className="text-3xl font-black text-green-600">
                {stats?.activeProducts || 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Out of Stock
              </p>
              <p className="text-3xl font-black text-red-600">
                {stats?.outOfStockProducts || 0}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/admin/products/add"
              className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="font-medium text-gray-900 dark:text-white">Add New Product</span>
              </div>
            </Link>
            
            <Link
              href="/admin/categories/add"
              className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="font-medium text-gray-900 dark:text-white">Add New Category</span>
              </div>
            </Link>
            
            <Link
              href="/admin/categories"
              className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <FolderOpen className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="font-medium text-gray-900 dark:text-white">Manage Categories</span>
              </div>
            </Link>
            
            <Link
              href="/admin/products"
              className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="font-medium text-gray-900 dark:text-white">Manage Products</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white mb-4">
            Recently Added
          </h2>
          {stats?.recentlyAdded && stats.recentlyAdded.length > 0 ? (
            <div className="space-y-3">
              {stats.recentlyAdded.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
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
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white mb-4">
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              File System: Operational
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Image Storage: Ready
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Backup System: Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
