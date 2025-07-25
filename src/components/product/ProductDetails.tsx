import { AdminProduct } from '@/types';

interface ProductDetailsProps {
  product: AdminProduct;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const specifications = [
    { label: 'SKU', value: product.sku },
    { label: 'Brand', value: product.brand },
    { label: 'Category', value: product.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) },
    { label: 'Status', value: product.inStock ? 'In Stock' : 'Out of Stock' },
    ...(product.weight ? [{ label: 'Weight', value: product.weight }] : []),
    ...(product.dimensions ? [{ label: 'Dimensions', value: product.dimensions }] : []),
  ].filter(spec => spec.value);

  return (
    <div className="space-y-6">
      {/* Specifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          Specifications
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {specifications.map((spec) => (
            <div key={spec.label} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide text-sm">
                {spec.label}:
              </span>
              <span className="font-medium text-gray-900 dark:text-white text-sm">
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Store Information */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 space-y-3">
        <h4 className="font-black uppercase tracking-wide text-gray-900 dark:text-white text-sm">
          Store Information
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Location:</span>
            <span className="font-medium text-gray-900 dark:text-white">Austin, Texas</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Availability:</span>
            <span className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {product.inStock ? 'Available Now' : 'Currently Out of Stock'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Store Hours:</span>
            <span className="font-medium text-gray-900 dark:text-white">Mon-Fri 10AM-9PM</span>
          </div>
        </div>
      </div>

      {/* Age Verification Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-yellow-800 dark:text-yellow-200 text-sm uppercase tracking-wide">
              Age Verification Required
            </h5>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              You must be 21 or older to purchase tobacco products. Valid ID required for all purchases.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Product Information */}
      {(product.createdAt || product.updatedAt) && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 pt-4 border-t border-gray-200 dark:border-gray-700">
          {product.createdAt && (
            <p>Added: {new Date(product.createdAt).toLocaleDateString()}</p>
          )}
          {product.updatedAt && product.updatedAt !== product.createdAt && (
            <p>Updated: {new Date(product.updatedAt).toLocaleDateString()}</p>
          )}
        </div>
      )}
    </div>
  );
}
