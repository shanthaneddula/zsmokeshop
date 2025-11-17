'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Category, Product } from '@/types';
import ProductCard from '@/components/product/ProductCard';

export default function HomepageCatalogue() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  
  const selectedCategory = categories.find(cat => cat.id === activeCategory);
  const categoryProducts = products.filter(product => product.category === selectedCategory?.slug);
  
  // Fetch categories and products from admin API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Add cache-busting parameter to ensure fresh data
        const cacheBuster = Date.now();
        
        // Fetch categories
        const categoriesResponse = await fetch(`/api/shop/categories?t=${cacheBuster}`, { cache: 'no-store' });
        const categoriesData = await categoriesResponse.json();
        
        // Fetch products
        const productsResponse = await fetch(`/api/shop/products?t=${cacheBuster}`, { cache: 'no-store' });
        const productsData = await productsResponse.json();
        
        if (categoriesData.success && productsData.success) {
          setCategories(categoriesData.data.categories);
          setProducts(productsData.data.products);
          
          // Set first category as active if available
          if (categoriesData.data.categories.length > 0) {
            setActiveCategory(categoriesData.data.categories[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    const sectionElement = document.getElementById('homepage-catalogue');
    if (sectionElement) {
      observer.observe(sectionElement);
    }
    
    return () => observer.disconnect();
  }, []);

  // Scroll carousel left
  const scrollLeft = useCallback(() => {
    if (carouselRef.current && categoryProducts.length > 0) {
      const cardWidth = 220;
      const cardGap = 16;
      const scrollAmount = cardWidth + cardGap;
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }, [categoryProducts.length]);

  // Scroll carousel right
  const scrollRight = useCallback(() => {
    if (carouselRef.current && categoryProducts.length > 0) {
      const cardWidth = 220;
      const cardGap = 16;
      const scrollAmount = cardWidth + cardGap;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, [categoryProducts.length]);

  return (
    <section id="homepage-catalogue" className="min-h-[90vh] flex flex-col justify-center py-8 md:py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Product Catalogue
          </h2>
          <div className="w-12 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-4"></div>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto uppercase tracking-wide">
            Explore our premium selection across all categories
          </p>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 uppercase tracking-wide">Loading products...</p>
          </motion.div>
        ) : categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-gray-600 dark:text-gray-400 uppercase tracking-wide">No categories available</p>
          </motion.div>
        ) : (
          <>
            {/* Category Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-6 md:space-x-8 min-w-max px-4 md:px-0 md:justify-center">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`relative pb-2 text-sm md:text-base font-medium uppercase tracking-wider transition-colors whitespace-nowrap ${
                        activeCategory === category.id
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {category.name}
                      {activeCategory === category.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
        
        {/* Category Content */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-12"
        >
          {/* Products Carousel */}
          {categoryProducts.length > 0 ? (
            <div className="relative">
              {/* Mobile Carousel */}
              <div className="block md:hidden">
                <motion.div 
                  ref={mobileCarouselRef}
                  className="flex gap-3 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-hide scroll-smooth"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {categoryProducts.map((product) => (
                    <div key={product.id} className="flex-shrink-0 w-[160px] snap-center">
                      <ProductCard product={product} viewMode="grid" />
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Desktop Carousel */}
              <div className="hidden md:block relative group">
                {/* Left Arrow - Only show if scrollable */}
                {categoryProducts.length > 4 && (
                  <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 border border-gray-200 dark:border-gray-700"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                  </button>
                )}

                {/* Carousel Container */}
                <motion.div
                  ref={carouselRef}
                  className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {categoryProducts.map((product) => (
                    <div key={product.id} className="flex-shrink-0 w-[220px]">
                      <ProductCard product={product} viewMode="grid" />
                    </div>
                  ))}
                </motion.div>

                {/* Right Arrow - Only show if scrollable */}
                {categoryProducts.length > 4 && (
                  <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 border border-gray-200 dark:border-gray-700"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-900 dark:text-white" />
                  </button>
                )}
              </div>

              {/* View All Products Button */}
              <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Link
                  href={`/shop?category=${selectedCategory?.slug || ''}`}
                  className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 font-bold uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  View All Products
                </Link>
              </motion.div>
            </div>
          ) : (
            /* No products message */
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {selectedCategory?.name.charAt(0)}
                  </span>
                </div>
                <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                  {selectedCategory?.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Products coming soon
                </p>
                <Link 
                  href="/shop" 
                  className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 font-bold uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  View All Products
                </Link>
              </div>
            </div>
          )}
        </motion.div>
            </>
        )}
      </div>
    </section>
  );
}
