'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { AdminProduct } from '@/types/admin';

interface ProductPreviewModalProps {
  product: AdminProduct;
  onClose: () => void;
}

export function ProductPreviewModal({ product, onClose }: ProductPreviewModalProps) {
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
      case 'draft':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
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
            Product Preview
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
          {/* Product Image and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div>
              <div className="aspect-square relative border border-gray-900 dark:border-white">
                <Image
                  src={product.image || '/images/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-wide">
                  {product.name}
                </h3>
                {product.brand && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    by {product.brand}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                {product.salePrice ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black text-red-600">
                      ${product.salePrice}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ${product.price}
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wide">
                      Sale
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-black">
                    ${product.price}
                  </span>
                )}
              </div>

              {/* Status and Stock */}
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wide border ${getStatusColor(product.status)}`}>
                  {product.status}
                </span>
                <span className={`text-sm font-bold ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* Badges */}
              {product.badges && product.badges.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wide mb-2">Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.badges.map(badge => (
                      <span
                        key={badge}
                        className="px-2 py-1 text-xs font-bold uppercase tracking-wide bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-2">Description</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wide mb-2">Product Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">SKU:</span>
                    <span>{product.sku || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <span>{product.category}</span>
                  </div>
                  {product.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                      <span>{product.weight} oz</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dimensions */}
              {product.dimensions && (
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wide mb-2">Dimensions</h4>
                  <div className="text-sm">
                    {product.dimensions.length}&quot; × {product.dimensions.width}&quot; × {product.dimensions.height}&quot;
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wide mb-2">System Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                    <span>{new Date(product.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {product.createdBy && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Created by:</span>
                      <span>{product.createdBy}</span>
                    </div>
                  )}
                  {product.updatedBy && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Updated by:</span>
                      <span>{product.updatedBy}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Image History */}
              {product.imageHistory && product.imageHistory.length > 1 && (
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wide mb-2">Image History</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {product.imageHistory.length} image{product.imageHistory.length !== 1 ? 's' : ''} uploaded
                  </div>
                </div>
              )}
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
            href={`/admin/products/edit/${product.id}`}
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Edit Product
          </a>
        </div>
      </div>
    </div>
  );
}
