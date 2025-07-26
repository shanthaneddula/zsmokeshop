'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, Grid, List, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Category, Product } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import Pagination from '@/components/ui/Pagination';

export default function ShopPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('featured');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  const ITEMS_PER_PAGE = 12;

  // Fetch data from admin-managed APIs
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = Date.now();
      const [categoriesRes, productsRes] = await Promise.all([
        fetch(`/api/shop/categories?t=${cacheBuster}`, { cache: 'no-store' }),
        fetch(`/api/shop/products?t=${cacheBuster}`, { cache: 'no-store' })
      ]);
      
      if (categoriesRes.ok && productsRes.ok) {
        const categoriesData = await categoriesRes.json();
        const productsData = await productsRes.json();
        
        if (categoriesData.success && categoriesData.data) {
          setCategories(categoriesData.data.categories);
        }
        
        if (productsData.success && productsData.data) {
          setProducts(productsData.data.products);
        }
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching shop data:', err);
      setError('Failed to load shop data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle URL parameters on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
      setCurrentPage(1); // Reset to first page when loading with search
    }
  }, [searchParams]);

  // Update page title based on selected category
  useEffect(() => {
    const selectedCategoryData = categories.find(cat => cat.slug === selectedCategory);
    const title = selectedCategoryData 
      ? `${selectedCategoryData.name} | Z Smoke Shop - Austin, TX`
      : 'Shop | Z Smoke Shop - Premium Smoke Products in Austin, TX';
    
    // Update browser tab title
    if (typeof document !== 'undefined') {
      document.title = title;
    }
  }, [selectedCategory, categories]);

  // Update URL when category changes
  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setCurrentPage(1); // Reset to first page when changing category
    setSearchQuery(''); // Clear search when changing category
    
    // Auto-hide mobile sidebar after selection
    setShowFilters(false);
    
    const params = new URLSearchParams(searchParams.toString());
    if (categorySlug) {
      params.set('category', categorySlug);
    } else {
      params.delete('category');
    }
    
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'name-a-z':
          return a.name.localeCompare(b.name);
        case 'name-z-a':
          return b.name.localeCompare(a.name);

        case 'newest':
          return (b.badges?.includes('new') ? 1 : 0) - (a.badges?.includes('new') ? 1 : 0);
        case 'featured':
        default:
          // Featured: prioritize best-sellers, then by newest (badges with 'new')
          const aScore = (a.badges?.includes('best-seller') ? 100 : 0) + (a.badges?.includes('new') ? 50 : 0);
          const bScore = (b.badges?.includes('best-seller') ? 100 : 0) + (b.badges?.includes('new') ? 50 : 0);
          return bScore - aScore;
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Sort options
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'name-a-z', label: 'Name: A to Z' },
    { value: 'name-z-a', label: 'Name: Z to A' },
    { value: 'newest', label: 'Newest First' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section - Adidas Style */}
      <section className="relative bg-black text-white py-16 md:py-24">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-4">
              {selectedCategory 
                ? categories.find(cat => cat.slug === selectedCategory)?.name || 'Shop'
                : 'Shop'
              }
            </h1>
            <div className="w-16 h-0.5 bg-white mx-auto mb-6"></div>
            <p className="text-lg md:text-xl font-light text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {selectedCategory 
                ? `Browse our ${categories.find(cat => cat.slug === selectedCategory)?.name.toLowerCase()} collection`
                : 'Premium smoke shop products and accessories for the modern enthusiast'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Breadcrumb Navigation */}
      <section className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container-wide py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link 
              href="/" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wide"
            >
              Home
            </Link>
            <span className="text-gray-400 dark:text-gray-500">›</span>
            <Link 
              href="/shop" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wide"
            >
              Shop
            </Link>
            {selectedCategory && (
              <>
                <span className="text-gray-400 dark:text-gray-500">›</span>
                <span className="text-gray-900 dark:text-white font-medium uppercase tracking-wide">
                  {categories.find(cat => cat.slug === selectedCategory)?.name || selectedCategory}
                </span>
              </>
            )}
          </nav>
        </div>
      </section>

      {/* Search & Filter Bar - Clean Adidas Style */}
      <section className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-[3.25rem] md:top-16 z-30">
        <div className="container-wide py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors uppercase tracking-wide"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`md:hidden flex items-center gap-2 px-4 py-2 border text-sm font-medium uppercase tracking-wide transition-colors ${
                  showFilters 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900'
                }`}
              >
                <Filter className="h-4 w-4" />
                {selectedCategory ? (
                  <span className="truncate max-w-[100px]">
                    {categories.find(cat => cat.slug === selectedCategory)?.name || 'Filtered'}
                  </span>
                ) : (
                  'Filters'
                )}
                {selectedCategory && (
                  <span className="ml-1 text-xs opacity-75">({filteredProducts.length})</span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white text-sm font-medium uppercase tracking-wide transition-colors"
                >
                  {sortOptions.find(option => option.value === sortBy)?.label || 'Sort'}
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showSortDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                          setCurrentPage(1);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          sortBy === option.value 
                            ? 'bg-gray-100 dark:bg-gray-700 font-medium' 
                            : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 dark:border-gray-600">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  } transition-colors`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  } transition-colors`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Results Count */}
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {loading ? 'Loading...' : `${filteredProducts.length} Products`}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container-wide py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Adidas Style */}
          <aside className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white">
                  Categories
                </h3>
                {selectedCategory && (
                  <button
                    onClick={() => handleCategoryChange('')}
                    className="md:hidden text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wide"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors ${
                    selectedCategory === '' 
                      ? 'text-gray-900 dark:text-white border-l-2 border-gray-900 dark:border-white pl-2' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.slug)}
                    className={`block w-full text-left px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors ${
                      selectedCategory === category.slug 
                        ? 'text-gray-900 dark:text-white border-l-2 border-gray-900 dark:border-white pl-2' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-900 dark:text-white" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                    Loading Products...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 border-2 border-red-300 dark:border-red-600 flex items-center justify-center">
                  <span className="text-2xl text-red-500">!</span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-wide text-gray-900 dark:text-white mb-2">
                  Error Loading Products
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {error}
                </p>
                <button
                  onClick={fetchData}
                  className="inline-flex items-center justify-center border border-gray-900 dark:border-white px-6 py-3 text-sm font-black uppercase tracking-wide text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Product Grid/List */}
            {!loading && !error && (
              <div className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                  : 'space-y-4'
              }`}>
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {/* No Results - Adidas Style */}
            {!loading && !error && filteredProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-6 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-wide text-gray-900 dark:text-white mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search or browse all products
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                  }}
                  className="inline-flex items-center justify-center border border-gray-900 dark:border-white px-6 py-3 text-sm font-black uppercase tracking-wide text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all duration-300"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}

            {/* Pagination */}
            {!loading && !error && filteredProducts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredProducts.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
