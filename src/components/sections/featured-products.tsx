"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  description: string;
}

const featuredProducts: Product[] = [
  {
    id: "1",
    name: "Puffco Peak Pro",
    price: "$$$",
    rating: 4.8,
    reviewCount: 124,
    image: "/images/products/puffco-peak-pro.webp",
    category: "Dab Rigs",
    isBestSeller: true,
    description: "Premium electronic dab rig with smart temperature control"
  },
  {
    id: "2",
    name: "Diamond Glass",
    price: "$$",
    rating: 4.7,
    reviewCount: 89,
    image: "/images/products/Diamond_Glass.webp",
    category: "Glass",
    isBestSeller: true,
    description: "Premium borosilicate glass water pipe with diamond cut design"
  },
  {
    id: "3",
    name: "Empire Hookah",
    price: "$$$",
    rating: 4.6,
    reviewCount: 56,
    image: "/images/products/EmpireHookah.webp",
    category: "Hookahs",
    isNew: true,
    description: "Traditional hookah with modern engineering and premium materials"
  },
  {
    id: "4",
    name: "Flying Monkey",
    price: "$",
    rating: 4.5,
    reviewCount: 203,
    image: "/images/products/Flying Monkey.webp",
    category: "Edibles",
    isBestSeller: true,
    description: "Premium cannabis edibles with consistent dosing and great taste"
  },
  {
    id: "5",
    name: "Foger Vape",
    price: "$",
    rating: 4.3,
    reviewCount: 178,
    image: "/images/products/foger.webp",
    category: "Vapes",
    isNew: true,
    description: "Disposable vape pen with premium flavors and smooth draw"
  },
  {
    id: "6",
    name: "FVKD Premium",
    price: "$$",
    rating: 4.8,
    reviewCount: 142,
    image: "/images/products/FVKD-1.webp",
    category: "Vapes",
    isBestSeller: true,
    description: "High-quality vape cartridge with pure extracts and bold flavors"
  },
  {
    id: "7",
    name: "Half Bakd",
    price: "$",
    rating: 4.4,
    reviewCount: 215,
    image: "/images/products/HALF_BAKED.webp",
    category: "Edibles",
    isBestSeller: true,
    description: "Artisanal cannabis edibles made with premium ingredients"
  },
  {
    id: "8",
    name: "Hand Pipes",
    price: "$$",
    rating: 4.6,
    reviewCount: 89,
    image: "/images/products/HANDPIPE.webp",
    category: "Glass",
    isNew: true,
    description: "Handcrafted glass pipes with unique designs and smooth hits"
  },
  {
    id: "9",
    name: "Road Trip Mushrooms",
    price: "$$",
    rating: 4.7,
    reviewCount: 67,
    image: "/images/products/RoadTrip.webp",
    category: "Mushrooms",
    isNew: true,
    description: "Premium psilocybin mushrooms for therapeutic and recreational use"
  },
  {
    id: "10",
    name: "Sweet Sensei Edibles",
    price: "$$",
    rating: 4.9,
    reviewCount: 156,
    image: "/images/products/SweetSensei_ElevatedEdibles.webp",
    category: "Edibles",
    isBestSeller: true,
    description: "Elevated edibles with precise dosing and gourmet flavors"
  },
  {
    id: "11",
    name: "Numbz 7OH",
    price: "$$$",
    rating: 4.5,
    reviewCount: 98,
    image: "/images/products/NUMBZ 7OH.webp",
    category: "Supplements",
    isNew: true,
    description: "Premium 7-hydroxymitragynine supplement for relaxation and wellness"
  }
];

export default function FeaturedProducts() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  


  // Scroll carousel left
  const scrollLeft = useCallback(() => {
    if (carouselRef.current) {
      const newIndex = activeIndex === 0 ? featuredProducts.length - 4 : activeIndex - 1;
      setActiveIndex(newIndex);
      const scrollAmount = carouselRef.current.offsetWidth / 4;
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }, [activeIndex]);

  // Scroll carousel right
  const scrollRight = useCallback(() => {
    if (carouselRef.current) {
      const newIndex = (activeIndex + 1) % (featuredProducts.length - 3);
      setActiveIndex(newIndex);
      const scrollAmount = carouselRef.current.offsetWidth / 4;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, [activeIndex]);
  
  // Auto-cycle carousel
  useEffect(() => {
    const interval = setInterval(() => {
      scrollRight();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [scrollRight]);
  
  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    // Observe the section container instead of specific carousel refs
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

  return (
    <section ref={sectionRef} className="min-h-[80vh] py-12 md:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 uppercase tracking-widest">
            Featured Products
          </h2>
          <div className="w-16 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-6 md:mb-8"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-base md:text-lg font-light px-4">
            Discover our most popular and newest arrivals
          </p>
        </motion.div>

        {/* Mobile Carousel - Single Column */}
        <div className="block md:hidden">
          <motion.div 
            ref={mobileCarouselRef}
            className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-hide"
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {featuredProducts.map((product) => (
              <motion.div
                key={product.id}
                className="group relative flex-none w-64 sm:w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 snap-start"
                whileHover={{ y: -5 }}
              >
                {/* Product Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {product.isBestSeller && (
                    <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-2 py-1 uppercase tracking-wide">
                      Best Seller
                    </span>
                  )}
                  {product.isNew && (
                    <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-2 py-1 uppercase tracking-wide">
                      New
                    </span>
                  )}
                </div>

                {/* Product Image */}
                <div className="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide text-sm">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through font-light">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 px-4 font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors uppercase tracking-wide text-sm border border-gray-900 dark:border-white">
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Desktop Carousel - With Navigation */}
        <div className="hidden md:block relative">
          {/* Left Navigation Arrow */}
          <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Previous products"
          >
            <ChevronLeft className="h-5 w-5 text-gray-900 dark:text-white" />
          </button>

          {/* Products Carousel */}
          <motion.div 
            ref={carouselRef}
            className="flex gap-6 overflow-x-hidden px-12"
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {featuredProducts.map((product) => (
              <motion.div
                key={product.id}
                className="group flex-none w-[calc(25%-18px)] max-w-[300px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                {/* Product Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {product.isBestSeller && (
                    <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-3 py-1 uppercase tracking-wide">
                      Best Seller
                    </span>
                  )}
                  {product.isNew && (
                    <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-3 py-1 uppercase tracking-wide">
                      New
                    </span>
                  )}
                </div>

                {/* Product Image */}
                <div className="relative w-full h-52 overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide text-sm">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through font-light">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 px-4 font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors uppercase tracking-wide text-sm border border-gray-900 dark:border-white">
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Right Navigation Arrow */}
          <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Next products"
          >
            <ChevronRight className="h-5 w-5 text-gray-900 dark:text-white" />
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
          className="text-center mt-12 md:mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link href="/products">
            <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-8 md:px-12 py-3 md:py-4 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors uppercase tracking-wide text-sm border border-gray-900 dark:border-white">
              View All Products
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
