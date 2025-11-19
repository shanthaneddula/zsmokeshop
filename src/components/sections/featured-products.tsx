"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  rating: number;
  image: string;
  category: string;
  badges?: string[];
  description: string;
  brand?: string;
  inStock: boolean;
  slug: string;
}

export default function FeaturedProducts() {
  const { settings } = useBusinessSettings();
  const carouselRef = useRef<HTMLDivElement>(null);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured products from API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/shop/featured-products');
        const data = await response.json();
        
        if (data.success && data.data.products) {
          setFeaturedProducts(data.data.products);
        } else {
          setError('Failed to load featured products');
          setFeaturedProducts([]);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products');
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Scroll carousel left with circular effect
  const scrollLeft = useCallback(() => {
    if (carouselRef.current && featuredProducts.length > 0) {
      const cardWidth = 220;
      const cardGap = 16;
      const scrollAmount = cardWidth + cardGap;
      
      const isAtStart = carouselRef.current.scrollLeft <= 10;
      
      if (isAtStart) {
        const totalWidth = featuredProducts.length * scrollAmount;
        const maxScrollPosition = totalWidth - carouselRef.current.clientWidth;
        carouselRef.current.scrollTo({ left: maxScrollPosition, behavior: 'smooth' });
        setActiveIndex(Math.max(0, featuredProducts.length - 4));
      } else {
        carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        setActiveIndex(Math.max(0, activeIndex - 1));
      }
    }
  }, [activeIndex, featuredProducts.length]);

  // Scroll carousel right with circular effect
  const scrollRight = useCallback(() => {
    if (carouselRef.current && featuredProducts.length > 0) {
      const cardWidth = 220;
      const cardGap = 16;
      const scrollAmount = cardWidth + cardGap;
      const totalWidth = featuredProducts.length * scrollAmount;
      
      const isAtEnd = carouselRef.current.scrollLeft >= totalWidth - carouselRef.current.clientWidth - cardGap;
      
      if (isAtEnd) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        setActiveIndex(0);
      } else {
        carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        setActiveIndex(Math.min(featuredProducts.length - 4, activeIndex + 1));
      }
    }
  }, [activeIndex, featuredProducts.length]);

  // Auto-scroll effect
  useEffect(() => {
    if (!isVisible || featuredProducts.length === 0) return;
    
    const interval = setInterval(() => {
      scrollRight();
    }, 4000);
    
    return () => clearInterval(interval);
  }, [scrollRight, isVisible, featuredProducts.length]);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) {
      observer.observe(currentSectionRef);
    }
    
    return () => {
      if (currentSectionRef) {
        observer.unobserve(currentSectionRef);
      }
    };
  }, []);

  // Don't render section if no products and not loading
  if (!isLoading && featuredProducts.length === 0 && !error) {
    return null;
  }

  return (
    <section ref={sectionRef} className="relative py-16 md:py-20 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Featured Products
          </h2>
          <div className="w-12 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-base font-light px-4 uppercase tracking-wide">
            Discover our most popular and newest arrivals
          </p>
        </motion.div>

        {/* Enhanced Loading State */}
        {isLoading && (
          <div className="flex flex-col justify-center items-center py-16 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 dark:border-white border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium animate-pulse">Loading featured products...</p>
          </div>
        )}

        {/* Enhanced Error State */}
        {error && !isLoading && (
          <div className="text-center py-16 px-4">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unable to Load Products</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 rounded touch-manipulation min-h-[44px]"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Products Content */}
        {!isLoading && !error && featuredProducts.length > 0 && (
          <>
            {/* Mobile Carousel */}
            <div className="block md:hidden relative">
              <motion.div 
                ref={mobileCarouselRef}
                className="flex gap-3 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-hide scroll-smooth"
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {featuredProducts.map((product) => (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <motion.div className="flex-none min-w-[180px] w-[180px] group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 snap-start cursor-pointer"
                      whileHover={{ y: -5 }}
                    >
                      {/* Product Badges */}
                      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                        {product.badges?.includes('best-seller') && (
                          <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 uppercase tracking-wide">
                            Best Seller
                          </span>
                        )}
                        {product.badges?.includes('new') && (
                          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 uppercase tracking-wide">
                            New
                          </span>
                        )}
                        {product.badges?.includes('featured') && (
                          <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 uppercase tracking-wide">
                            Featured
                          </span>
                        )}
                        {product.badges?.includes('sale') && (
                          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 uppercase tracking-wide">
                            Sale
                          </span>
                        )}
                      </div>

                      {/* Product Image */}
                      <div className="relative w-full h-32 overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <OptimizedImage
                          src={product.image}
                          alt={product.name}
                          context="featured"
                          priority={false}
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="p-3">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide text-xs line-clamp-2">
                          {product.name}
                        </h3>
                        {settings?.showPrices !== false && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.salePrice && product.salePrice < product.price && (
                              <span className="text-xs text-gray-500 line-through">
                                ${product.salePrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
            </div>

            {/* Desktop Carousel */}
            <div className="hidden md:block relative mx-auto max-w-[1200px]">
              {/* Left Navigation Arrow - Enhanced touch target */}
              <button 
                onClick={scrollLeft}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-gray-900/90 dark:bg-white/90 backdrop-blur-sm h-12 w-12 flex items-center justify-center shadow-lg hover:bg-black dark:hover:bg-gray-100 transition-all duration-200 rounded-full touch-manipulation"
                aria-label="Previous products"
              >
                <ChevronLeft className="h-6 w-6 text-white dark:text-gray-900" />
              </button>

              {/* Products Carousel */}
              <motion.div 
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide max-w-[1200px] mx-auto px-12 pb-4 scroll-smooth"
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {featuredProducts.map((product, index) => (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <motion.div
                      className="group flex-none w-[220px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      whileHover={{ y: -5 }}
                    >
                      {/* Product Badges */}
                      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        {product.badges?.includes('best-seller') && (
                          <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">
                            Best Seller
                          </span>
                        )}
                        {product.badges?.includes('new') && (
                          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">
                            New
                          </span>
                        )}
                        {product.badges?.includes('featured') && (
                          <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">
                            Featured
                          </span>
                        )}
                        {product.badges?.includes('sale') && (
                          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">
                            Sale
                          </span>
                        )}
                      </div>

                      {/* Product Image */}
                      <div className="relative w-full h-44 overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <OptimizedImage
                          src={product.image}
                          alt={product.name}
                          context="featured"
                          priority={index < 4}
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide text-sm">
                          {product.name}
                        </h3>

                        {/* Price */}
                        {settings?.showPrices !== false && (
                          <div className="mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                ${product.price.toFixed(2)}
                              </span>
                              {product.salePrice && product.salePrice < product.price && (
                                <span className="text-sm text-gray-500 line-through font-light">
                                  ${product.salePrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Add to Cart Button */}
                        {settings?.enableCart !== false && (
                          <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 px-4 font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors uppercase tracking-wide text-sm border border-gray-900 dark:border-white">
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
              
              {/* Right Navigation Arrow - Enhanced touch target */}
              <button 
                onClick={scrollRight}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-gray-900/90 dark:bg-white/90 backdrop-blur-sm h-12 w-12 flex items-center justify-center shadow-lg hover:bg-black dark:hover:bg-gray-100 transition-all duration-200 rounded-full touch-manipulation"
                aria-label="Next products"
              >
                <ChevronRight className="h-6 w-6 text-white dark:text-gray-900" />
              </button>

              {/* Carousel Indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: Math.max(1, featuredProducts.length - 3) }).map((_, index) => (
                  <button 
                    key={index} 
                    className={`w-2 h-2 transition-colors ${
                      index === activeIndex 
                        ? 'bg-gray-900 dark:bg-white' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                    onClick={() => {
                      setActiveIndex(index);
                      if (carouselRef.current) {
                        const scrollAmount = (carouselRef.current.offsetWidth / 4) * index;
                        carouselRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                      }
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* View All Products Button */}
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/shop">
                <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-8 md:px-12 py-3 md:py-4 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors uppercase tracking-wide text-sm border border-gray-900 dark:border-white">
                  View All Products
                </button>
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
