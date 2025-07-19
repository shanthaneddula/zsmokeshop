"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Star, Tag, Crown, Zap } from "lucide-react";

// Product category showcases - Adidas-inspired approach
const productCategories = [
  {
    id: 1,
    category: "NEW ARRIVALS",
    title: "Latest Premium Collection",
    description: "Get ahead of the trends with our newest high-quality vapes, glass pieces, and accessories.",
    buttonText: "SHOP NOW",
    buttonLink: "/category/new-arrivals",
    image: "/images/categories/new-arrivals.jpg", // Placeholder - to be replaced with actual product images
    alt: "New arrivals showcase",
    icon: Sparkles,
    gradient: "from-purple-600 to-blue-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20",
  },
  {
    id: 2,
    category: "FEATURED PRODUCTS",
    title: "Customer Favorites",
    description: "Discover our most popular and highest-rated products chosen by our community.",
    buttonText: "SHOP NOW",
    buttonLink: "/category/featured",
    image: "/images/categories/featured.jpg", // Placeholder
    alt: "Featured products showcase",
    icon: Star,
    gradient: "from-orange-600 to-red-600",
    bgColor: "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
  },
  {
    id: 3,
    category: "SPECIAL OFFERS",
    title: "Limited Time Deals",
    description: "Save big on premium products with our exclusive promotions and seasonal discounts.",
    buttonText: "SHOP NOW",
    buttonLink: "/deals",
    image: "/images/categories/deals.jpg", // Placeholder
    alt: "Special offers showcase",
    icon: Tag,
    gradient: "from-green-600 to-emerald-600",
    bgColor: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
  },
  {
    id: 4,
    category: "DAB RIGS: PUFFCO",
    title: "Puffco Peak",
    description: "Experience the ultimate in concentrate consumption with the revolutionary Puffco Peak electronic rig.",
    buttonText: "SHOP NOW",
    buttonLink: "/category/dab-rigs",
    image: "/images/products/puffco-peak-onyx.webp", // Real product image
    alt: "Puffco Peak electronic dab rig",
    icon: Zap,
    gradient: "from-slate-600 to-gray-800",
    bgColor: "bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/20 dark:to-gray-900/20",
    hasRealImage: true, // Flag to indicate this has a real product image
  },
  {
    id: 5,
    category: "PREMIUM COLLECTION",
    title: "Luxury Glass & Devices",
    description: "Experience the finest craftsmanship with our premium glass pieces and high-end devices.",
    buttonText: "SHOP NOW",
    buttonLink: "/category/premium",
    image: "/images/categories/premium.jpg", // Placeholder
    alt: "Premium collection showcase",
    icon: Crown,
    gradient: "from-amber-600 to-yellow-600",
    bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20",
  },
];

