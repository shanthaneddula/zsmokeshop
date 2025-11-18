'use client';

import { AdminProduct } from '@/types';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { HeartIcon, ShareIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface ProductActionsProps {
  product: AdminProduct;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    try {
      addToCart(product, quantity);
      // Show success feedback
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
    
    setIsAddingToCart(false);
    // Reset quantity after adding
    setQuantity(1);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // Here you would typically save to localStorage or user account
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
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Product link copied to clipboard!');
      } catch {
        console.error('Failed to copy link');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Quantity Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-black uppercase tracking-wide text-gray-900 dark:text-white">
          Quantity
        </label>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="
              w-10 h-10 border border-gray-300 dark:border-gray-600 
              flex items-center justify-center font-bold text-gray-900 dark:text-white
              hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
            "
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="w-16 text-center font-bold text-gray-900 dark:text-white">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="
              w-10 h-10 border border-gray-300 dark:border-gray-600 
              flex items-center justify-center font-bold text-gray-900 dark:text-white
              hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
            "
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || isAddingToCart}
          className={`
            w-full py-4 px-6 font-black uppercase tracking-wide text-sm
            transition-colors duration-200 flex items-center justify-center space-x-2
            ${product.inStock 
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100' 
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <ShoppingCartIcon className="w-5 h-5" />
          <span>
            {isAddingToCart 
              ? 'Adding...' 
              : product.inStock 
              ? 'Add to Cart' 
              : 'Out of Stock'
            }
          </span>
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="
              py-3 px-4 border-2 border-gray-900 dark:border-white
              font-black uppercase tracking-wide text-sm
              text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800
              transition-colors duration-200 flex items-center justify-center space-x-2
            "
          >
            {isWishlisted ? (
              <HeartIconSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">
              {isWishlisted ? 'Saved' : 'Save'}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="
              py-3 px-4 border-2 border-gray-900 dark:border-white
              font-black uppercase tracking-wide text-sm
              text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800
              transition-colors duration-200 flex items-center justify-center space-x-2
            "
          >
            <ShareIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Store Pickup Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-blue-800 dark:text-blue-200 text-sm uppercase tracking-wide">
              Store Pickup Available
            </h5>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Order online and pick up at our Austin location. Ready in 1-2 hours during business hours.
            </p>
          </div>
        </div>
      </div>

      {/* Contact for Questions */}
      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Questions about this product?
        </p>
        <a
          href="/support"
          className="
            text-sm font-medium text-gray-900 dark:text-white 
            hover:underline uppercase tracking-wide
          "
        >
          Contact Our Store
        </a>
      </div>
    </div>
  );
}
