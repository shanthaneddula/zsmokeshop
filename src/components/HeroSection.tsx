'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { promoItems } from '@/data';

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoaded, setIsLoaded] = useState<boolean[]>(new Array(promoItems.length).fill(false));
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Preload all images
  useEffect(() => {
    promoItems.forEach((item, index) => {
      const img = new window.Image();
      img.src = item.image;
      img.onload = () => {
        setIsLoaded(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      };
    });
  }, []);

  // Auto-scroll every 5 seconds if not paused
  useEffect(() => {
    if (!isPaused && !isHovering) {
      slideTimerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % promoItems.length);
      }, 5000);
    }

    return () => {
      if (slideTimerRef.current) {
        clearInterval(slideTimerRef.current);
        slideTimerRef.current = null;
      }
    };
  }, [isPaused, isHovering]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promoItems.length);
    resetTimer();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promoItems.length) % promoItems.length);
    resetTimer();
  };

  const resetTimer = () => {
    if (slideTimerRef.current) {
      clearInterval(slideTimerRef.current);
      slideTimerRef.current = null;
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <section className="relative w-full bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 overflow-hidden">
      {/* Store Header */}
      <div className="relative z-10 pt-16 pb-8">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Z SMOKE SHOP
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Premium Smoke Shop & Accessories
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-3 md:space-y-0 md:space-x-8 text-sm md:text-base">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span>📍 719 W William Cannon Dr #105, Austin, TX</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span>📍 5318 Cameron Rd, Austin, TX</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Promotional Carousel */}
      <div className="relative z-10 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div 
              className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl bg-gray-800" 
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Loading state */}
              {!isLoaded.every(Boolean) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-20">
                  <div className="w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
                </div>
              )}
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0 w-full h-full"
                  style={{ position: 'relative', minHeight: '400px' }}
                >
                  {/* Background Image */}
                  {promoItems[currentSlide]?.image && isLoaded[currentSlide] ? (
                    <Image
                      src={promoItems[currentSlide].image}
                      alt={promoItems[currentSlide].title}
                      fill
                      className="object-cover"
                      priority={currentSlide === 0}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700" />
                  )}
                  
                  {/* Enhanced Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 md:p-12 flex items-center">
                    <div className="w-full md:w-2/3 lg:w-1/2 text-white">
                      <motion.h3 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 drop-shadow-lg leading-tight max-w-full break-words"
                      >
                        {promoItems[currentSlide].title}
                      </motion.h3>
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-base md:text-xl mb-6 md:mb-8 drop-shadow-lg text-gray-200 leading-relaxed max-w-full break-words"
                      >
                        {promoItems[currentSlide].description}
                      </motion.p>
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6"
                      >
                        {promoItems[currentSlide].discount && (
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-lg shadow-lg">
                            {promoItems[currentSlide].discount}
                          </span>
                        )}
                        <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold text-sm md:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                          {promoItems[currentSlide].cta}
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="absolute inset-0 flex items-center justify-between p-4 md:p-6 pointer-events-none">
                <button
                  onClick={prevSlide}
                  className="pointer-events-auto bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:scale-110"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="pointer-events-auto bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:scale-110"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
                {/* Slide Indicators */}
                <div className="flex space-x-2">
                  {promoItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentSlide(index);
                        resetTimer();
                      }}
                      className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Play/Pause Button */}
                <button
                  onClick={togglePause}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300"
                  aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}