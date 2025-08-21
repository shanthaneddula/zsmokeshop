'use client';

import { AdminProduct } from '@/types';
import { useState, useEffect } from 'react';

import { generateStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo-utils';
import MobileProductImageGallery from './MobileProductImageGallery';
import StickyBottomActionBar from './StickyBottomActionBar';
import MobileProductSpecs from './MobileProductSpecs';
import RelatedProducts from './RelatedProducts';
import ExpandableDescription from './ExpandableDescription';
import DesktopProductSpecs from './DesktopProductSpecs';
import ProductBreadcrumbs from './ProductBreadcrumbs';

import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface ProductPageTemplateProps {
  product: AdminProduct;
  showRatings?: boolean;
  showStockStatus?: boolean;
}

export default function ProductPageTemplate({ 
  product,
  showRatings = false,
  showStockStatus = false
}: ProductPageTemplateProps) {
  const [relatedProducts, setRelatedProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const loadRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/shop/products?category=${product.category}&limit=4`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.products) {
            const related = data.data.products.filter((p: AdminProduct) => p.id !== product.id);
            setRelatedProducts(related);
          }
        }
      } catch (error) {
        console.error('Error loading related products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRelatedProducts();
  }, [product]);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Added ${product.name} to cart`);
    setIsAddingToCart(false);
  };

  const rating = product.rating || 0;
  const reviewCount = 12;

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData(product)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbStructuredData(product)),
        }}
      />

      {/* Breadcrumbs - Desktop Only */}
      <div className="hidden lg:block">
        <ProductBreadcrumbs product={product} />
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="container mx-auto px-4 py-4">
          {/* Mobile Product Name - Smaller like related products */}
          <div className="mb-4">
            <h1 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white leading-tight line-clamp-2">
              {product.name}
            </h1>
            {product.brand && (
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mt-1">
                {product.brand}
              </p>
            )}
          </div>

          {/* Product Images - Full Width */}
          <div className="mb-6">
            <MobileProductImageGallery product={product} />
          </div>

          {/* Mobile Product Specifications */}
          <MobileProductSpecs product={product} />
        </div>

        {/* Mobile Sticky Bottom Action Bar - Simplified */}
        <StickyBottomActionBar 
          product={product} 
          onAddToCart={handleAddToCart}
          isAddingToCart={isAddingToCart}
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <MobileProductImageGallery product={product} />
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              {/* Product Title & Brand */}
              <div>
                <h1 className="text-4xl font-black uppercase tracking-wide text-gray-900 dark:text-white leading-tight">
                  {product.name}
                </h1>
                {product.brand && (
                  <p className="text-xl text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mt-2">
                    {product.brand}
                  </p>
                )}
              </div>

              {/* Ratings */}
              {showRatings && rating > 0 && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div key={star} className="relative">
                        {rating >= star ? (
                          <StarSolidIcon className="w-5 h-5 text-yellow-400" />
                        ) : rating >= star - 0.5 ? (
                          <div className="relative">
                            <StarOutlineIcon className="w-5 h-5 text-gray-300" />
                            <StarSolidIcon className="w-5 h-5 text-yellow-400 absolute inset-0" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                          </div>
                        ) : (
                          <StarOutlineIcon className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">({reviewCount} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${product.salePrice || product.price}
                  </span>
                  {product.salePrice && (
                    <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                      ${product.price}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Tax included • Free pickup in store
                </p>
              </div>

              {/* Stock Status */}
              {showStockStatus && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.inStock ? (
                      <span className="text-green-600 font-medium">✓ In Stock</span>
                    ) : (
                      <span className="text-red-600 font-medium">✗ Out of Stock</span>
                    )}
                  </p>
                </div>
              )}

              {/* Enhanced Description */}
              <ExpandableDescription 
                shortDescription={product.shortDescription}
                detailedDescription={product.detailedDescription}
              />

              {/* Desktop Add to Cart */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAddingToCart}
                  className={`
                    w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-lg font-bold uppercase tracking-wide text-sm transition-all duration-200
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
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Product Specifications and Details */}
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <DesktopProductSpecs product={product} />
        </div>
      </div>

      {/* Related Products */}
      {!isLoading && relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} currentProduct={product} />
      )}
    </>
  );
}
