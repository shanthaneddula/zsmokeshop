'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Category, Product } from '@/types';
import ProductCard from '@/components/product/ProductCard';

export default function HomepageCatalogue() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  
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

  return (
    <section id="homepage-catalogue" className="relative min-h-[90vh] flex flex-col justify-center py-8 md:py-12 bg-gray-50 dark:bg-gray-900 z-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Product Catalogue
          </h2>
          <div className="w-12 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-4"></div>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto uppercase tracking-wide">
            Explore our premium selection across all categories
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 uppercase tracking-wide">Loading products...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400 uppercase tracking-wide">No categories available</p>
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            <div className="mb-8">
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
            </div>
        
        {/* Category Content */}
        <div
          key={activeCategory}
          className="mt-12"
        >
          {/* Products Grid */}
          {categoryProducts.length > 0 ? (
            <div className="relative">
              {/* Horizontal Scrollable Carousel */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 pb-4">
                  {categoryProducts.slice(0, 12).map((product) => (
                    <div key={product.id} className="flex-none w-[180px] md:w-[220px]">
                      <ProductCard product={product} viewMode="grid" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* View All Button */}
              {categoryProducts.length > 0 && (
                <div className="text-center mt-6">
                  <a 
                    href={`/shop?category=${selectedCategory?.slug}`}
                    className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    View All {selectedCategory?.name}
                  </a>
                </div>
              )}
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
                <a 
                  href="/shop" 
                  className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 font-bold uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  View All Products
                </a>
              </div>
            </div>
          )}
        </div>
            </>
        )}
      </div>
    </section>
  );
}
