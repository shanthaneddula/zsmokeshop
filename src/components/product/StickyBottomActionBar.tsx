'use client';

import { AdminProduct } from '@/types';
import { useState } from 'react';
import { formatPrice } from '@/lib/product-utils';
import { ShoppingCartIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface StickyBottomActionBarProps {
  product: AdminProduct;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

export default function StickyBottomActionBar({ 
  product, 
  onAddToCart,
  isAddingToCart 
}: StickyBottomActionBarProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const finalPrice = product.salePrice || product.price;

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    console.log(`${isWishlisted ? 'Removed from' : 'Added to'} wishlist: ${product.name}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} at Z Smoke Shop`,
          url: window.location.href,
        });
      } catch {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Product link copied to clipboard!');
      } catch {
        console.error('Failed to copy link');
      }
    }
  };

  return (
    <>
      {/* Mobile Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-40">
        {/* Main Action Bar */}
        <div className="flex items-center p-4 gap-3">
          {/* Price Display */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black text-gray-900 dark:text-white">
                {formatPrice(finalPrice)}
              </span>
              {product.salePrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button - Mobile Only */}
          <div className="flex items-center">
            {/* Add to Cart Button */}
            <button
              onClick={onAddToCart}
              disabled={!product.inStock || isAddingToCart}
              className={`
                px-6 py-3 font-black uppercase tracking-wide text-sm transition-colors
                flex items-center space-x-2 min-w-[120px] justify-center
                ${product.inStock && !isAddingToCart
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }
              `}
            >
              {isAddingToCart ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCartIcon className="w-5 h-5" />
                  <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Actions - Hidden on mobile */}
      <div className="hidden md:block space-y-6">
        {/* Desktop Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onAddToCart}
            disabled={!product.inStock || isAddingToCart}
            className={`
              w-full py-4 px-6 font-black uppercase tracking-wide text-sm transition-colors duration-200
              flex items-center justify-center space-x-2
              ${product.inStock && !isAddingToCart
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }
            `}
          >
            {isAddingToCart ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCartIcon className="w-5 h-5" />
                <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleWishlist}
              className="py-3 px-4 border-2 border-gray-900 dark:border-white font-black uppercase tracking-wide text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isWishlisted ? (
                <HeartIconSolid className="w-5 h-5 text-red-600" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">
                {isWishlisted ? 'Saved' : 'Save'}
              </span>
            </button>
            <button
              onClick={handleShare}
              className="py-3 px-4 border-2 border-gray-900 dark:border-white font-black uppercase tracking-wide text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <ShareIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
