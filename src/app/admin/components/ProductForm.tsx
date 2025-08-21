'use client';

import { useState, useEffect } from 'react';
import { AdminProduct, AdminCategory, ComplianceTemplate } from '@/types';
import { 
  getAllComplianceTemplates,
  getComplianceTemplatesByCategory,
  applyComplianceTemplate
} from '@/lib/compliance-templates';
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
  const [complianceTemplates, setComplianceTemplates] = useState<ComplianceTemplate[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<ComplianceTemplate[]>([]);
  const [formData, setFormData] = useState<Partial<AdminProduct>>({
    name: '',
    category: '',
    price: 0,
    salePrice: undefined,
    image: '',

    shortDescription: '',
    detailedDescription: '',
    brand: '',
    inStock: true,
    badges: [],
    sku: '',
    status: 'active',
    weight: undefined,
    dimensions: undefined,
    // Compliance fields
    complianceLevel: 'none',
    complianceTemplate: undefined,
    complianceNotes: [],
    safetyWarnings: [],
    legalDisclaimers: [],
    intendedUse: undefined,
    ageRestriction: undefined
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUploading, setImageUploading] = useState(false);

  // Load categories and compliance templates on mount
  useEffect(() => {
    fetchCategories();
    loadComplianceTemplates();
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

        shortDescription: product.shortDescription || '',
        detailedDescription: product.detailedDescription || '',
        brand: product.brand || '',
        inStock: product.inStock ?? true,
        badges: product.badges || [],
        sku: product.sku || '',
        status: product.status || 'active',
        weight: product.weight,
        dimensions: product.dimensions,
        // Compliance fields
        complianceLevel: product.complianceLevel || 'none',
        complianceTemplate: product.complianceTemplate,
        complianceNotes: product.complianceNotes || [],
        safetyWarnings: product.safetyWarnings || [],
        legalDisclaimers: product.legalDisclaimers || [],
        intendedUse: product.intendedUse,
        ageRestriction: product.ageRestriction
      });
    }
  }, [product]);

  // Update available templates when category changes
  useEffect(() => {
    if (formData.category) {
      const categoryTemplates = getComplianceTemplatesByCategory(formData.category);
      setAvailableTemplates(categoryTemplates);
    } else {
      setAvailableTemplates(complianceTemplates);
    }
  }, [formData.category, complianceTemplates]);

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

  const loadComplianceTemplates = () => {
    const templates = getAllComplianceTemplates();
    setComplianceTemplates(templates);
    setAvailableTemplates(templates);
  };

  const handleComplianceChange = (level: 'none' | 'age-restricted' | 'regulated' | 'prescription') => {
    setFormData(prev => ({
      ...prev,
      complianceLevel: level,
      complianceTemplate: level === 'none' ? undefined : prev.complianceTemplate,
      complianceNotes: level === 'none' ? [] : prev.complianceNotes,
      safetyWarnings: level === 'none' ? [] : prev.safetyWarnings,
      legalDisclaimers: level === 'none' ? [] : prev.legalDisclaimers,
      ageRestriction: level === 'none' ? undefined : prev.ageRestriction
    }));
  };

  const handleTemplateChange = (templateId: string) => {
    if (!templateId) {
      setFormData(prev => ({
        ...prev,
        complianceTemplate: undefined,
        complianceNotes: [],
        safetyWarnings: [],
        legalDisclaimers: [],
        ageRestriction: undefined
      }));
      return;
    }

    const templateData = applyComplianceTemplate(templateId, {
      complianceNotes: formData.complianceNotes,
      safetyWarnings: formData.safetyWarnings,
      legalDisclaimers: formData.legalDisclaimers,
      ageRestriction: formData.ageRestriction
    });

    setFormData(prev => ({
      ...prev,
      complianceTemplate: templateId,
      ...templateData
    }));
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

  const handleInputChange = (field: keyof AdminProduct, value: string | number | boolean | string[] | undefined) => {
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

        {/* Short Description */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-2">
            Short Description *
          </label>
          <textarea
            value={formData.shortDescription || ''}
            onChange={(e) => handleInputChange('shortDescription', e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 resize-none"
            placeholder="Brief product summary (1-2 sentences)"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This will be shown initially on the product page
          </p>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-2">
            Detailed Description
          </label>
          <textarea
            value={formData.detailedDescription || ''}
            onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 resize-none"
            placeholder="Full product description with details..."
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
            <p>This will be shown when users click &ldquo;Read More&rdquo;</p>
            <p><strong>Formatting tips:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-0.5">
              <li>Use double line breaks for paragraphs</li>
              <li>Start lines with • or - for bullet points</li>
              <li>Example: • Feature one\n• Feature two</li>
            </ul>
          </div>
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

        {/* Cannabis-Specific Fields */}
        {formData.category === 'cannabis-products' && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-bold uppercase tracking-wide mb-4 text-gray-900 dark:text-white">
              Cannabis Product Details
            </h3>
            
            {/* Subcategory and Strain Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Subcategory */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Subcategory
                </label>
                <select
                  value={formData.subcategory || ''}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                >
                  <option value="">Select subcategory...</option>
                  <option value="edibles">Edibles</option>
                  <option value="gummies">Gummies</option>
                  <option value="pre-rolls">Pre-Rolls</option>
                  <option value="cannabis-drinks">Drinks</option>
                  <option value="vapes">Vapes</option>
                  <option value="cartridges">Cartridges</option>
                  <option value="flower">Flower</option>
                </select>
              </div>

              {/* Strain Type */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Strain Type
                </label>
                <select
                  value={formData.strainType || ''}
                  onChange={(e) => handleInputChange('strainType', e.target.value as 'indica' | 'sativa' | 'hybrid')}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                >
                  <option value="">Select strain type...</option>
                  <option value="indica">Indica</option>
                  <option value="sativa">Sativa</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Strain Name and Cannabinoid Strength */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Strain Name */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Strain Name
                </label>
                <input
                  type="text"
                  value={formData.strainName || ''}
                  onChange={(e) => handleInputChange('strainName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                  placeholder="e.g., Runtz, Gelato, Forbidden Punch"
                />
              </div>

              {/* Cannabinoid Strength */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Cannabinoid Strength (mg)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.cannabinoidStrength || ''}
                  onChange={(e) => handleInputChange('cannabinoidStrength', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                  placeholder="e.g., 25, 50, 100"
                />
              </div>
            </div>

            {/* THC-A Percentage and Weight/Volume */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* THC-A Percentage */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  THC-A Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.thcaPercentage || ''}
                  onChange={(e) => handleInputChange('thcaPercentage', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                  placeholder="e.g., 25.5"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  For flower and pre-rolls
                </p>
              </div>

              {/* Weight/Volume */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Weight/Volume
                </label>
                <input
                  type="text"
                  value={formData.weightVolume || ''}
                  onChange={(e) => handleInputChange('weightVolume', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                  placeholder="e.g., 1g, 1/8oz, 1ml"
                />
              </div>
            </div>

            {/* Units per Pack and Servings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Units per Pack */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Units per Pack
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.unitsPerPack || ''}
                  onChange={(e) => handleInputChange('unitsPerPack', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                  placeholder="e.g., 25, 10, 2"
                />
              </div>

              {/* Servings per Item */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Servings per Item
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.servingsPerItem || ''}
                  onChange={(e) => handleInputChange('servingsPerItem', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                  placeholder="e.g., 1, 2"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  For drinks and edibles
                </p>
              </div>
            </div>

            {/* Cannabinoid Types (Multi-select) */}
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Cannabinoid Types
              </label>
              <div className="flex flex-wrap gap-2">
                {['THC-A', 'CBD', 'Delta-8', 'Delta-9', 'CBG', 'CBN'].map(cannabinoid => (
                  <button
                    key={cannabinoid}
                    type="button"
                    onClick={() => {
                      const current = formData.cannabinoidType || [];
                      const updated = current.includes(cannabinoid)
                        ? current.filter(c => c !== cannabinoid)
                        : [...current, cannabinoid];
                      handleInputChange('cannabinoidType', updated);
                    }}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wide border transition-colors ${
                      (formData.cannabinoidType || []).includes(cannabinoid)
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white'
                        : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cannabinoid}
                  </button>
                ))}
              </div>
            </div>

            {/* Effect Tags */}
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Effect Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {['Relaxing', 'Uplifting', 'Focus', 'Sleep', 'Energy', 'Creative', 'Pain Relief', 'Anxiety Relief'].map(effect => (
                  <button
                    key={effect}
                    type="button"
                    onClick={() => {
                      const current = formData.effectTags || [];
                      const updated = current.includes(effect)
                        ? current.filter(e => e !== effect)
                        : [...current, effect];
                      handleInputChange('effectTags', updated);
                    }}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wide border transition-colors ${
                      (formData.effectTags || []).includes(effect)
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white'
                        : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {effect}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Fields Based on Subcategory */}
            {formData.subcategory === 'cartridges' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Volume (ml)
                  </label>
                  <input
                    type="text"
                    value={formData.volume || ''}
                    onChange={(e) => handleInputChange('volume', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                    placeholder="e.g., 1ml"
                  />
                </div>
                <div className="flex items-center pt-8">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is510Compatible || false}
                      onChange={(e) => handleInputChange('is510Compatible', e.target.checked)}
                      className="mr-2"
                    />
                    510-Thread Compatible
                  </label>
                </div>
              </div>
            )}

            {formData.subcategory === 'cannabis-drinks' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Bottle Size (oz)
                  </label>
                  <input
                    type="text"
                    value={formData.bottleSize || ''}
                    onChange={(e) => handleInputChange('bottleSize', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                    placeholder="e.g., 12oz, 16oz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Potency (mg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.potency || ''}
                    onChange={(e) => handleInputChange('potency', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                    placeholder="e.g., 10, 25, 50"
                  />
                </div>
              </div>
            )}

            {formData.subcategory === 'pre-rolls' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Total Grams
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.totalGrams || ''}
                    onChange={(e) => handleInputChange('totalGrams', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                    placeholder="e.g., 1.0, 0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.count || ''}
                    onChange={(e) => handleInputChange('count', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                    placeholder="e.g., 1, 2, 5"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Compliance Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-bold uppercase tracking-wide mb-4 text-gray-900 dark:text-white">
            Compliance & Safety
          </h3>
          
          {/* Compliance Level */}
          <div className="mb-6">
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">
              Compliance Level
            </label>
            <select
              value={formData.complianceLevel || 'none'}
              onChange={(e) => handleComplianceChange(e.target.value as 'none' | 'age-restricted' | 'regulated' | 'prescription')}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
            >
              <option value="none">No Special Compliance</option>
              <option value="age-restricted">Age Restricted (18+)</option>
              <option value="regulated">Regulated Product</option>
              <option value="prescription">Prescription Required</option>
            </select>
          </div>

          {/* Compliance Template */}
          {formData.complianceLevel && formData.complianceLevel !== 'none' && (
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Compliance Template
              </label>
              <select
                value={formData.complianceTemplate || ''}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
              >
                <option value="">Select a template...</option>
                {availableTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Templates provide pre-configured compliance notes and warnings for common product types.
              </p>
            </div>
          )}

          {/* Age Restriction */}
          {formData.complianceLevel && formData.complianceLevel !== 'none' && (
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Minimum Age
              </label>
              <input
                type="number"
                min="18"
                max="25"
                value={formData.ageRestriction || 18}
                onChange={(e) => handleInputChange('ageRestriction', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                placeholder="18"
              />
            </div>
          )}

          {/* Compliance Notes Preview */}
          {formData.complianceNotes && formData.complianceNotes.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Compliance Notes
              </label>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded">
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {formData.complianceNotes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Safety Warnings Preview */}
          {formData.safetyWarnings && formData.safetyWarnings.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Safety Warnings
              </label>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded">
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                  {formData.safetyWarnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Legal Disclaimers Preview */}
          {formData.legalDisclaimers && formData.legalDisclaimers.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Legal Disclaimers
              </label>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded">
                <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-200">
                  {formData.legalDisclaimers.map((disclaimer, index) => (
                    <li key={index}>{disclaimer}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
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
