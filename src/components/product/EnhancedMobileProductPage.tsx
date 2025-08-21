'use client';

import { AdminProduct } from '@/types';
import { useState } from 'react';
import { 
  HeartIcon,
  ShareIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import OptimizedImage from '@/components/ui/OptimizedImage';
import ExpandableDescription from './ExpandableDescription';

interface EnhancedMobileProductPageProps {
  product: AdminProduct;
}

export default function EnhancedMobileProductPage({ product }: EnhancedMobileProductPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);


  // Get images array
  const images = product.imageHistory && product.imageHistory.length > 0 
    ? product.imageHistory 
    : product.image 
    ? [product.image] 
    : ['/images/placeholder-product.jpg'];

  // Mock data for demo
  const rating = 4.5;
  const reviewCount = 127;
  const originalPrice = product.salePrice ? parseFloat(String(product.price)) * 1.2 : null;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsAddingToCart(false);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} at Z Smoke Shop`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => window.history.back()}
            className="p-2 -ml-2 text-gray-900 dark:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleWishlist}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
            >
              {isWishlisted ? (
                <HeartSolidIcon className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6" />
              )}
            </button>
            <button 
              onClick={handleShare}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ShareIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Images */}
      <div className="relative">
        <div className="aspect-square bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
          <OptimizedImage
            src={images[selectedImageIndex]}
            alt={product.name}
            context="gallery"
            priority
            className="object-cover w-full h-full"
          />
          
          {/* Product Badges */}
          {product.badges && product.badges.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.badges.slice(0, 2).map((badge) => (
                <span
                  key={badge}
                  className={`
                    px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full
                    ${badge === 'best-seller' ? 'bg-amber-400 text-gray-900' : ''}
                    ${badge === 'new' ? 'bg-green-500 text-white' : ''}
                    ${badge === 'sale' ? 'bg-red-500 text-white' : ''}
                    ${badge === 'limited' ? 'bg-purple-600 text-white' : ''}
                  `}
                >
                  {badge.replace('-', ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Image Navigation Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === selectedImageIndex 
                      ? 'bg-white w-6' 
                      : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex space-x-2 p-4 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  index === selectedImageIndex 
                    ? 'border-gray-900 dark:border-white' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <OptimizedImage
                  src={image}
                  alt={`${product.name} - View ${index + 1}`}
                  context="thumbnail"
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="px-4 py-6 space-y-6">
        {/* Brand & Title */}
        <div className="space-y-2">
          {product.brand && (
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {product.brand}
            </p>
          )}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {product.name}
          </h1>
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <StarSolidIcon
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'
                }`}
              />
            ))}
            <span className="text-sm font-medium text-gray-900 dark:text-white ml-1">
              {rating}
            </span>
          </div>
          <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            ({reviewCount} reviews)
          </button>
        </div>

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              ${product.salePrice || product.price}
            </span>
            {originalPrice && (
              <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            {product.salePrice && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                SAVE ${(originalPrice! - parseFloat(String(product.salePrice))).toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tax included • Free pickup in store
          </p>
        </div>

        {/* Stock Status */}
        <div className="flex items-center space-x-2">
          {product.inStock ? (
            <>
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                In Stock - Ready for pickup
              </span>
            </>
          ) : (
            <>
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Out of Stock
              </span>
            </>
          )}
        </div>

        {/* Enhanced Description */}
        {(product.shortDescription?.trim() || product.detailedDescription?.trim()) && (
          <ExpandableDescription 
            shortDescription={product.shortDescription}
            detailedDescription={product.detailedDescription}
          />
        )}

        {/* Key Features */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Product Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">
                SKU
              </p>
              <p className="text-gray-900 dark:text-white font-medium">
                {product.sku}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">
                Category
              </p>
              <p className="text-gray-900 dark:text-white font-medium capitalize">
                {product.category?.replace('-', ' ')}
              </p>
            </div>
            {product.weight && (
              <div className="space-y-1">
                <p className="text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">
                  Weight
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {product.weight}
                </p>
              </div>
            )}
            {product.dimensions && (
              <div className="space-y-1">
                <p className="text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">
                  Dimensions
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {product.dimensions}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Age Verification Notice */}
        {product.ageRestriction && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-200 text-sm">
                  Age Verification Required
                </h4>
                <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                  You must be {String(product.ageRestriction)}+ to purchase this product. Valid ID required.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Store Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-white">
            Available at Z Smoke Shop
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Store Hours:</span>
              <span className="font-medium text-gray-900 dark:text-white">Mon-Fri 10AM-9PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Location:</span>
              <span className="font-medium text-gray-900 dark:text-white">Austin, TX</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Phone:</span>
              <a href="tel:(661) 371-1413" className="font-medium text-gray-900 dark:text-white hover:underline">
                (661) 371-1413
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 z-50">
        <div className="flex items-center space-x-3">
          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="px-4 py-3 font-medium text-gray-900 dark:text-white min-w-[3rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-4 px-6 rounded-lg font-bold uppercase tracking-wide text-sm transition-all duration-200
              ${product.inStock && !isAddingToCart
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingBagIcon className="w-5 h-5" />
                <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Padding for Sticky Bar */}
      <div className="h-20" />
    </div>
  );
}
