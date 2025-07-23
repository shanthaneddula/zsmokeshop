"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, ShoppingCart, Sun, Moon, Search, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();
  
  // Handle theme mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setExpandedCategories([]); // Reset expanded categories when menu closes
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <header 
      className="sticky top-[2.7rem] z-sticky w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
    >
      <div className="container-wide relative flex h-16 items-center justify-between">
        {/* Logo - Adidas style */}
        <Link href="/" className="flex items-center">
          <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white uppercase">
            Z SMOKE SHOP
          </span>
        </Link>

        {/* Search Bar - Adidas Style */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors uppercase tracking-wide"
            />
          </div>
        </div>

        {/* Desktop Navigation - Clean and Minimalist */}
        <nav className="hidden md:flex items-center gap-8">
          <div className="relative group">
            <Link
              href="/shop"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors uppercase tracking-wide"
            >
              Shop
            </Link>
            
            {/* Full-width Adidas-style mega menu overlay with extended hover area */}
            <div className="fixed top-16 left-0 z-dropdown hidden group-hover:block hover:block w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
              {/* Invisible bridge to prevent dropdown from disappearing */}
              <div className="absolute -top-1 left-0 right-0 h-1 bg-transparent"></div>
              <div className="container-wide py-12">
                <div className="grid grid-cols-5 gap-8">
                  {/* Column 1: Vaping */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                      Vaping
                    </h3>
                    <div className="space-y-2">
                      <Link
                        href="/category/high-end-vaporizers"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        High-End Vaporizers
                      </Link>
                      <Link
                        href="/category/disposable-vapes"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Disposable Vapes
                      </Link>
                      <Link
                        href="/category/vapes-mods-pods"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Vapes, Mods & Pods
                      </Link>
                      <Link
                        href="/category/e-liquids"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        E-Liquids
                      </Link>
                    </div>
                  </div>

                  {/* Column 2: Glass & Smoking */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                      Glass & Smoking
                    </h3>
                    <div className="space-y-2">
                      <Link
                        href="/category/bongs-pipes"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Bongs & Pipes
                      </Link>
                      <Link
                        href="/category/shisha-hookah"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Shisha & Hookah
                      </Link>
                      <Link
                        href="/category/cigarillos"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Cigarillos
                      </Link>
                      <Link
                        href="/category/lighters-torches"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Lighters & Torches
                      </Link>
                    </div>
                  </div>

                  {/* Column 3: Cannabis & CBD */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                      Cannabis & CBD
                    </h3>
                    <div className="space-y-2">
                      <Link
                        href="/category/cannabis"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Cannabis
                      </Link>
                      <Link
                        href="/category/thc-a-cbd-drinks"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        THC-A and CBD Drinks
                      </Link>
                      <Link
                        href="/category/kratom-7-hydroxy"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Kratom & 7 Hydroxy
                      </Link>
                      <Link
                        href="/category/detox"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Detox
                      </Link>
                    </div>
                  </div>

                  {/* Column 4: Accessories */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                      Accessories
                    </h3>
                    <div className="space-y-2">
                      <Link
                        href="/category/grinders-scales-trays"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Grinders, Scales & Trays
                      </Link>
                      <Link
                        href="/category/smoke-accessories"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Smoke Accessories
                      </Link>
                      <Link
                        href="/category/candles-incense"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Candles & Incense
                      </Link>
                    </div>
                  </div>

                  {/* Column 5: Beverages & More */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                      Beverages & More
                    </h3>
                    <div className="space-y-2">
                      <Link
                        href="/category/energy-drinks"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Energy Drinks
                      </Link>
                      <Link
                        href="/category/exotic"
                        className="block text-xs font-light text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Exotic
                      </Link>
                    </div>
                    
                    {/* All Products Link */}
                    <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        href="/shop"
                        className="block text-sm font-bold text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors uppercase tracking-wide"
                      >
                        All Products
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Link
            href="/support"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors uppercase tracking-wide"
          >
            Support
          </Link>
          <Link
            href="/locations"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors uppercase tracking-wide"
          >
            Locations
          </Link>
        </nav>

        {/* Right Side Actions - Minimalist */}
        <div className="flex items-center gap-1">
          {/* Theme Switcher */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          )}

          {/* User Account */}
          <Link
            href="/account"
            className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            aria-label="User account"
          >
            <User className="h-4 w-4" />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="absolute -right-0 -top-0 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 dark:bg-white text-xs text-white dark:text-gray-900 font-bold">
              0
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="ml-2 p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors md:hidden"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop - Lower z-index than age verification */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Adidas-inspired slide-out menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-mobile-nav w-full max-w-sm bg-white dark:bg-gray-900 overflow-y-auto"
            >
              <div className="flex h-full flex-col">
                {/* Mobile menu header */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white uppercase">
                    Menu
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Adidas-style Mobile Search Bar */}
                <div className="p-6 border-b-2 border-gray-900 dark:border-white">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-900 dark:text-white" />
                    <input
                      type="text"
                      placeholder="SEARCH PRODUCTS..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors uppercase tracking-wide font-medium"
                    />
                  </div>
                </div>

                {/* Primary Navigation */}
                <div className="flex-1">
                  <nav>
                    {/* Shop with expandable categories */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => toggleCategory('shop')}
                        className="flex items-center justify-between w-full py-4 px-6 text-base font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors uppercase tracking-wide"
                      >
                        <span>Shop</span>
                        <ChevronRight className={`h-5 w-5 transition-transform ${
                          expandedCategories.includes('shop') ? 'rotate-90' : ''
                        }`} />
                      </button>
                      
                      {expandedCategories.includes('shop') && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-gray-50 dark:bg-gray-800"
                        >
                          <div className="py-2">
                            <button
                              onClick={() => toggleCategory('vapes')}
                              className="flex items-center justify-between w-full py-3 px-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wide"
                            >
                              <span>Vapes & E-Cigarettes</span>
                              <ChevronRight className={`h-4 w-4 transition-transform ${
                                expandedCategories.includes('vapes') ? 'rotate-90' : ''
                              }`} />
                            </button>
                            
                            {expandedCategories.includes('vapes') && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="bg-gray-100 dark:bg-gray-700"
                              >
                                <div className="py-1">
                                  <Link
                                    href="/products/disposable-vapes"
                                    className="block py-2 px-12 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    Disposable Vapes
                                  </Link>
                                  <Link
                                    href="/products/vape-kits"
                                    className="block py-2 px-12 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    Vape Kits
                                  </Link>
                                  <Link
                                    href="/products/e-liquids"
                                    className="block py-2 px-12 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    E-Liquids
                                  </Link>
                                </div>
                              </motion.div>
                            )}
                            
                            <button
                              onClick={() => toggleCategory('smoking')}
                              className="flex items-center justify-between w-full py-3 px-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wide"
                            >
                              <span>Smoking Accessories</span>
                              <ChevronRight className={`h-4 w-4 transition-transform ${
                                expandedCategories.includes('smoking') ? 'rotate-90' : ''
                              }`} />
                            </button>
                            
                            {expandedCategories.includes('smoking') && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="bg-gray-100 dark:bg-gray-700"
                              >
                                <div className="py-1">
                                  <Link
                                    href="/products/pipes"
                                    className="block py-2 px-12 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    Pipes
                                  </Link>
                                  <Link
                                    href="/products/papers-wraps"
                                    className="block py-2 px-12 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    Papers & Wraps
                                  </Link>
                                  <Link
                                    href="/products/lighters"
                                    className="block py-2 px-12 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    Lighters
                                  </Link>
                                </div>
                              </motion.div>
                            )}
                            
                            <Link
                              href="/products/cbd"
                              className="block py-3 px-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wide"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              CBD Products
                            </Link>
                            <Link
                              href="/products/new"
                              className="block py-3 px-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wide"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              New & Trending
                            </Link>
                            <Link
                              href="/products/sale"
                              className="block py-3 px-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wide"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              Sale
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    

                    {/* Locations */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                      <Link
                        href="/locations"
                        className="flex items-center justify-between py-4 px-6 text-base font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors uppercase tracking-wide"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span>Locations</span>
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </div>
                    
                    {/* Support */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                      <Link
                        href="/support"
                        className="flex items-center justify-between py-4 px-6 text-base font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors uppercase tracking-wide"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span>Support</span>
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </nav>

                  {/* Secondary Links */}
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <nav className="px-6 space-y-1">
                      <Link
                        href="/account"
                        className="block py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      <Link
                        href="/cart"
                        className="block py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Exchanges & Returns
                      </Link>
                      <Link
                        href="/cart"
                        className="block py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Order Tracker
                      </Link>
                      <Link
                        href="/locations"
                        className="block py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Store Locator
                      </Link>
                    </nav>
                  </div>

                  {/* Cart Button */}
                  <div className="mt-8 px-6">
                    <Link
                      href="/cart"
                      className="flex w-full items-center justify-center gap-2 border border-gray-900 dark:border-white px-6 py-3 text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors uppercase tracking-wide"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>View Cart (0)</span>
                    </Link>
                  </div>

                  {/* Country/Region */}
                  <div className="mt-6 px-6 pb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-lg">🇺🇸</span>
                      <span>United States</span>
                    </div>
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