import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Not Found | Z Smoke Shop - Austin, TX',
  description: 'The requested product could not be found. Browse our full collection of vapes, glass, and smoke accessories in Austin, Texas.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        {/* 404 Display */}
        <div className="space-y-4">
          <h1 className="text-9xl font-black text-gray-900 dark:text-white tracking-wider">
            404
          </h1>
          <div className="w-24 h-1 bg-gray-900 dark:bg-white mx-auto"></div>
        </div>

        {/* Error Message */}
        <div className="space-y-4 max-w-md mx-auto">
          <h2 className="text-2xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
            Product Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            The product you&apos;re looking for doesn&apos;t exist or may have been removed. 
            Browse our full collection to find what you need.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/shop"
            className="
              bg-gray-900 dark:bg-white text-white dark:text-gray-900 
              px-8 py-3 font-black uppercase tracking-wide text-sm
              hover:bg-gray-800 dark:hover:bg-gray-100 
              transition-colors duration-200
              border-2 border-gray-900 dark:border-white
            "
          >
            Browse All Products
          </Link>
          
          <Link 
            href="/"
            className="
              bg-transparent text-gray-900 dark:text-white 
              px-8 py-3 font-black uppercase tracking-wide text-sm
              hover:bg-gray-100 dark:hover:bg-gray-800 
              transition-colors duration-200
              border-2 border-gray-900 dark:border-white
            "
          >
            Back to Home
          </Link>
        </div>

        {/* Popular Categories */}
        <div className="mt-12 space-y-6">
          <h3 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white">
            Popular Categories
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'Vapes & Mods', href: '/shop?category=vapes-mods-pods' },
              { name: 'Glass', href: '/shop?category=glass' },
              { name: 'Smoke Accessories', href: '/shop?category=smoke-accessories' },
              { name: 'Lighters', href: '/shop?category=lighters-torches' },
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="
                  text-sm font-medium text-gray-600 dark:text-gray-400 
                  hover:text-gray-900 dark:hover:text-white
                  border border-gray-300 dark:border-gray-600
                  px-4 py-2 hover:border-gray-900 dark:hover:border-white
                  transition-colors duration-200
                "
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Store Info */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help finding a specific product?{' '}
            <Link 
              href="/support" 
              className="text-gray-900 dark:text-white font-medium hover:underline"
            >
              Contact our Austin store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
