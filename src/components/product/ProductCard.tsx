'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);



  const renderBadges = () => {
    if (!product.badges || product.badges.length === 0) return null;

    return (
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.badges.map((badge) => {
          let badgeClass = '';
          let badgeText = '';

          switch (badge) {
            case 'new':
              badgeClass = 'bg-green-600 text-white';
              badgeText = 'NEW';
              break;
            case 'sale':
              badgeClass = 'bg-red-600 text-white';
              badgeText = 'SALE';
              break;
            case 'best-seller':
              badgeClass = 'bg-blue-600 text-white';
              badgeText = 'BEST SELLER';
              break;
            case 'out-of-stock':
              badgeClass = 'bg-gray-600 text-white';
              badgeText = 'OUT OF STOCK';
              break;
            default:
              return null;
          }

          return (
            <span
              key={badge}
              className={`px-2 py-1 text-xs font-bold uppercase tracking-wide ${badgeClass}`}
            >
              {badgeText}
            </span>
          );
        })}
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all duration-300"
      >
        <Link href={`/products/${product.slug}`}>
        <div className="flex p-4 gap-4">
          {/* Product Image */}
          <div className="relative w-24 h-24 flex-shrink-0">
            {renderBadges()}
            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              {!imageError ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {product.name.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide truncate">
                  {product.name}
                </h3>
                {product.brand && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {product.brand}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-gray-900 dark:text-white">
                  ${product.salePrice ? product.salePrice.toFixed(2) : product.price.toFixed(2)}
                </span>
                {product.salePrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
              <button
                disabled={!product.inStock}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                  product.inStock
                    ? 'bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                }`}
              >
                {product.inStock ? (
                  <>
                    <ShoppingCart className="h-3 w-3 inline mr-1" />
                    Add to Cart
                  </>
                ) : (
                  'Out of Stock'
                )}
              </button>
            </div>
          </div>
        </div>
        </Link>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all duration-300"
    >
      <Link href={`/products/${product.slug}`}>
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        {renderBadges()}
        
        {/* Wishlist Button */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-2 right-2 z-10 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
        </button>

        {/* Quick View Button */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <button className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Eye className="h-4 w-4 inline mr-2" />
            Quick View
          </button>
        </div>

        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {!imageError ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {product.name.split(' ')[0]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">
              {product.brand}
            </p>
          )}
        </div>



        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-black text-gray-900 dark:text-white">
            ${product.salePrice ? product.salePrice.toFixed(2) : product.price.toFixed(2)}
          </span>
          {product.salePrice && (
            <span className="text-sm text-gray-500 line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          disabled={!product.inStock}
          className={`w-full py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
            product.inStock
              ? 'bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
          }`}
        >
          {product.inStock ? (
            <>
              <ShoppingCart className="h-4 w-4 inline mr-2" />
              Add to Cart
            </>
          ) : (
            'Out of Stock'
          )}
        </button>
      </div>
      </Link>
    </motion.div>
  );
}
