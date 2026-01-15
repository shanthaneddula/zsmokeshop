'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { AdminProduct, AdminCategory } from '@/types/admin';
import { ProductPreviewModal } from '../components/ProductPreviewModal';
import { BulkPriceUpdateModal, PriceUpdateType } from '@/components/admin/BulkPriceUpdateModal';

interface ProductsResponse {
  data: {
    products: AdminProduct[];
    pagination: {
      totalProducts: number;
      totalPages: number;
      currentPage: number;
    };
  };
}

export function ProductsClient() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<AdminProduct | null>(null);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false);
  const [bulkCategoryValue, setBulkCategoryValue] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [tempCategory, setTempCategory] = useState<string>('');

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchProducts();
  }, [currentPage, searchQuery, selectedCategory, selectedBrand, sortBy, sortOrder]);

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

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/admin/products/brands');
      if (response.ok) {
        const data = await response.json();
        setBrands(data.data.brands || []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedBrand && { brand: selectedBrand }),
      });

      const response = await fetch(`/api/admin/products?${params}`);
      if (response.ok) {
        const data: ProductsResponse = await response.json();
        setProducts(data.data.products || []);
        setTotalPages(data.data.pagination.totalPages || 1);
        setTotal(data.data.pagination.totalProducts || 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleBrandFilter = (brand: string) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    setSelectedProducts(
      selectedProducts.length === products.length ? [] : products.map(p => p.id)
    );
  };

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    if (selectedProducts.length === 0) return;

    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/admin/products/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedProducts,
          status
        })
      });

      if (response.ok) {
        await fetchProducts();
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error('Error updating products:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!confirm(`Delete ${selectedProducts.length} selected products?`)) return;

    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/admin/products/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: selectedProducts })
      });

      if (response.ok) {
        await fetchProducts();
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error('Error deleting products:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkPriceUpdate = async (updateType: PriceUpdateType, value: number) => {
    if (selectedProducts.length === 0) return;

    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/admin/products/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedProducts,
          priceUpdateType: updateType,
          priceValue: value
        })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchProducts();
        setSelectedProducts([]);
        setShowBulkPriceModal(false);
        
        // Show success message with any warnings
        if (data.data?.errors?.length > 0) {
          alert(`Updated ${data.data.updatedCount} products.\n\nWarnings:\n${data.data.errors.join('\n')}`);
        }
      } else {
        throw new Error(data.error || 'Failed to update prices');
      }
    } catch (error) {
      console.error('Error updating prices:', error);
      throw error;
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkCategoryUpdate = async () => {
    if (selectedProducts.length === 0 || !bulkCategoryValue) return;

    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/admin/products/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedProducts,
          category: bulkCategoryValue
        })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchProducts();
        setSelectedProducts([]);
        setShowBulkCategoryModal(false);
        setBulkCategoryValue('');
        alert(`Successfully updated category for ${selectedProducts.length} products`);
      } else {
        throw new Error(data.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleStatusToggle = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchProducts();
      } else {
        const data = await response.json();
        alert(`Failed to update status: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update product status');
    }
  };

  const handleInlinePriceUpdate = async (productId: string, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price })
      });

      if (response.ok) {
        setEditingPrice(null);
        await fetchProducts();
      } else {
        const data = await response.json();
        alert(`Failed to update price: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price');
    }
  };

  const handleInlineCategoryUpdate = async (productId: string, newCategory: string) => {
    if (!newCategory) {
      alert('Please select a category');
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory })
      });

      if (response.ok) {
        setEditingCategory(null);
        await fetchProducts();
      } else {
        const data = await response.json();
        alert(`Failed to update category: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const startEditPrice = (productId: string, currentPrice: number) => {
    setEditingPrice(productId);
    setTempPrice(currentPrice.toString());
  };

  const startEditCategory = (productId: string, currentCategory: string) => {
    setEditingCategory(productId);
    setTempCategory(currentCategory);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    const endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total}
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-2 sm:px-3 py-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-[10px] sm:text-xs hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded flex-shrink-0"
          >
            Prev
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="px-2 sm:px-3 py-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-[10px] sm:text-xs hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex-shrink-0"
              >
                1
              </button>
              {startPage > 2 && <span className="px-1 sm:px-2 text-gray-500 text-xs">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-2 sm:px-3 py-1 border font-medium text-[10px] sm:text-xs rounded flex-shrink-0 ${
                currentPage === page
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-1 sm:px-2 text-gray-500 text-xs">...</span>}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-2 sm:px-3 py-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-[10px] sm:text-xs hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex-shrink-0"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-2 sm:px-3 py-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-[10px] sm:text-xs hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded flex-shrink-0"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-full overflow-hidden">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
              Products
            </h1>
            <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage your product inventory
            </p>
          </div>
          <Link
            href="/admin/products/add"
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white font-bold uppercase tracking-wide text-xs sm:text-sm hover:bg-gray-800 dark:hover:bg-gray-100 active:bg-gray-700 transition-colors flex-shrink-0"
          >
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 rounded text-sm sm:text-base"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 rounded text-sm sm:text-base"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedBrand}
                onChange={(e) => handleBrandFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 rounded text-sm sm:text-base"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder as 'asc' | 'desc');
                  setCurrentPage(1);
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 rounded text-sm sm:text-base"
              >
                <option value="updatedAt-desc">Recently Updated</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {total} product{total !== 1 ? 's' : ''} found
            </div>
          </div>
          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs sm:text-sm font-bold">
                {selectedProducts.length} selected
              </span>
              <button
                onClick={() => setShowBulkPriceModal(true)}
                disabled={bulkActionLoading}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wide border border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50 rounded"
              >
                Update Prices
              </button>
              <button
                onClick={() => setShowBulkCategoryModal(true)}
                disabled={bulkActionLoading}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wide border border-purple-600 text-purple-600 hover:bg-purple-50 active:bg-purple-100 disabled:opacity-50 rounded"
              >
                Update Category
              </button>
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

      {/* Products List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-12 text-center">
            <div className="text-gray-600 dark:text-gray-400">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-600 dark:text-gray-400 mb-4">No products found</div>
            <Link
              href="/admin/products/add"
              className="inline-block px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Add Your First Product
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <div className="min-w-[1200px]">
                <div className="grid grid-cols-12 gap-3 px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 font-medium text-sm text-gray-700 dark:text-gray-300">
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div className="col-span-1">Image</div>
                  <div className="col-span-2">Product</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-1">Stock</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {products.map((product) => (
                  <div key={product.id} className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <div className="col-span-1">
                      <div className="w-14 h-14 relative border border-gray-200 dark:border-gray-700 rounded">
                        <OptimizedImage
                          src={product.image || '/images/placeholder.jpg'}
                          alt={product.name}
                          context="admin-thumb"
                          className="object-cover rounded"
                        />
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm">{product.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {product.brand && `${product.brand} • `}
                          {product.sku || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      {editingCategory === product.id ? (
                        <div className="flex items-center gap-1 w-full pr-2">
                          <select
                            value={tempCategory}
                            onChange={(e) => setTempCategory(e.target.value)}
                            className="flex-1 min-w-0 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleInlineCategoryUpdate(product.id, tempCategory);
                              } else if (e.key === 'Escape') {
                                setEditingCategory(null);
                              }
                            }}
                          >
                            {categories.map(cat => (
                              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInlineCategoryUpdate(product.id, tempCategory);
                            }}
                            className="text-green-600 hover:text-green-800 p-1 text-sm font-bold flex-shrink-0"
                            title="Save (Enter)"
                          >
                            ✓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCategory(null);
                            }}
                            className="text-red-600 hover:text-red-800 p-1 text-sm font-bold flex-shrink-0"
                            title="Cancel (Esc)"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditCategory(product.id, product.category);
                          }}
                          className="text-xs text-gray-900 dark:text-white hover:text-blue-600 text-left w-full truncate pr-2"
                          title="Click to edit category"
                        >
                          {categories.find(c => c.slug === product.category)?.name || product.category}
                        </button>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center">
                      {editingPrice === product.id ? (
                        <div className="flex items-center gap-1 w-full pr-2">
                          <div className="relative flex-1">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              className="w-full pl-5 pr-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleInlinePriceUpdate(product.id, tempPrice);
                                } else if (e.key === 'Escape') {
                                  setEditingPrice(null);
                                }
                              }}
                            />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInlinePriceUpdate(product.id, tempPrice);
                            }}
                            className="text-green-600 hover:text-green-800 p-1 text-sm font-bold flex-shrink-0"
                            title="Save (Enter)"
                          >
                            ✓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPrice(null);
                            }}
                            className="text-red-600 hover:text-red-800 p-1 text-sm font-bold flex-shrink-0"
                            title="Cancel (Esc)"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditPrice(product.id, product.price);
                          }}
                          className="hover:text-blue-600 text-left w-full pr-2"
                          title="Click to edit price"
                        >
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            ${product.salePrice || product.price}
                          </div>
                          {product.salePrice && (
                            <div className="text-xs text-gray-500 line-through">
                              ${product.price}
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="col-span-1 flex items-center">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const newStock = Math.max(0, (product.stockQuantity || 0) - 1);
                            
                            // Optimistic update
                            setProducts(prevProducts => 
                              prevProducts.map(p => 
                                p.id === product.id 
                                  ? { ...p, stockQuantity: newStock, inStock: newStock > 0 }
                                  : p
                              )
                            );
                            
                            try {
                              const response = await fetch(`/api/admin/products/${product.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  stockQuantity: newStock, 
                                  inStock: newStock > 0 
                                })
                              });
                              
                              if (!response.ok) {
                                // Revert on error
                                fetchProducts();
                              }
                            } catch (error) {
                              console.error('Failed to update stock:', error);
                              fetchProducts();
                            }
                          }}
                          className="w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold"
                          title="Decrease stock"
                        >
                          −
                        </button>
                        <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[30px] text-center">
                          {product.stockQuantity || 0}
                        </span>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const newStock = (product.stockQuantity || 0) + 1;
                            
                            // Optimistic update
                            setProducts(prevProducts => 
                              prevProducts.map(p => 
                                p.id === product.id 
                                  ? { ...p, stockQuantity: newStock, inStock: true }
                                  : p
                              )
                            );
                            
                            try {
                              const response = await fetch(`/api/admin/products/${product.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  stockQuantity: newStock, 
                                  inStock: true 
                                })
                              });
                              
                              if (!response.ok) {
                                // Revert on error
                                fetchProducts();
                              }
                            } catch (error) {
                              console.error('Failed to update stock:', error);
                              fetchProducts();
                            }
                          }}
                          className="w-6 h-6 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold"
                          title="Increase stock"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusToggle(product.id, product.status);
                        }}
                        className="cursor-pointer hover:opacity-70 transition-opacity"
                        title={`Click to ${product.status === 'active' ? 'deactivate' : 'activate'}`}
                      >
                        {getStatusBadge(product.status)}
                      </button>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewProduct(product)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="text-xs font-medium text-gray-600 hover:text-gray-800"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={(e) => handleDeleteProduct(product.id, e)}
                          className="text-xs font-medium text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {/* Mobile Bulk Actions Header */}
              {selectedProducts.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {selectedProducts.length} selected
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBulkStatusChange('active')}
                        disabled={bulkActionLoading}
                        className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('inactive')}
                        disabled={bulkActionLoading}
                        className="px-3 py-1 text-xs font-medium bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        disabled={bulkActionLoading}
                        className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {products.map((product) => (
                <div key={product.id} className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                  {/* Mobile Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300 dark:border-gray-600 mt-1 flex-shrink-0"
                      />
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>
                  
                  {/* Mobile Card Content - Stacked Layout */}
                  <div className="pl-6">
                    <div className="flex gap-3 mb-2">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 relative border border-gray-200 dark:border-gray-700 rounded flex-shrink-0 bg-gray-100">
                        <OptimizedImage
                          src={product.image || '/images/placeholder.jpg'}
                          alt={product.name}
                          context="admin-thumb"
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-xs sm:text-sm space-y-1">
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          <span>
                            <span className="text-gray-500 dark:text-gray-400">Brand:</span>
                            <span className="ml-1 text-gray-900 dark:text-white">{product.brand || 'N/A'}</span>
                          </span>
                          <span>
                            <span className="text-gray-500 dark:text-gray-400">SKU:</span>
                            <span className="ml-1 text-gray-900 dark:text-white">{product.sku || 'N/A'}</span>
                          </span>
                        </div>
                        <div className="truncate">
                          <span className="text-gray-500 dark:text-gray-400">Category:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">
                            {categories.find(c => c.slug === product.category)?.name || product.category}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Price:</span>
                          <span className="ml-1 font-bold text-gray-900 dark:text-white">
                            ${product.salePrice || product.price}
                          </span>
                          {product.salePrice && (
                            <span className="ml-1 text-xs text-gray-500 line-through">
                              ${product.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                      
                    {/* Mobile Actions */}
                    <div className="flex gap-4 pt-1 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => setPreviewProduct(product)}
                        className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 active:text-blue-900"
                      >
                        View
                      </button>
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-800 active:text-gray-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={(e) => handleDeleteProduct(product.id, e)}
                        className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-800 active:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {renderPagination()}
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewProduct && (
        <ProductPreviewModal
          product={previewProduct}
          onClose={() => setPreviewProduct(null)}
        />
      )}

      {/* Bulk Price Update Modal */}
      <BulkPriceUpdateModal
        isOpen={showBulkPriceModal}
        onClose={() => setShowBulkPriceModal(false)}
        onConfirm={handleBulkPriceUpdate}
        selectedCount={selectedProducts.length}
        isLoading={bulkActionLoading}
      />

      {/* Bulk Category Update Modal */}
      {showBulkCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-black uppercase tracking-wide mb-4">
                Update Category
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Change category for {selectedProducts.length} selected products
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  New Category
                </label>
                <select
                  value={bulkCategoryValue}
                  onChange={(e) => setBulkCategoryValue(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={bulkActionLoading}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBulkCategoryModal(false);
                    setBulkCategoryValue('');
                  }}
                  disabled={bulkActionLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-900 dark:border-white text-gray-900 dark:text-white font-bold uppercase tracking-wide hover:bg-gray-100 dark:hover:bg-gray-900 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkCategoryUpdate}
                  disabled={bulkActionLoading || !bulkCategoryValue}
                  className="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50"
                >
                  {bulkActionLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
