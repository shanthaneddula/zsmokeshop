'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Product } from '@/types';
import Image from 'next/image';

interface ReplacementProductSearchProps {
  category?: string;
  onSelect: (product: Product) => void;
  onCancel: () => void;
}

export default function ReplacementProductSearch({ 
  category, 
  onSelect, 
  onCancel 
}: ReplacementProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, products, category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category if provided
    if (category) {
      filtered = filtered.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query)
      );
    }

    // Only show in-stock products
    filtered = filtered.filter(p => p.inStock);

    setFilteredProducts(filtered);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Select Replacement Product
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {category && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Showing products from: <span className="font-semibold">{category}</span>
            </p>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, brand, or description..."
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:border-black dark:focus:border-white focus:outline-none"
            />
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery 
                  ? 'No products found matching your search'
                  : 'No products available in this category'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => onSelect(product)}
                  className="flex items-start p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-750 transition-all text-left"
                >
                  {product.image && (
                    <div className="relative w-20 h-20 flex-shrink-0 mr-4">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="80px"
                        className="object-cover rounded border-2 border-gray-900 dark:border-white"
                        unoptimized
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-1">
                      {product.name}
                    </h4>
                    {product.brand && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {product.brand}
                      </p>
                    )}
                    {product.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2 mb-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-black text-lg text-gray-900 dark:text-white">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">
                        In Stock
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-bold uppercase tracking-wide"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
