"use client";

import Image from "next/image";
import { Star } from "lucide-react";

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
        className={`h-3 w-3 ${
          i < Math.floor(rating)
            ? 'text-gray-900 dark:text-white fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container-wide">
        {/* Section Header - Adidas Style */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-6 uppercase">
            Featured Products
          </h2>
          <div className="w-16 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-8"></div>
          <p className="text-lg font-light text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Our most popular and highly-rated products
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all duration-300"
            >
              {/* Product Badges */}
              <div className="absolute top-4 left-4 z-10">
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
              <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-102 transition-transform duration-500"
                />
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-3">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">
                    {product.category}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide text-sm">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-light">
                    ({product.reviewCount})
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through font-light">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 px-4 font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors uppercase tracking-wide text-sm">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-16">
          <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-12 py-4 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors uppercase tracking-wide text-sm border border-gray-900 dark:border-white">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}
