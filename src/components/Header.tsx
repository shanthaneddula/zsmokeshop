'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, MapPin, User, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      {/* Top bar with locations */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-2">
        <div className="container mx-auto px-4 flex justify-center items-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>719 W William Cannon Dr #105, Austin, TX</span>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>5318 Cameron Rd, Austin, TX</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-4 py-2 rounded-lg font-bold text-xl">
              Z SMOKE SHOP
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="premium-input pl-10 pr-4 py-2 w-64"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-300" />
            </div>
            
            <Link href="/shop" className="text-gray-700 dark:text-dark-text hover:text-brand-primary dark:hover:text-brand-light font-medium transition-colors">
              Shop All
            </Link>
            <Link href="/contact" className="text-gray-700 dark:text-dark-text hover:text-brand-primary dark:hover:text-brand-light font-medium transition-colors">
              Contact
            </Link>
            <Link href="/locations" className="text-gray-700 dark:text-dark-text hover:text-brand-primary dark:hover:text-brand-light font-medium transition-colors">
              Locations
            </Link>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {/* User Account */}
              <Link 
                href="/account" 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                title="My Account"
              >
                <User className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-brand-primary" />
              </Link>
              
              {/* Shopping Cart */}
              <Link 
                href="/cart" 
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-brand-primary" />
                {/* Cart Badge */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  0
                </span>
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-50 relative"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>


      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 md:hidden"
              onClick={toggleMenu}
            />
            
            {/* Mobile Menu */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white dark:bg-gray-900 shadow-2xl z-70 md:hidden"
            >
              <div className="p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-3 py-1 rounded-lg font-bold text-lg">
                    Z SMOKE SHOP
                  </div>
                  <button
                    onClick={toggleMenu}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative mb-8">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
                
                {/* Navigation */}
                <nav className="flex flex-col space-y-1 flex-1">
                  <Link 
                    href="/" 
                    className="text-gray-700 dark:text-gray-300 hover:text-brand-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 py-3 px-4 rounded-lg font-medium"
                    onClick={toggleMenu}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/shop" 
                    className="text-gray-700 dark:text-gray-300 hover:text-brand-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 py-3 px-4 rounded-lg font-medium"
                    onClick={toggleMenu}
                  >
                    Shop All
                  </Link>
                  <Link 
                    href="/contact" 
                    className="text-gray-700 dark:text-gray-300 hover:text-brand-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 py-3 px-4 rounded-lg font-medium"
                    onClick={toggleMenu}
                  >
                    Contact
                  </Link>
                  <Link 
                    href="/locations" 
                    className="text-gray-700 dark:text-gray-300 hover:text-brand-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 py-3 px-4 rounded-lg font-medium"
                    onClick={toggleMenu}
                  >
                    Locations
                  </Link>
                </nav>
                
                {/* Theme Toggle */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
