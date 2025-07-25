'use client';

import { AdminProduct } from '@/types';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice, calculateDiscount } from '@/lib/product-utils';
import { generateStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo-utils';
import ProductImageGallery from './ProductImageGallery';
import ProductDetails from './ProductDetails';
import ProductActions from './ProductActions';
import RelatedProducts from './RelatedProducts';
import ProductBreadcrumbs from './ProductBreadcrumbs';

interface ProductPageTemplateProps {
  product: AdminProduct;
}

export default function ProductPageTemplate({ product }: ProductPageTemplateProps) {
  const [relatedProducts, setRelatedProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load related products via API
    const loadRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/shop/products?category=${product.category}&limit=4`);
        if (response.ok) {
          const data = await response.json();
          const related = data.products.filter((p: AdminProduct) => p.id !== product.id);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Error loading related products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRelatedProducts();
  }, [product]);

  const discount = calculateDiscount(product.price, product.salePrice);
  const finalPrice = product.salePrice || product.price;

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

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Breadcrumbs */}
        <ProductBreadcrumbs product={product} />

        {/* Main Product Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <ProductImageGallery product={product} />
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              {/* Product Title & Brand */}
              <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                  {product.name}
                </h1>
                {product.brand && (
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {product.brand}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">
                    {formatPrice(finalPrice)}
                  </span>
                  {product.salePrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="bg-red-600 text-white px-2 py-1 text-sm font-bold uppercase">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {product.inStock ? (
                    <span className="text-green-600 font-medium">✓ In Stock</span>
                  ) : (
                    <span className="text-red-600 font-medium">✗ Out of Stock</span>
                  )}
                </p>
              </div>

              {/* Badges */}
              {product.badges && product.badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.badges.map((badge) => (
                    <span
                      key={badge}
                      className={`
                        px-3 py-1 text-xs font-bold uppercase tracking-wide
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

              {/* Description */}
              {product.description && (
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Product Actions */}
              <ProductActions product={product} />

              {/* Product Details */}
              <ProductDetails product={product} />
            </div>
          </div>
        </div>

        {/* Related Products */}
        {!isLoading && relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} currentProduct={product} />
        )}

        {/* Store Information */}
        <div className="bg-gray-50 dark:bg-gray-800 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                Available at Z Smoke Shop
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Visit our Austin, Texas location for the best selection of premium smoke accessories, 
                vapes, and tobacco products. Expert staff and competitive prices guaranteed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
                <Link
                  href="/locations"
                  className="
                    bg-gray-900 dark:bg-white text-white dark:text-gray-900 
                    px-6 py-3 font-black uppercase tracking-wide text-sm
                    hover:bg-gray-800 dark:hover:bg-gray-100 
                    transition-colors duration-200
                  "
                >
                  Store Location
                </Link>
                <Link
                  href="/support"
                  className="
                    bg-transparent text-gray-900 dark:text-white 
                    px-6 py-3 font-black uppercase tracking-wide text-sm
                    border-2 border-gray-900 dark:border-white
                    hover:bg-gray-100 dark:hover:bg-gray-800 
                    transition-colors duration-200
                  "
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
