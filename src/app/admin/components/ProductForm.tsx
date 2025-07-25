'use client';

import { useState, useEffect } from 'react';
import { AdminProduct, AdminCategory } from '@/types/admin';
import ProductImageUpload from './ProductImageUpload';

interface ProductFormProps {
  product?: AdminProduct;
  onSubmit: (productData: Partial<AdminProduct>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const BADGE_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'sale', label: 'Sale' },
  { value: 'best-seller', label: 'Best Seller' },
  { value: 'featured', label: 'Featured' },
  { value: 'limited', label: 'Limited Edition' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' }
];

export function ProductForm({ product, onSubmit, onCancel, isLoading = false }: ProductFormProps) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [formData, setFormData] = useState<Partial<AdminProduct>>({
    name: '',
    category: '',
    price: 0,
    salePrice: undefined,
    image: '',
    description: '',
    brand: '',
    inStock: true,
    badges: [],
    sku: '',
    status: 'active',
    weight: undefined,
    dimensions: undefined
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUploading, setImageUploading] = useState(false);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Populate form with existing product data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        price: product.price || 0,
        salePrice: product.salePrice,
        image: product.image || '',
        description: product.description || '',
        brand: product.brand || '',
        inStock: product.inStock ?? true,
        badges: product.badges || [],
        sku: product.sku || '',
        status: product.status || 'active',
        weight: product.weight,
        dimensions: product.dimensions
      });
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (formData.salePrice && formData.salePrice >= (formData.price || 0)) {
      newErrors.salePrice = 'Sale price must be less than regular price';
    }

    if (!formData.image?.trim()) {
      newErrors.image = 'Product image is required';
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

  const handleInputChange = (field: keyof AdminProduct, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleBadgeToggle = (badgeValue: string) => {
    const currentBadges = formData.badges || [];
    const newBadges = currentBadges.includes(badgeValue)
      ? currentBadges.filter(b => b !== badgeValue)
      : [...currentBadges, badgeValue];
    
    handleInputChange('badges', newBadges);
  };

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
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
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              } bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400`}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">
              Category *
            </label>
            <select
              value={formData.category || ''}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.category ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              } bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400`}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">
              Brand
            </label>
            <input
              type="text"
              value={formData.brand || ''}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
              placeholder="Enter brand name"
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">
              SKU
            </label>
            <input
              type="text"
              value={formData.sku || ''}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
              placeholder="Enter SKU"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price || ''}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              className={`w-full px-4 py-3 border ${
                errors.price ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              } bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400`}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price}</p>
            )}
          </div>

          {/* Sale Price */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">
              Sale Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.salePrice || ''}
              onChange={(e) => handleInputChange('salePrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              className={`w-full px-4 py-3 border ${
                errors.salePrice ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              } bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400`}
              placeholder="0.00"
            />
            {errors.salePrice && (
              <p className="text-red-500 text-xs mt-1">{errors.salePrice}</p>
            )}
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
            placeholder="Enter product description"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-2">
            Product Image *
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

        {/* Status and Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">
              Status
            </label>
            <select
              value={formData.status || 'active'}
              onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive' | 'draft')}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* In Stock */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">
              Stock Status
            </label>
            <div className="flex items-center space-x-4 pt-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="inStock"
                  checked={formData.inStock === true}
                  onChange={() => handleInputChange('inStock', true)}
                  className="mr-2"
                />
                In Stock
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="inStock"
                  checked={formData.inStock === false}
                  onChange={() => handleInputChange('inStock', false)}
                  className="mr-2"
                />
                Out of Stock
              </label>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-2">
            Badges
          </label>
          <div className="flex flex-wrap gap-2">
            {BADGE_OPTIONS.map(badge => (
              <button
                key={badge.value}
                type="button"
                onClick={() => handleBadgeToggle(badge.value)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wide border transition-colors ${
                  (formData.badges || []).includes(badge.value)
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {badge.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-2">
            Weight (oz)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.weight || ''}
            onChange={(e) => handleInputChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
            placeholder="0.00"
          />
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
            {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
