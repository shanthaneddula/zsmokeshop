"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import OptimizedImage from '@/components/ui/OptimizedImage';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface StorePhoto {
  id: string;
  url: string;
  title?: string;
  description?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
}

export default function StorePhotosGallery() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [storePhotos, setStorePhotos] = useState<StorePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch store photos from API
  useEffect(() => {
    const fetchStorePhotos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/shop/store-photos');
        const data = await response.json();
        
        if (data.success && data.data.photos) {
          setStorePhotos(data.data.photos);
        } else {
          setError('Failed to load store photos');
          setStorePhotos([]);
        }
      } catch (err) {
        console.error('Error fetching store photos:', err);
        setError('Failed to load store photos');
        setStorePhotos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStorePhotos();
  }, []);

  const getScrollAmount = () => {
    const el = carouselRef.current;
    if (!el) return 316;
    const card = el.querySelector<HTMLElement>(':scope > *');
    const styles = window.getComputedStyle(el);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '16') || 16;
    return (card?.offsetWidth || 300) + gap;
  };

  // Scroll carousel left with circular effect
  const scrollLeft = useCallback(() => {
    if (carouselRef.current && storePhotos.length > 0) {
      const scrollAmount = getScrollAmount();
      const isAtStart = carouselRef.current.scrollLeft <= 10;

      if (isAtStart) {
        const maxScrollPosition = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
        carouselRef.current.scrollTo({ left: maxScrollPosition, behavior: 'smooth' });
        setActiveIndex(Math.max(0, storePhotos.length - 1));
      } else {
        carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        setActiveIndex((current) => Math.max(0, current - 1));
      }
    }
  }, [storePhotos.length]);

  // Scroll carousel right with circular effect
  const scrollRight = useCallback(() => {
    if (carouselRef.current && storePhotos.length > 0) {
      const scrollAmount = getScrollAmount();
      const isAtEnd =
        carouselRef.current.scrollLeft >=
        carouselRef.current.scrollWidth - carouselRef.current.clientWidth - 10;

      if (isAtEnd) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        setActiveIndex(0);
      } else {
        carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        setActiveIndex((current) => Math.min(storePhotos.length - 1, current + 1));
      }
    }
  }, [storePhotos.length]);

  // Auto-scroll effect
  useEffect(() => {
    if (!isVisible || storePhotos.length === 0) return;
    
    const interval = setInterval(() => {
      scrollRight();
    }, 4000);
    
    return () => clearInterval(interval);
  }, [scrollRight, isVisible, storePhotos.length]);

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

  useEffect(() => {
    const el = carouselRef.current;
    if (!el || storePhotos.length === 0) return;
    const onScroll = () => {
      const styles = window.getComputedStyle(el);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || '16') || 16;
      const card = el.querySelector<HTMLElement>(':scope > *');
      const amount = (card?.offsetWidth || 300) + gap;
      const index = Math.min(
        storePhotos.length - 1,
        Math.max(0, Math.round(el.scrollLeft / amount))
      );
      setActiveIndex(index);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [storePhotos.length]);

  // Don't render section if no photos and not loading
  if (!isLoading && storePhotos.length === 0 && !error) {
    return null;
  }

  return (
    <section ref={sectionRef} className="relative py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Visit Our Store
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Take a look inside our Austin locations
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Photos Carousel */}
        {!isLoading && !error && storePhotos.length > 0 && (
          <div className="relative">
            {/* Desktop Navigation Arrows */}
            <div className="hidden md:block">
              <button
                type="button"
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-yellow-500 hover:text-white dark:hover:bg-yellow-500 transition-all duration-300 -translate-x-4"
                aria-label="Previous photos"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-yellow-500 hover:text-white dark:hover:bg-yellow-500 transition-all duration-300 translate-x-4"
                aria-label="Next photos"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Single carousel for all viewports so each photo is requested once,
                with sizes matching the actual 85vw / 300px tiles. */}
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory md:snap-none md:px-12"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {storePhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  className="flex-shrink-0 w-[85vw] snap-center md:w-[300px] md:snap-align-none"
                  initial={false}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                >
                  <div className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-[350px] md:h-[400px]">
                    <div className="relative w-full h-full">
                      <OptimizedImage
                        src={photo.url}
                        alt={photo.title || `Store photo ${index + 1}`}
                        context="gallery"
                        sizes="(max-width: 767px) 85vw, 300px"
                        quality={75}
                        priority={false}
                        loading="lazy"
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      {photo.title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <h3 className="text-white font-bold text-lg">{photo.title}</h3>
                          {photo.description && (
                            <p className="text-white/80 text-sm mt-1">{photo.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mobile Dots Indicator */}
            <div className="flex md:hidden justify-center gap-2 mt-6">
              {storePhotos.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === activeIndex ? 'w-8 bg-yellow-500' : 'w-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
