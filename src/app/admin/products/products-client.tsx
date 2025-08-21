'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { AdminProduct, AdminCategory } from '@/types/admin';
import { ProductPreviewModal } from '../components/ProductPreviewModal';

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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<AdminProduct | null>(null);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [currentPage, searchQuery, selectedCategory]);

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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { category: selectedCategory }),
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
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} products
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-xs hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            Previous
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-xs hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border font-medium text-xs rounded ${
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
              {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-xs hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-xs hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
              Products
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your product inventory
            </p>
          </div>
          <Link
            href="/admin/products/add"
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 rounded"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 rounded"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              {total} product{total !== 1 ? 's' : ''} found
            </div>
          </div>
          {selectedProducts.length > 0 && (
            <div className="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-bold">
                {selectedProducts.length} selected
              </span>
              <button
                onClick={() => handleBulkStatusChange('active')}
                disabled={bulkActionLoading}
                className="px-3 py-1 text-xs font-bold uppercase tracking-wide border border-green-600 text-green-600 hover:bg-green-50 disabled:opacity-50 rounded"
              >
                Set Active
              </button>
              <button
                onClick={() => handleBulkStatusChange('inactive')}
                disabled={bulkActionLoading}
                className="px-3 py-1 text-xs font-bold uppercase tracking-wide border border-red-600 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded"
              >
                Set Inactive
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="px-3 py-1 text-xs font-bold uppercase tracking-wide border border-red-600 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded"
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
            <div className="hidden lg:block">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 font-medium text-sm text-gray-700 dark:text-gray-300">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div className="col-span-2">Image</div>
                <div className="col-span-3">Product</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Actions</div>
              </div>
              {products.map((product) => (
                <div key={product.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="w-16 h-16 relative border border-gray-200 dark:border-gray-700 rounded">
                      <OptimizedImage
                        src={product.image || '/images/placeholder.jpg'}
                        alt={product.name}
                        context="admin-thumb"
                        className="object-cover rounded"
                      />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {product.brand && `${product.brand} • `}
                      SKU: {product.sku || 'N/A'}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {categories.find(c => c.slug === product.category)?.name || product.category}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        ${product.salePrice || product.price}
                      </div>
                      {product.salePrice && (
                        <div className="text-sm text-gray-500 line-through">
                          ${product.price}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center">
                    {getStatusBadge(product.status)}
                  </div>
                  <div className="col-span-1">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => setPreviewProduct(product)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 text-left"
                      >
                        View
                      </button>
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="text-xs font-medium text-gray-600 hover:text-gray-800 text-left"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={(e) => handleDeleteProduct(product.id, e)}
                        className="text-xs font-medium text-red-600 hover:text-red-800 text-left"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
                <div key={product.id} className="p-4 border-b border-gray-200 dark:border-gray-700">
                  {/* Mobile Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>
                  
                  {/* Mobile Card Content */}
                  <div className="flex space-x-4">
                    <div className="w-16 h-16 relative border border-gray-200 dark:border-gray-700 rounded flex-shrink-0">
                      <OptimizedImage
                        src={product.image || '/images/placeholder.jpg'}
                        alt={product.name}
                        context="admin-thumb"
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Brand:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">{product.brand || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">SKU:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">{product.sku || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Category:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">
                            {categories.find(c => c.slug === product.category)?.name || product.category}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Price:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            ${product.salePrice || product.price}
                            {product.salePrice && (
                              <span className="ml-1 text-xs text-gray-500 line-through">
                                ${product.price}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      {/* Mobile Actions */}
                      <div className="flex space-x-4">
                        <button
                          onClick={() => setPreviewProduct(product)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="text-sm font-medium text-gray-600 hover:text-gray-800"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={(e) => handleDeleteProduct(product.id, e)}
                          className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
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
    </div>
  );
}
