"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, Heart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
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
    price: 399.99,
    originalPrice: 449.99,
    rating: 4.8,
    reviewCount: 124,
    image: "/api/placeholder/300/300",
    category: "Dab Rigs",
    isBestSeller: true,
    description: "Premium electronic dab rig with smart temperature control"
  },
  {
    id: "2",
    name: "RAW Black Papers",
    price: 2.99,
    rating: 4.9,
    reviewCount: 89,
    image: "/api/placeholder/300/300",
    category: "Papers",
    isBestSeller: true,
    description: "Ultra-thin natural rolling papers for the perfect burn"
  },
  {
    id: "3",
    name: "GRAV Helix Pipe",
    price: 89.99,
    rating: 4.7,
    reviewCount: 56,
    image: "/api/placeholder/300/300",
    category: "Glass",
    isNew: true,
    description: "Innovative glass pipe with unique helix design"
  },
  {
    id: "4",
    name: "Storz & Bickel Mighty+",
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.9,
    reviewCount: 203,
    image: "/api/placeholder/300/300",
    category: "Vaporizers",
    isBestSeller: true,
    description: "Portable vaporizer with precise temperature control"
  }
];

export default function FeaturedProducts() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Check out our most popular items handpicked for quality and value
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              {/* Product Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {product.isBestSeller && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    BEST SELLER
                  </span>
                )}
                {product.isNew && (
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    NEW
                  </span>
                )}
                {product.originalPrice && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    SALE
                  </span>
                )}
              </div>

              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(product.id)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
              >
                <Heart
                  className={`h-4 w-4 ${
                    favorites.has(product.id)
                      ? 'text-red-500 fill-current'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                />
              </button>

              {/* Product Image */}
              <div className="aspect-square relative overflow-hidden bg-gray-50 dark:bg-gray-800">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                    {product.category}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group">
                  <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold px-8 py-4 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
            View All Products
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
