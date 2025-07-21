'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { catalogueData } from '@/data/catalogue';

export default function HomepageCatalogue() {
  const [activeCategory, setActiveCategory] = useState(catalogueData[0].id);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const selectedCategory = catalogueData.find(cat => cat.id === activeCategory);
  
  // Intersection observer for scroll animation
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
  
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Function to generate brand cards
  const renderBrandCards = (brands: string[] = []) => {
    return brands.map((brand, index) => (
      <motion.div
        key={`${brand}-${index}`}
        className="min-w-[200px] md:min-w-[250px] flex-shrink-0"
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="h-full border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all duration-300 p-4 md:p-6 flex flex-col justify-between bg-white dark:bg-gray-800">
          {/* Brand logo placeholder */}
          <div className="w-full h-24 md:h-32 bg-gray-100 dark:bg-gray-700 mb-3 md:mb-4 flex items-center justify-center">
            <div className="w-12 h-12 md:w-16 md:h-16 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">LOGO</span>
            </div>
          </div>
          
          {/* Brand name */}
          <div>
            <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
              {brand}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide hover:translate-x-1 transition-transform cursor-pointer">
              View Products
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </motion.div>
    ));
  };

  // Function to render subcategory sections for categories with subcategories
  const renderSubcategories = () => {
    if (!selectedCategory?.subcategories) return null;
    
    return selectedCategory.subcategories.map((subcategory, index) => (
      <motion.div 
        key={subcategory.id} 
        className="mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">
            {subcategory.name}
          </h3>
        </div>
        
        <div className="relative">
          <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-none shadow-lg"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-gray-900 dark:text-white" />
          </button>
          
          <motion.div 
            className="flex overflow-x-auto gap-4 py-4 scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.8, delay: 0.2 * (index + 1) }}
          >
            {renderBrandCards(subcategory.brands)}
          </motion.div>
          
          <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-none shadow-lg"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-gray-900 dark:text-white" />
          </button>
        </div>
      </motion.div>
    ));
  };
  
  return (
    <section id="homepage-catalogue" className="min-h-[80vh] py-12 md:py-16 bg-gray-50 dark:bg-gray-850">
      <div className="container mx-auto px-4">
        {/* Section header - Adidas Style */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 uppercase tracking-widest">
            Product Catalogue
          </h2>
          <div className="w-16 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-6 md:mb-8"></div>
          <p className="text-base md:text-lg font-light text-gray-600 dark:text-gray-400 max-w-xl mx-auto px-4">
            Explore our premium selection of products
          </p>
        </motion.div>
        
        {/* Category Tabs - Horizontal with Underline */}
        <motion.div 
          className="mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-6 md:space-x-8 min-w-max px-4 md:px-0 md:justify-center">
              {catalogueData.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`relative pb-3 text-sm md:text-base font-bold whitespace-nowrap transition-colors uppercase tracking-wide ${
                    activeCategory === category.id
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {category.name}
                  {/* Active underline */}
                  {activeCategory === category.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* For categories with subcategories */}
        {selectedCategory?.subcategories && renderSubcategories()}
        
        {/* For categories without subcategories, show brands directly */}
        {selectedCategory && !selectedCategory.subcategories && (
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button 
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-none shadow-lg"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-900 dark:text-white" />
            </button>
            
            <motion.div 
              ref={carouselRef}
              className="flex overflow-x-auto gap-4 py-4 scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              initial={{ opacity: 0, x: -20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {renderBrandCards(selectedCategory.brands)}
            </motion.div>
            
            <button 
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-none shadow-lg"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-900 dark:text-white" />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
