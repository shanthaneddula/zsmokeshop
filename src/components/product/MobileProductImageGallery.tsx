'use client';

import { AdminProduct } from '@/types';
import { useState, useRef } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface MobileProductImageGalleryProps {
  product: AdminProduct;
}

export default function MobileProductImageGallery({ product }: MobileProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  
  // Use imageHistory if available, otherwise fallback to single image
  const images = product.imageHistory && product.imageHistory.length > 0 
    ? product.imageHistory 
    : product.image 
    ? [product.image] 
    : ['/images/placeholder-product.jpg'];

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      nextImage();
    }
    if (isRightSwipe && images.length > 1) {
      prevImage();
    }
  };

  const handleImageTap = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <>
      {/* Main Image Gallery */}
      <div className="relative">
        {/* Image Container - Square aspect ratio like related products */}
        <div 
          className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden group cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleImageTap}
        >
          <OptimizedImage
            src={images[selectedImageIndex]}
            alt={product.name}
            context="gallery"
            priority
            className={`object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
          />
          
          {/* Product Badges - Mobile positioned */}
          {product.badges && product.badges.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
              {product.badges.slice(0, 2).map((badge) => (
                <span
                  key={badge}
                  className={`
                    px-2 py-1 text-xs font-bold uppercase tracking-wide rounded-sm
                    ${badge === 'best-seller' ? 'bg-yellow-400 text-gray-900' : ''}
                    ${badge === 'new' ? 'bg-green-600 text-white' : ''}
                    ${badge === 'sale' ? 'bg-red-600 text-white' : ''}
                    ${badge === 'limited' ? 'bg-purple-600 text-white' : ''}
                  `}
                >
                  {badge.replace('-', ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Navigation Arrows - Hidden on mobile, shown on desktop */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="
                  absolute left-2 top-1/2 transform -translate-y-1/2
                  bg-black/50 text-white p-2 rounded-full
                  opacity-0 group-hover:opacity-100 transition-opacity
                  hidden md:block
                "
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="
                  absolute right-2 top-1/2 transform -translate-y-1/2
                  bg-black/50 text-white p-2 rounded-full
                  opacity-0 group-hover:opacity-100 transition-opacity
                  hidden md:block
                "
                aria-label="Next image"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Zoom Indicator */}
          {isZoomed && (
            <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
              Tap to zoom out
            </div>
          )}
        </div>

        {/* Image Dots Indicator */}
        {images.length > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`
                  w-2 h-2 rounded-full transition-colors
                  ${index === selectedImageIndex 
                    ? 'bg-gray-900 dark:bg-white' 
                    : 'bg-gray-300 dark:bg-gray-600'
                  }
                `}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Swipe Instruction - Only show on mobile with multiple images */}
        {images.length > 1 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 md:hidden">
            Swipe left or right to view more images
          </p>
        )}
      </div>

      {/* Zoom Modal for Mobile */}
      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:hidden"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <OptimizedImage
              src={images[selectedImageIndex]}
              alt={product.name}
              context="gallery"
              className="object-contain"
            />
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
