'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Category, Product } from '@/types';

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
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/shop/categories');
        const categoriesData = await categoriesResponse.json();
        
        // Fetch products
        const productsResponse = await fetch('/api/shop/products');
        const productsData = await productsResponse.json();
        
        if (categoriesData.success && productsData.success) {
          setCategories(categoriesData.categories);
          setProducts(productsData.products);
          
          // Set first category as active if available
          if (categoriesData.categories.length > 0) {
            setActiveCategory(categoriesData.categories[0].id);
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
    <section id="homepage-catalogue" className="min-h-[80vh] py-12 md:py-16 bg-gray-50 dark:bg-gray-850">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
            Product Catalogue
          </h2>
          <div className="w-16 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto uppercase tracking-wide">
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
              className="mb-12"
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
          {/* Products Grid */}
          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.slice(0, 8).map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all duration-300 overflow-hidden">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            {product.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      {/* Badges */}
                      {product.badges && product.badges.length > 0 && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs px-2 py-1 font-bold uppercase tracking-wide">
                            {product.badges[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2 uppercase tracking-wide line-clamp-2">
                        {product.name}
                      </h4>
                      
                      {/* Brand */}
                      {product.brand && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                          {product.brand}
                        </p>
                      )}
                      
                      {/* Price */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ${product.price}
                        </span>
                      </div>
                      
                      {/* Stock Status */}
                      <div className="text-xs uppercase tracking-wider">
                        {product.inStock ? (
                          <span className="text-green-600 dark:text-green-400">In Stock</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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
                <p className="text-gray-600 dark:text-gray-400 mb-4">
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
        </motion.div>
            </>
        )}
      </div>
    </section>
  );
}
