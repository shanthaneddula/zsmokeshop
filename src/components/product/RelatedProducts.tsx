import { AdminProduct } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/product-utils';

interface RelatedProductsProps {
  products: AdminProduct[];
  currentProduct: AdminProduct;
}

export default function RelatedProducts({ products, currentProduct }: RelatedProductsProps) {
  if (products.length === 0) return null;

  const categoryName = currentProduct.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
            Related Products
          </h2>
          <div className="w-16 h-0.5 bg-gray-900 dark:bg-white mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover more products in the {categoryName} category
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-colors duration-200"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <Image
                  src={product.image || '/images/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                
                {/* Badges */}
                {product.badges && product.badges.length > 0 && (
                  <div className="absolute top-2 left-2 space-y-1">
                    {product.badges.slice(0, 2).map((badge) => (
                      <span
                        key={badge}
                        className={`
                          block px-2 py-1 text-xs font-bold uppercase tracking-wide
                          ${badge === 'best-seller' ? 'bg-yellow-400 text-gray-900' : ''}
                          ${badge === 'new' ? 'bg-green-600 text-white' : ''}
                          ${badge === 'sale' ? 'bg-red-600 text-white' : ''}
                          ${badge === 'limited' ? 'bg-purple-600 text-white' : ''}
                          ${!['best-seller', 'new', 'sale', 'limited'].includes(badge) ? 'bg-gray-600 text-white' : ''}
                        `}
                      >
                        {badge.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                )}

                {/* Out of Stock Overlay */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-3 py-1 font-bold uppercase text-sm">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                {/* Brand */}
                {product.brand && (
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {product.brand}
                  </p>
                )}

                {/* Product Name */}
                <h3 className="font-black text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors line-clamp-2">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-center space-x-2">
                  <span className="font-black text-gray-900 dark:text-white">
                    {formatPrice(product.salePrice || product.price)}
                  </span>
                  {product.salePrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <p className={`text-xs font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href={`/shop?category=${currentProduct.category}`}
            className="
              inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 
              px-8 py-3 font-black uppercase tracking-wide text-sm
              hover:bg-gray-800 dark:hover:bg-gray-100 
              transition-colors duration-200
            "
          >
            View All {categoryName}
          </Link>
        </div>
      </div>
    </section>
  );
}
