'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { catalogueData, generateMockProducts } from '@/data/catalogue';

export default function CataloguePage() {
  const [activeCategory, setActiveCategory] = useState(catalogueData[0].id);
  const [activeSubcategory, setActiveSubcategory] = useState(catalogueData[0].subcategories?.[0]?.id || '');
  
  const selectedCategory = catalogueData.find(cat => cat.id === activeCategory);
  const products = activeSubcategory ? generateMockProducts(activeCategory, activeSubcategory, 8) : [];
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Page Header - Adidas Style */}
      <div className="container mx-auto px-4 pt-8 pb-4 border-b-2 border-gray-900 dark:border-gray-100">
        <h1 className="text-3xl md:text-5xl font-bold tracking-widest uppercase">
          Product Catalogue
        </h1>
        <div className="w-20 h-1 bg-gray-900 dark:bg-gray-100 mt-4"></div>
      </div>
      
      {/* Category Tabs - Adidas Style */}
      <div className="container mx-auto px-4 pt-6 pb-2 overflow-x-auto">
        <div className="flex space-x-1 md:space-x-4 min-w-max">
          {catalogueData.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setActiveSubcategory(category.subcategories?.[0]?.id || '');
              }}
              className={`px-4 py-2 text-sm md:text-base font-medium whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Subcategory Selection */}
      {selectedCategory && selectedCategory.subcategories && (
        <div className="container mx-auto px-4 py-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {selectedCategory.subcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                onClick={() => setActiveSubcategory(subcategory.id)}
                className={`flex items-center justify-between p-4 border ${
                  activeSubcategory === subcategory.id
                    ? 'border-gray-900 dark:border-white'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                } transition-colors`}
              >
                <span className="font-medium">{subcategory.name}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Products Display - Adidas Style */}
      <div className="container mx-auto px-4 py-8">
        {/* Product Header with View All */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">
            {selectedCategory?.subcategories?.find(sub => sub.id === activeSubcategory)?.name || 'Products'}
          </h2>
          <a href="#" className="text-sm font-medium uppercase tracking-wider underline">
            VIEW ALL
          </a>
        </div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              {/* Product Image */}
              <div className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
                <div className="relative h-full w-full">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <button className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Product Info */}
              <div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white">{product.name}</h3>
                <p className="mt-1 text-lg font-bold">${product.price.toFixed(2)}</p>
                
                {/* Add to Cart Button - Adidas Style */}
                <button 
                  className="mt-3 w-full py-2 px-4 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-medium hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors"
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
                </button>
              </div>
              
              {/* Brand Badge */}
              {product.brand && (
                <div className="absolute top-0 left-0 bg-gray-900 text-white px-2 py-1 text-xs font-medium">
                  {product.brand}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-600 dark:text-gray-400">Please select a different category or subcategory.</p>
          </div>
        )}
      </div>
    </div>
  );
}