export default function HeroSection() {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Autoplay functionality
  useEffect(() => {
    if (!isAutoplay || isDragging) return;
    
    const interval = setInterval(() => {
      setCurrentCategory((prev) => (prev + 1) % productCategories.length);
    }, 6000); // Slightly longer for card-based content
    
    return () => clearInterval(interval);
  }, [isAutoplay, isDragging]);

  // Pause autoplay on hover/interaction
  const handleMouseEnter = () => setIsAutoplay(false);
  const handleMouseLeave = () => setIsAutoplay(true);
  
  // Navigation functions
  const nextCategory = () => {
    setCurrentCategory((prev) => (prev + 1) % productCategories.length);
  };
  
  const prevCategory = () => {
    setCurrentCategory((prev) => (prev - 1 + productCategories.length) % productCategories.length);
  };

  // Handle touch/drag events for mobile
  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsDragging(false), 100);
  };

  return (
    <section className="relative bg-black min-h-[100svh] flex flex-col overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/smoke.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Dark Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      {/* Hero Content - Top Section */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-4 pt-16 sm:pt-20 md:pt-24">
        <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl mb-6 sm:mb-8 tracking-tight drop-shadow-2xl">
          Z SMOKE SHOP
        </h1>
        <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto font-medium drop-shadow-lg">
          Austin&apos;s premier destination for quality smoke products and accessories
        </p>
      </div>

      {/* Product Category Showcase - Bottom Section */}
      <div className="relative z-10 pb-8 sm:pb-12 md:pb-16">
      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile: Single Card Carousel */}
        <div className="block lg:hidden">
          <div className="relative overflow-hidden">
            <motion.div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentCategory * 100}%)` }}
              ref={scrollContainerRef}
            >
              {productCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div key={category.id} className="w-full flex-shrink-0 px-4">
                    {category.hasRealImage ? (
                      /* Full-width product showcase */
                      <div className="relative h-[350px] xs:h-[380px] sm:h-[420px] overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 transition-all hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:shadow-white/10">
                        {/* Large Product Image Background */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-full h-full">
                            <Image
                              src={category.image}
                              alt={category.alt}
                              fill
                              className="object-contain scale-75 opacity-20"
                              sizes="100vw"
                            />
                          </div>
                        </div>
                        
                        {/* Content Overlay */}
                        <div className="relative z-10 flex h-full flex-col justify-between p-6">
                          {/* Top Section */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${category.gradient} text-white shadow-lg`}>
                                <IconComponent className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                  {category.category}
                                </p>
                              </div>
                            </div>
                            
                            {/* Category indicator */}
                            <div className="flex items-center gap-1">
                              {productCategories.map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-2 w-2 rounded-full transition-all ${
                                    i === currentCategory ? 'bg-gray-800 dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Center - Large Product Image */}
                          <div className="flex-1 flex items-center justify-center">
                            <div className="relative w-full max-w-xs">
                              <Image
                                src={category.image}
                                alt={category.alt}
                                width={250}
                                height={250}
                                className="object-contain w-full h-auto"
                                sizes="250px"
                              />
                            </div>
                          </div>

                          {/* Bottom Section */}
                          <div className="text-center">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                              {category.title}
                            </h3>
                            <p className="text-sm text-white/80 mb-4 sm:mb-6 leading-relaxed max-w-sm mx-auto">
                              {category.description}
                            </p>
                            
                            <Link
                              href={category.buttonLink}
                              className="inline-flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white transition-all hover:bg-white/30 hover:border-white/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
                            >
                              <span>{category.buttonText}</span>
                              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Icon-based categories */
                      <div className="relative h-[350px] xs:h-[380px] sm:h-[420px] overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 transition-all hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:shadow-white/10">
                        <div className="relative z-10 flex h-full flex-col justify-between p-6">
                          {/* Same structure as above but with icon */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${category.gradient} text-white shadow-lg`}>
                                <IconComponent className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                  {category.category}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {productCategories.map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-2 w-2 rounded-full transition-all ${
                                    i === currentCategory ? 'bg-gray-800 dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex-1 flex items-center justify-center">
                            <div className="relative">
                              <div className="h-48 w-48 rounded-2xl bg-white/80 dark:bg-gray-800/80 shadow-2xl flex items-center justify-center">
                                <IconComponent className="h-24 w-24 text-gray-400" />
                              </div>
                              <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg" />
                              <div className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-gradient-to-r from-accent-500 to-accent-600 shadow-lg" />
                            </div>
                          </div>

                          <div className="text-center">
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                              {category.title}
                            </h3>
                            <p className="text-sm sm:text-base text-white/80 mb-4 sm:mb-6 leading-relaxed max-w-md mx-auto">
                              {category.description}
                            </p>
                            
                            <Link
                              href={category.buttonLink}
                              className="inline-flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white transition-all hover:bg-white/30 hover:border-white/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
                            >
                              <span>{category.buttonText}</span>
                              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Desktop: Horizontal Scrolling Cards */}
        <div className="hidden lg:block">
          <div className="relative overflow-hidden">
            <motion.div 
              className="flex transition-transform duration-500 ease-out px-4"
              style={{ transform: `translateX(-${currentCategory * 25}%)` }}
            >
              {productCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div key={category.id} className="w-1/4 flex-shrink-0 px-2">
                    {category.hasRealImage ? (
                      /* Full-width product showcase */
                      <div className="relative h-[400px] xl:h-[450px] overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 transition-all hover:scale-[1.02] hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:shadow-white/10">
                        {/* Content Overlay */}
                        <div className="relative z-10 flex h-full flex-col justify-between p-6">
                          {/* Top Section */}
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r ${category.gradient} text-white shadow-lg`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                                {category.category}
                              </p>
                            </div>
                          </div>

                          {/* Center - Large Product Image */}
                          <div className="flex-1 flex items-center justify-center">
                            <div className="relative w-full max-w-xs">
                              <Image
                                src={category.image}
                                alt={category.alt}
                                width={250}
                                height={250}
                                className="object-contain w-full h-auto"
                                sizes="250px"
                              />
                            </div>
                          </div>

                          {/* Bottom Section */}
                          <div className="text-center">
                            <h3 className="text-xl font-bold text-white mb-2">
                              {category.title}
                            </h3>
                            <p className="text-sm text-white/80 mb-4 leading-relaxed">
                              {category.description}
                            </p>
                            
                            <Link
                              href={category.buttonLink}
                              className="inline-flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/30 hover:border-white/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
                            >
                              <span>{category.buttonText}</span>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Icon-based categories */
                      <div className="relative h-[400px] xl:h-[450px] overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 transition-all hover:scale-[1.02] hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:shadow-white/10">
                        <div className="relative z-10 flex h-full flex-col justify-between p-8">
                          {/* Top Section */}
                          <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${category.gradient} text-white shadow-lg`}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                                {category.category}
                              </p>
                            </div>
                          </div>

                          {/* Center - Large Icon */}
                          <div className="flex-1 flex items-center justify-center">
                            <div className="relative">
                              <IconComponent className="h-24 w-24 sm:h-32 sm:w-32 text-white/60" />
                              {/* Decorative elements */}
                              <div className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg" />
                              <div className="absolute -bottom-4 -left-4 h-6 w-6 rounded-full bg-gradient-to-r from-accent-500 to-accent-600 shadow-lg" />
                            </div>
                          </div>

                          {/* Bottom Section */}
                          <div className="text-center">
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                              {category.title}
                            </h3>
                            <p className="text-sm sm:text-base text-white/80 mb-4 sm:mb-6 leading-relaxed max-w-md mx-auto">
                              {category.description}
                            </p>
                            
                            <Link
                              href={category.buttonLink}
                              className="inline-flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/30 hover:border-white/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
                            >
                              <span>{category.buttonText}</span>
                              <ChevronRight className="h-5 w-5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute top-1/2 left-4 right-4 flex justify-between items-center pointer-events-none">
          <button
            onClick={prevCategory}
            className="pointer-events-auto rounded-full bg-white/90 dark:bg-gray-800/90 p-3 text-gray-900 dark:text-white shadow-lg transition-all hover:bg-white dark:hover:bg-gray-800 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Previous category"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextCategory}
            className="pointer-events-auto rounded-full bg-white/90 dark:bg-gray-800/90 p-3 text-gray-900 dark:text-white shadow-lg transition-all hover:bg-white dark:hover:bg-gray-800 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Next category"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation Dots */}
      <div className="container-wide mt-4 sm:mt-6 pb-6 sm:pb-8 flex justify-center">
        <div className="flex items-center gap-3">
          {productCategories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCategory(index)}
              className={`h-4 w-4 rounded-full transition-all duration-300 ${
                index === currentCategory 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-gray-400 hover:bg-gray-200 hover:scale-110'
              }`}
              aria-label={`Go to ${productCategories[index].category}`}
            />
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}