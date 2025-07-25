import Link from 'next/link';
import { AdminProduct } from '@/types';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface ProductBreadcrumbsProps {
  product: AdminProduct;
}

export default function ProductBreadcrumbs({ product }: ProductBreadcrumbsProps) {
  const categoryName = product.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <nav className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link 
              href="/" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              Home
            </Link>
          </li>
          
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          
          <li>
            <Link 
              href="/shop" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              Shop
            </Link>
          </li>
          
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          
          <li>
            <Link 
              href={`/shop?category=${product.category}`}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              {categoryName}
            </Link>
          </li>
          
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          
          <li>
            <span className="text-gray-900 dark:text-white font-medium">
              {product.name}
            </span>
          </li>
        </ol>
      </div>
    </nav>
  );
}
