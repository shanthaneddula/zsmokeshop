'use client';

// Product detail page for the static, display-only catalog.
// Reuses the existing gallery and ProductCard and follows ProductPageTemplate's layout,
// but shows flavors/sizes/colors instead of price and add-to-cart.
import { useState } from 'react';
import Link from 'next/link';
import { ChevronRightIcon, MapPinIcon } from '@heroicons/react/24/outline';
import type { AdminProduct } from '@/types';
import MobileProductImageGallery from '@/components/product/MobileProductImageGallery';
import ProductCard from '@/components/product/ProductCard';
import {
  getCatalogCategory,
  getRelatedCatalogProducts,
  toShopProduct,
  type CatalogProduct,
} from '@/data/catalog';

interface Props {
  product: CatalogProduct;
}

function OptionGroups({ product }: Props) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  if (product.options.length === 0) return null;
  return (
    <div className="space-y-6">
      {product.options.map((opt) => (
        <div key={opt.label}>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-sm font-black uppercase tracking-wide text-gray-900 dark:text-white">
              {opt.label}
              {selected[opt.label] && (
                <span className="ml-2 font-medium normal-case tracking-normal text-gray-600 dark:text-gray-400">
                  {selected[opt.label]}
                </span>
              )}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {opt.values.length} available
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {opt.values.map((v) => {
              const active = selected[opt.label] === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSelected((s) => ({ ...s, [opt.label]: active ? '' : v }))}
                  className={`px-3 py-2 border text-xs font-bold uppercase tracking-wide transition-colors ${
                    active
                      ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white'
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function LabReportLink({ product }: Props) {
  if (!product.labReportUrl) return null;
  return (
    <a
      href={product.labReportUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-block border border-gray-900 dark:border-white px-4 py-2 text-xs font-black uppercase tracking-wide text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors"
    >
      View lab report (COA) from {product.brand}
    </a>
  );
}

function StoreNote() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-3">
      <MapPinIcon className="w-5 h-5 text-gray-900 dark:text-white flex-shrink-0 mt-0.5" />
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p className="font-bold uppercase tracking-wide text-gray-900 dark:text-white mb-1">Available in store</p>
        Flavors and sizes vary by location. Visit or call either Austin store to check what&apos;s on the shelf.{' '}
        <Link href="/locations" className="underline font-medium text-gray-900 dark:text-white">
          Store locations
        </Link>
        . 21+ only.
      </div>
    </div>
  );
}

export default function CatalogProductTemplate({ product }: Props) {
  const category = getCatalogCategory(product.categorySlug);
  const brand = category?.brands.find((b) => b.slug === product.brandSlug);
  const related = getRelatedCatalogProducts(product, 8).map(toShopProduct);
  // The gallery only needs name/image; adapt to its AdminProduct prop.
  const galleryProduct = { name: product.name, image: product.image, badges: [] } as unknown as AdminProduct;

  const crumb = 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors';

  return (
    <>
      {/* Breadcrumbs - Desktop Only (same look as ProductBreadcrumbs) */}
      <div className="hidden lg:block">
        <nav className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <ol className="flex items-center space-x-2 text-sm">
              <li><Link href="/" className={crumb}>Home</Link></li>
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              <li><Link href="/shop" className={crumb}>Shop</Link></li>
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              <li><Link href={`/shop?category=${product.categorySlug}`} className={crumb}>{product.category}</Link></li>
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              <li>
                <Link href={`/shop?category=${product.categorySlug}&brand=${product.brandSlug}`} className={crumb}>
                  {product.brand}
                </Link>
              </li>
            </ol>
          </div>
        </nav>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="mb-4">
            <h1 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white leading-tight line-clamp-2">
              {product.name}
            </h1>
            <Link
              href={`/shop?category=${product.categorySlug}&brand=${product.brandSlug}`}
              className="text-sm text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mt-1 inline-block"
            >
              {product.brand}
            </Link>
          </div>
          <div className="mb-6">
            <MobileProductImageGallery product={galleryProduct} />
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{product.description}</p>
          <div className="mb-6">
            <OptionGroups product={product} />
          </div>
          {product.labReportUrl && (
            <div className="mb-6">
              <LabReportLink product={product} />
            </div>
          )}
          <div className="mb-8">
            <StoreNote />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 gap-12">
            <div>
              <MobileProductImageGallery product={galleryProduct} />
            </div>
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-black uppercase tracking-wide text-gray-900 dark:text-white leading-tight">
                  {product.name}
                </h1>
                <Link
                  href={`/shop?category=${product.categorySlug}&brand=${product.brandSlug}`}
                  className="text-xl text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mt-2 inline-block hover:text-gray-900 dark:hover:text-white"
                >
                  {product.brand}
                </Link>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{product.description}</p>
              <OptionGroups product={product} />
              <LabReportLink product={product} />
              <StoreNote />
              {brand && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-bold uppercase tracking-wide text-gray-900 dark:text-white">About {brand.name}: </span>
                  {brand.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products (same section styling as RelatedProducts) */}
      {related.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                Related Products
              </h2>
              <div className="w-16 h-0.5 bg-gray-900 dark:bg-white mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                More from {product.brand} and other {product.category} brands
              </p>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible">
              {related.map((p) => (
                <div key={p.id} className="flex-none w-[180px] md:w-[220px] lg:w-auto">
                  <ProductCard product={p} viewMode="grid" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
