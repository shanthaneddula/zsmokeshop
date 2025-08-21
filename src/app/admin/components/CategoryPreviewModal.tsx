'use client';

import { useEffect } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { AdminCategory } from '@/types/admin';

interface CategoryPreviewModalProps {
  category: AdminCategory;
  onClose: () => void;
}

export function CategoryPreviewModal({ category, onClose }: CategoryPreviewModalProps) {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'inactive':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-white max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-900 dark:border-white px-6 py-4">
          <h2 className="text-xl font-black uppercase tracking-wide">
            Category Preview
          </h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:text-gray-600 dark:hover:text-gray-400"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Category Image and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div>
              <div className="aspect-square relative border border-gray-900 dark:border-white">
                <OptimizedImage
                  src={category.image || '/images/placeholder.jpg'}
                  alt={category.name}
                  context="preview"
                  priority
                  className="object-cover"
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-wide">
                  {category.name}
                </h3>
                <div className="mt-2">
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    /{category.slug}
                  </code>
                </div>
              </div>

              {/* Status and Product Count */}
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wide border ${getStatusColor(category.status)}`}>
                  {category.status}
                </span>
                <span className="text-sm font-bold">
                  {category.productCount} product{category.productCount !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Sort Order */}
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Sort Order: </span>
                <span className="text-sm font-bold">{category.sortOrder}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {category.description && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-2">Description</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {category.description}
              </p>
            </div>
          )}

          {/* SEO Information */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-4">SEO Information</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                    SEO Title
                  </h5>
                  <p className="text-sm">
                    {category.seoTitle || category.name}
                  </p>
                </div>
                
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                    SEO Description
                  </h5>
                  <p className="text-sm">
                    {category.seoDescription || `Shop ${category.name} products at Z Smoke Shop`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-2">System Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created:</span>
                  <span>{new Date(category.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                  <span>{new Date(category.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-2">Usage Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Products:</span>
                  <span className="font-bold">{category.productCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-bold ${category.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {category.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* URL Preview */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide mb-2">URL Preview</h4>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded border">
              <p className="text-sm font-mono">
                https://zsmokeshop.com/shop?category={category.slug}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-900 dark:border-white px-6 py-4 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-900 dark:border-white bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold uppercase tracking-wide hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
          <a
            href={`/admin/categories/edit/${category.id}`}
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Edit Category
          </a>
        </div>
      </div>
    </div>
  );
}
