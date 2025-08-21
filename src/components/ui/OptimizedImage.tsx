"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Context types for different image usage scenarios
 * Each context has optimized sizes prop for performance
 */
export type ImageContext = 
  | 'thumbnail'      // Admin thumbnails (64x64)
  | 'card'           // Product cards in grid layout
  | 'gallery'        // Main product images
  | 'hero'           // Hero sections and banners
  | 'admin-thumb'    // Admin interface thumbnails
  | 'preview'        // Modal previews
  | 'featured'       // Featured product carousel
  | 'related';       // Related products section

/**
 * Props interface for OptimizedImage component
 */
export interface OptimizedImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Context determines optimal sizing strategy */
  context: ImageContext;
  /** Whether this image should be prioritized for loading */
  priority?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether to fill the parent container */
  fill?: boolean;
  /** Custom sizes prop (overrides context-based sizing) */
  sizes?: string;
  /** Loading behavior */
  loading?: 'lazy' | 'eager';
  /** Image quality (1-100) */
  quality?: number;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
}

/**
 * Context-based sizing configuration
 * Optimized for different usage scenarios and screen sizes
 */
const CONTEXT_SIZES: Record<ImageContext, string> = {
  'thumbnail': '64px',                                      // Fixed admin thumbnails
  'card': '(max-width: 768px) 50vw, 25vw',                // Responsive product cards
  'gallery': '(max-width: 768px) 100vw, 50vw',            // Main product display
  'hero': '(max-width: 768px) 100vw, 1200px',             // Hero sections
  'admin-thumb': '64px',                                    // Admin interface
  'preview': '300px',                                       // Modal previews
  'featured': '(max-width: 768px) 256px, 288px',          // Featured carousel
  'related': '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw' // Related products
};

/**
 * Contexts that should have priority loading (above the fold)
 */
const PRIORITY_CONTEXTS: ImageContext[] = ['hero'];

/**
 * Default quality settings per context
 */
const CONTEXT_QUALITY: Record<ImageContext, number> = {
  'thumbnail': 70,      // Lower quality for small thumbnails
  'card': 80,           // Good quality for product cards
  'gallery': 90,        // High quality for main images
  'hero': 95,           // Highest quality for hero images
  'admin-thumb': 70,    // Lower quality for admin interface
  'preview': 85,        // Good quality for previews
  'featured': 85,       // Good quality for featured products
  'related': 80         // Good quality for related products
};

/**
 * OptimizedImage Component
 * 
 * A centralized image component that automatically applies performance optimizations
 * based on usage context. Eliminates the need for manual sizes prop calculation
 * and ensures consistent image performance across the application.
 * 
 * @example
 * ```tsx
 * // Product card usage
 * <OptimizedImage 
 *   src="/images/products/product.webp" 
 *   alt="Product Name"
 *   context="card"
 *   className="rounded-lg"
 * />
 * 
 * // Hero image with priority
 * <OptimizedImage 
 *   src="/images/hero.webp" 
 *   alt="Hero Image"
 *   context="hero"
 *   priority={true}
 * />
 * 
 * // Admin thumbnail
 * <OptimizedImage 
 *   src="/images/admin/general/thumb.webp" 
 *   alt="Product Thumbnail"
 *   context="admin-thumb"
 * />
 * ```
 */
export default function OptimizedImage({
  src,
  alt,
  context,
  priority,
  className = "",
  fill = true,
  sizes: customSizes,
  loading,
  quality,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determine optimal sizes based on context
  const optimalSizes = customSizes || CONTEXT_SIZES[context];
  
  // Determine if priority should be applied
  const shouldPrioritize = priority ?? PRIORITY_CONTEXTS.includes(context);
  
  // Determine optimal quality based on context
  const optimalQuality = quality ?? CONTEXT_QUALITY[context];
  
  // Determine loading strategy
  const loadingStrategy = loading ?? (shouldPrioritize ? 'eager' : 'lazy');

  /**
   * Handle image load success
   */
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  /**
   * Handle image load error
   */
  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  /**
   * Generate fallback content for failed images
   */
  const renderFallback = () => {
    const fallbackText = alt.split(' ').slice(0, 2).join(' ').toUpperCase();
    
    return (
      <div className={`
        w-full h-full bg-gray-200 dark:bg-gray-700 
        flex items-center justify-center
        ${className}
      `}>
        <div className="text-center p-2">
          <div className="w-8 h-8 mx-auto mb-2 bg-gray-400 dark:bg-gray-600 rounded" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {fallbackText || 'IMAGE'}
          </span>
        </div>
      </div>
    );
  };

  /**
   * Render loading placeholder
   */
  const renderLoadingPlaceholder = () => (
    <div className={`
      w-full h-full bg-gray-100 dark:bg-gray-800 
      animate-pulse flex items-center justify-center
      ${className}
    `}>
      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-spin" />
    </div>
  );

  // Return fallback if image failed to load
  if (imageError) {
    return renderFallback();
  }

  return (
    <>
      {/* Loading placeholder */}
      {isLoading && renderLoadingPlaceholder()}
      
      {/* Optimized Image */}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={optimalSizes}
        priority={shouldPrioritize}
        loading={loadingStrategy}
        quality={optimalQuality}
        className={`
          ${className}
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          transition-opacity duration-300
        `}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}

/**
 * Utility function to get optimal sizes for a given context
 * Useful for debugging or custom implementations
 */
export function getOptimalSizes(context: ImageContext): string {
  return CONTEXT_SIZES[context];
}

/**
 * Utility function to check if a context should have priority loading
 */
export function shouldHavePriority(context: ImageContext): boolean {
  return PRIORITY_CONTEXTS.includes(context);
}

/**
 * Utility function to get recommended quality for a context
 */
export function getRecommendedQuality(context: ImageContext): number {
  return CONTEXT_QUALITY[context];
}
