'use client';

import { useState } from 'react';
import { Menu, X, ChevronDown, Grid3X3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from '@/data';

export default function CategoryNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Desktop Category Navigation */}
        <div className="hidden lg:flex items-center justify-center py-4 space-x-8 overflow-x-auto">
          {categories.slice(0, 8).map((category) => (
            <a
              key={category.id}
              href={`/category/${category.slug}`}
              className="group whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="relative">
                {category.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
              </span>
            </a>
          ))}
          <button
            onClick={toggleMenu}
            className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Grid3X3 className="mr-2 w-4 h-4" />
            All Categories
            <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Category Navigation */}
        <div className="lg:hidden py-4">
          <button
            onClick={toggleMenu}
            className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <Grid3X3 className="mr-3 w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900 dark:text-white">Browse Categories</span>
            </div>
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Category Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {categories.map((category, index) => (
                  <motion.a
                    key={category.id}
                    href={`/category/${category.slug}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="group flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                      <span className="text-white font-bold text-sm">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}