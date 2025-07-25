'use client';

import { useState, useEffect } from 'react';
import { AdminCategory } from '@/types/admin';
import ProductImageUpload from './ProductImageUpload';

interface CategoryFormProps {
  category?: AdminCategory;
  onSubmit: (categoryData: Partial<AdminCategory>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

export function CategoryForm({ category, onSubmit, onCancel, isLoading = false }: CategoryFormProps) {
  const [formData, setFormData] = useState<Partial<AdminCategory>>({
    name: '',
    slug: '',
    description: '',
    image: '',
    status: 'active',
    sortOrder: 0,
    seoTitle: '',
    seoDescription: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUploading, setImageUploading] = useState(false);

  // Populate form with existing category data
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: category.image || '',
        status: category.status || 'active',
        sortOrder: category.sortOrder || 0,
        seoTitle: category.seoTitle || '',
        seoDescription: category.seoDescription || ''
      });
    }
  }, [category]);

  // Auto-generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.slug?.trim()) {
      newErrors.slug = 'Category slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (formData.sortOrder !== undefined && formData.sortOrder < 0) {
      newErrors.sortOrder = 'Sort order must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (field: keyof AdminCategory, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generate slug when name changes (only for new categories)
    if (field === 'name' && !category && typeof value === 'string') {
      const newSlug = generateSlug(value);
      setFormData(prev => ({
        ...prev,
        slug: newSlug
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'categories');
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        handleInputChange('image', data.data.url);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors(prev => ({
        ...prev,
        image: 'Failed to upload image'
      }));
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h2 className="text-xl font-black uppercase tracking-wide">
          {category ? 'Edit Category' : 'Add New Category'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              } bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400`}
              placeholder="Enter category name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug || ''}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.slug ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              } bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400`}
              placeholder="category-slug"
            />
            {errors.slug && (
              <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              URL-friendly version of the name (lowercase, hyphens only)
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 resize-none"
            placeholder="Enter category description"
          />
        </div>

        {/* Category Image */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-2">
            Category Image
          </label>
          <ProductImageUpload
            currentImage={formData.image}
            onImageUpload={handleImageUpload}
            isUploading={imageUploading}
          />
          {errors.image && (
            <p className="text-red-500 text-xs mt-1">{errors.image}</p>
          )}
        </div>

        {/* Status and Sort Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">
              Status
            </label>
            <select
              value={formData.status || 'active'}
              onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">
              Sort Order
            </label>
            <input
              type="number"
              min="0"
              value={formData.sortOrder || 0}
              onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
              className={`w-full px-4 py-3 border ${
                errors.sortOrder ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              } bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400`}
              placeholder="0"
            />
            {errors.sortOrder && (
              <p className="text-red-500 text-xs mt-1">{errors.sortOrder}</p>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Lower numbers appear first in listings
            </p>
          </div>
        </div>

        {/* SEO Fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-black uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-2">
            SEO Settings
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {/* SEO Title */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                SEO Title
              </label>
              <input
                type="text"
                value={formData.seoTitle || ''}
                onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                placeholder="Enter SEO title (leave blank to use category name)"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Recommended: 50-60 characters
              </p>
            </div>

            {/* SEO Description */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                SEO Description
              </label>
              <textarea
                value={formData.seoDescription || ''}
                onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 resize-none"
                placeholder="Enter SEO description"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Recommended: 150-160 characters
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold uppercase tracking-wide hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || imageUploading}
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
