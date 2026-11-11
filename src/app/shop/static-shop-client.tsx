'use client';

// Static, display-only version of the shop page (used when USE_STATIC_CATALOG is on).
// Mirrors the layout and styling of shop-client.tsx, adds brand browsing inside a category,
// and reads products from src/data/catalog instead of the Redis-backed API.
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, Grid, List, Filter, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import Pagination from '@/components/ui/Pagination';
import {
  getCatalogCategories,
  getCatalogCategory,
  searchCatalog,
  toShopProduct,
} from '@/data/catalog';

const ITEMS_PER_PAGE = 12;

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'name-a-z', label: 'Name: A to Z' },
  { value: 'name-z-a', label: 'Name: Z to A' },
];

export default function StaticShopClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const categories = getCatalogCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('featured');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedBrand(searchParams.get('brand') || '');
    const s = searchParams.get('search');
    if (s) setSearchQuery(s);
    setCurrentPage(1);
  }, [searchParams]);

  const category = selectedCategory ? getCatalogCategory(selectedCategory) : undefined;
  const brand = category?.brands.find((b) => b.slug === selectedBrand);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = category
      ? `${brand ? `${brand.name} ` : ''}${category.name} | Z Smoke Shop - Austin, TX`
      : 'Shop | Z Smoke Shop - Premium Smoke Products in Austin, TX';
  }, [category, brand]);

  const navigate = (categorySlug: string, brandSlug = '') => {
    setSelectedCategory(categorySlug);
    setSelectedBrand(brandSlug);
    setCurrentPage(1);
    setSearchQuery('');
    setShowFilters(false);
    const params = new URLSearchParams();
    if (categorySlug) params.set('category', categorySlug);
    if (brandSlug) params.set('brand', brandSlug);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const filteredProducts = useMemo(() => {
    let list = searchQuery.trim() ? searchCatalog(searchQuery) : searchCatalog('');
    if (category) list = list.filter((p) => p.categorySlug === category.slug);
    if (brand) list = list.filter((p) => p.brandSlug === brand.slug);
    const sorted = [...list];
    if (sortBy === 'name-a-z') sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'name-z-a') sorted.sort((a, b) => b.name.localeCompare(a.name));
    return sorted.map(toShopProduct);
  }, [searchQuery, category, brand, sortBy]);

  // Inside a category with no brand/search chosen, show the products grouped by brand.
  const groupByBrand = !!category && !brand && !searchQuery.trim() && sortBy === 'featured';

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const gridClass =
    viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4';

  const chipClass = (active: boolean) =>
    `px-4 py-2 border text-xs md:text-sm font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${
      active
        ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white'
    }`;

  const crumbLink =
    'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wide';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Breadcrumb Navigation */}
      <section className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container-wide py-3">
          <nav className="flex items-center flex-wrap gap-x-2 text-sm">
            <Link href="/" className={crumbLink}>Home</Link>
            <span className="text-gray-400 dark:text-gray-500">›</span>
            <Link href="/shop" className={crumbLink}>Shop</Link>
            {category && (
              <>
                <span className="text-gray-400 dark:text-gray-500">›</span>
                {brand ? (
                  <button onClick={() => navigate(category.slug)} className={crumbLink}>
                    {category.name}
                  </button>
                ) : (
                  <span className="text-gray-900 dark:text-white font-medium uppercase tracking-wide">
                    {category.name}
                  </span>
                )}
              </>
            )}
            {brand && (
              <>
                <span className="text-gray-400 dark:text-gray-500">›</span>
                <span className="text-gray-900 dark:text-white font-medium uppercase tracking-wide">
                  {brand.name}
                </span>
              </>
            )}
          </nav>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-[3.25rem] md:top-16 z-30">
        <div className="container-wide py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, brands, flavors..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors uppercase tracking-wide"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`md:hidden flex items-center gap-2 px-4 py-2 border text-sm font-medium uppercase tracking-wide transition-colors ${
                  showFilters
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900'
                }`}
              >
                <Filter className="h-4 w-4" />
                {category ? <span className="truncate max-w-[100px]">{category.name}</span> : 'Filters'}
                {category && <span className="ml-1 text-xs opacity-75">({filteredProducts.length})</span>}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white text-sm font-medium uppercase tracking-wide transition-colors"
                >
                  {sortOptions.find((o) => o.value === sortBy)?.label || 'Sort'}
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
                          sortBy === option.value ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex border border-gray-300 dark:border-gray-600">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'} transition-colors`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'} transition-colors`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {filteredProducts.length} Products
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container-wide py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white">
                  Categories
                </h3>
                {category && (
                  <button
                    onClick={() => navigate('')}
                    className="md:hidden text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wide"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('')}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors ${
                    !category
                      ? 'text-gray-900 dark:text-white border-l-2 border-gray-900 dark:border-white pl-2'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <div key={c.slug}>
                    <button
                      onClick={() => navigate(c.slug)}
                      className={`block w-full text-left px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors ${
                        selectedCategory === c.slug
                          ? 'text-gray-900 dark:text-white border-l-2 border-gray-900 dark:border-white pl-2'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {c.name}
                    </button>
                    {selectedCategory === c.slug && (
                      <div className="ml-4 mt-1 mb-2 space-y-1 border-l border-gray-200 dark:border-gray-700">
                        {c.brands.map((b) => (
                          <button
                            key={b.slug}
                            onClick={() => navigate(c.slug, b.slug)}
                            className={`block w-full text-left pl-3 py-1 text-xs font-medium uppercase tracking-wide transition-colors ${
                              selectedBrand === b.slug
                                ? 'text-gray-900 dark:text-white font-bold'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            {b.name} <span className="opacity-60">({b.products.length})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {category && (
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                  {brand ? brand.name : category.name}
                </h1>
                <div className="w-12 h-0.5 bg-gray-900 dark:bg-white mt-3 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
                  {brand ? brand.description : category.description}
                </p>
                {/* Brand chips */}
                <div className="mt-6 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  <button onClick={() => navigate(category.slug)} className={chipClass(!brand)}>
                    All Brands
                  </button>
                  {category.brands.map((b) => (
                    <button
                      key={b.slug}
                      onClick={() => navigate(category.slug, b.slug)}
                      className={chipClass(selectedBrand === b.slug)}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {groupByBrand && category ? (
              <div className="space-y-14">
                {category.brands.map((b) => {
                  const items = filteredProducts.filter((p) => p.brand === b.name);
                  if (items.length === 0) return null;
                  return (
                    <section key={b.slug}>
                      <div className="flex items-end justify-between gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
                        <div>
                          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                            {b.name}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{b.description}</p>
                        </div>
                        <button
                          onClick={() => navigate(category.slug, b.slug)}
                          className="text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-white hover:underline whitespace-nowrap"
                        >
                          View All ({items.length})
                        </button>
                      </div>
                      <div className={gridClass}>
                        {items.map((product) => (
                          <ProductCard key={product.id} product={product} viewMode={viewMode} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <>
                <div className={gridClass}>
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-wide text-gray-900 dark:text-white mb-2">
                      No Products Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search or browse all products</p>
                    <button
                      onClick={() => navigate('')}
                      className="inline-flex items-center justify-center border border-gray-900 dark:border-white px-6 py-3 text-sm font-black uppercase tracking-wide text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all duration-300"
                    >
                      Clear Filters
                    </button>
                  </motion.div>
                )}

                {filteredProducts.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredProducts.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
