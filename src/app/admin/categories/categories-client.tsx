'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { AdminCategory } from '@/types/admin';
import { CategoryPreviewModal } from '../components/CategoryPreviewModal';

export function CategoriesClient() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [previewCategory, setPreviewCategory] = useState<AdminCategory | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map(c => c.id));
    }
  };

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    if (selectedCategories.length === 0) return;

    setBulkActionLoading(true);
    try {
      const updatePromises = selectedCategories.map(categoryId =>
        fetch(`/api/admin/categories/${categoryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        })
      );
      
      await Promise.all(updatePromises);
      setSelectedCategories([]);
      fetchCategories();
    } catch (error) {
      console.error('Error updating categories:', error);
      alert('Error updating categories. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    let confirmMessage = `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`;
    
    if (category.productCount > 0) {
      confirmMessage += `\n\nThis category has ${category.productCount} product(s). These products will be moved to "Uncategorized".`;
    }

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Category deleted successfully!');
        fetchCategories();
      } else {
        const errorData = await response.json();
        alert(`Error deleting category: ${errorData.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;
    
    const selectedCats = categories.filter(c => selectedCategories.includes(c.id));
    const totalProducts = selectedCats.reduce((sum, cat) => sum + cat.productCount, 0);
    
    let confirmMessage = `Are you sure you want to delete ${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'}?`;
    
    if (totalProducts > 0) {
      confirmMessage += `\n\nThis will affect ${totalProducts} product(s), which will be moved to "Uncategorized".`;
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const deletePromises = selectedCategories.map(categoryId =>
        fetch(`/api/admin/categories/${categoryId}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      setSelectedCategories([]);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting categories:', error);
      alert('Error deleting categories. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide border ${statusColors[status as keyof typeof statusColors] || statusColors.active}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-full overflow-hidden">
      <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your product categories
          </p>
        </div>
        <Link
          href="/admin/categories/add"
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white font-bold uppercase tracking-wide text-xs sm:text-sm hover:bg-gray-800 dark:hover:bg-gray-100 active:bg-gray-700 transition-colors flex-shrink-0"
        >
          Add Category
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 rounded text-sm sm:text-base"
              />
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'} found
            </div>
          </div>

          {/* Bulk Actions - Hidden on mobile, shown in list header instead */}
          {selectedCategories.length > 0 && (
            <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs sm:text-sm font-bold">
                {selectedCategories.length} selected
              </span>
              <button
                onClick={() => handleBulkStatusChange('active')}
                disabled={bulkActionLoading}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wide border border-green-600 text-green-600 hover:bg-green-50 active:bg-green-100 disabled:opacity-50 rounded"
              >
                Set Active
              </button>
              <button
                onClick={() => handleBulkStatusChange('inactive')}
                disabled={bulkActionLoading}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wide border border-red-600 text-red-600 hover:bg-red-50 active:bg-red-100 disabled:opacity-50 rounded"
              >
                Set Inactive
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wide border border-red-600 text-red-600 hover:bg-red-50 active:bg-red-100 disabled:opacity-50 rounded"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-12 text-center">
            <div className="text-gray-600 dark:text-gray-400">Loading categories...</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No categories found matching your search.' : 'No categories found.'}
          </div>
        ) : (
          <>
            {/* Mobile Bulk Actions Header */}
            {selectedCategories.length > 0 && (
              <div className="lg:hidden bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {selectedCategories.length} selected
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkStatusChange('active')}
                      disabled={bulkActionLoading}
                      className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('inactive')}
                      disabled={bulkActionLoading}
                      className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Deactivate
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={bulkActionLoading}
                      className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Table Header */}
            <div className="hidden lg:block border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-gray-300">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div className="col-span-2">Image</div>
                <div className="col-span-3">Category</div>
                <div className="col-span-2">Slug</div>
                <div className="col-span-1">Products</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Order</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* Categories List */}
            <div>
              {filteredCategories
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((category) => (
                <div key={category.id}>
                  {/* Desktop Row */}
                  <div
                    className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleSelectCategory(category.id)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <div className="w-16 h-16 relative border border-gray-200 dark:border-gray-700 rounded">
                          <OptimizedImage
                            src={category.image || '/images/placeholder.jpg'}
                            alt={category.name}
                            context="admin-thumb"
                            className="object-cover rounded"
                          />
                      </div>
                    </div>
                    
                    <div className="col-span-3">
                      <div className="font-medium text-gray-900 dark:text-white">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {category.description}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-2 flex items-center">
                      <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                        {category.slug}
                      </code>
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.productCount}
                      </span>
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      {getStatusBadge(category.status)}
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {category.sortOrder}
                      </span>
                    </div>
                    
                    <div className="col-span-1">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => setPreviewCategory(category)}
                          className="text-xs font-medium text-left text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                        <Link
                          href={`/admin/categories/edit/${category.id}`}
                          className="text-xs font-medium text-left text-gray-600 hover:text-gray-800"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={(e) => handleDeleteCategory(category.id, category.name, e)}
                          className="text-xs font-medium text-left text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Card */}
                  <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="space-y-3">
                      {/* Header with checkbox, name and status */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => handleSelectCategory(category.id)}
                            className="rounded border-gray-300 dark:border-gray-600 mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </div>
                            {category.description && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {getStatusBadge(category.status)}
                        </div>
                      </div>

                      {/* Content with image and info grid */}
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 relative border border-gray-200 dark:border-gray-700 rounded flex-shrink-0">
                          <OptimizedImage
                            src={category.image || '/images/placeholder.jpg'}
                            alt={category.name}
                            context="admin-thumb"
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Products:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                              {category.productCount}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Order:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                              {category.sortOrder}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600 dark:text-gray-400">Slug:</span>
                            <code className="ml-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-700 dark:text-gray-300">
                              {category.slug}
                            </code>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => setPreviewCategory(category)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            View
                          </button>
                          <Link
                            href={`/admin/categories/edit/${category.id}`}
                            className="text-sm font-medium text-gray-600 hover:text-gray-800"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={(e) => handleDeleteCategory(category.id, category.name, e)}
                            className="text-sm font-medium text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Category Preview Modal */}
      {previewCategory && (
        <CategoryPreviewModal
          category={previewCategory}
          onClose={() => setPreviewCategory(null)}
        />
      )}
      </div>
    </div>
  );
}
