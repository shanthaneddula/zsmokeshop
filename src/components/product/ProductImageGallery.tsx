'use client';

import { AdminProduct } from '@/types';
import { useState } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ProductImageGalleryProps {
  product: AdminProduct;
}

export default function ProductImageGallery({ product }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
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

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden group">
        <OptimizedImage
          src={images[selectedImageIndex]}
          alt={product.name}
          context="gallery"
          priority
          className="object-cover"
        />
        
        {/* Navigation Arrows - only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="
                absolute left-4 top-1/2 transform -translate-y-1/2
                bg-black/50 text-white p-2 opacity-0 group-hover:opacity-100
                transition-opacity duration-200 hover:bg-black/70
              "
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={nextImage}
              className="
                absolute right-4 top-1/2 transform -translate-y-1/2
                bg-black/50 text-white p-2 opacity-0 group-hover:opacity-100
                transition-opacity duration-200 hover:bg-black/70
              "
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 text-sm">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Grid - only show if multiple images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`
                relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden
                border-2 transition-colors duration-200
                ${selectedImageIndex === index 
                  ? 'border-gray-900 dark:border-white' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
            >
              <OptimizedImage
                src={image}
                alt={`${product.name} - Image ${index + 1}`}
                context="thumbnail"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Product Badges Overlay */}
      {product.badges && product.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {product.badges.map((badge) => (
            <span
              key={badge}
              className={`
                px-2 py-1 text-xs font-bold uppercase tracking-wide
                ${badge === 'best-seller' ? 'bg-yellow-400 text-gray-900' : ''}
                ${badge === 'new' ? 'bg-green-600 text-white' : ''}
                ${badge === 'sale' ? 'bg-red-600 text-white' : ''}
                ${badge === 'limited' ? 'bg-purple-600 text-white' : ''}
                ${!['best-seller', 'new', 'sale', 'limited'].includes(badge) ? 'bg-gray-600 text-white' : ''}
              `}
            >
              {badge.replace('-', ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
