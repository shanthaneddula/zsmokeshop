"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, ShoppingCart, Sun, Moon, Search, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useBanner } from "@/contexts/BannerContext";
import { Category, Product } from "@/types";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isVisible: isBannerVisible } = useBanner();
  const router = useRouter();
  
  // Handle theme mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch categories from admin API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Add cache-busting parameter to ensure fresh data
        const cacheBuster = Date.now();
        const response = await fetch(`/api/shop/categories?t=${cacheBuster}`, {
          cache: 'no-store'
        });
        const data = await response.json();
        if (data.success && data.data) {
          setCategories(data.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Search functionality
  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);
    
    if (value.length >= 2) {
      try {
        const response = await fetch(`/api/shop/products?search=${encodeURIComponent(value)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.products) {
            setSearchSuggestions(data.data.products);
            setShowSuggestions(true);
          }
        }
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    setShowSuggestions(false);
    setSearchQuery("");
    router.push(`/products/${product.slug}`);
  };
  
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
      className={`sticky ${isBannerVisible ? 'top-[2.7rem] md:top-16' : 'top-0'} z-sticky w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out`}
    >
      <div className="container-wide relative flex h-16 items-center justify-between">
        {/* Logo - Adidas style */}
        <Link href="/" className="flex items-center">
          <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white uppercase">
            Z SMOKE SHOP
          </span>
        </Link>

        {/* Search Bar - Adidas Style with Suggestions */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <form onSubmit={handleSearchSubmit}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors uppercase tracking-wide"
              />
            </form>
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 shadow-lg z-50 max-h-80 overflow-y-auto">
                {searchSuggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-center gap-3"
                  >
                    {product.image && (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-10 h-10 object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ${product.price}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation - Clean and Minimalist */}
        <nav className="hidden md:flex items-center gap-8">
          <div className="relative dropdown-group">
            <Link
              href="/shop"
              className="relative z-10 py-4 px-2 -mx-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors uppercase tracking-wide pointer-events-auto"
            >
              Shop
            </Link>
            
            {/* Full-width Adidas-style mega menu overlay with extended hover area */}
            <div className={`dropdown-menu fixed ${isBannerVisible ? 'top-[6.7rem] md:top-32' : 'top-16'} left-0 z-dropdown hidden w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg`}>
              {/* Dynamic invisible bridge responsive to banner state - pointer-events-none to prevent blocking clicks */}
              <div className={`absolute left-0 right-0 bg-transparent pointer-events-none ${
                isBannerVisible ? '-top-[6.7rem] md:-top-32 h-[6.7rem] md:h-32' : '-top-16 h-16'
              }`}></div>
              <div className="container-wide py-6">
                {categories.length > 0 ? (
                  <div className="grid grid-cols-5 gap-8 max-h-80 overflow-y-auto">
                    {/* Display categories in fixed 5-column grid matching Adidas style */}
                    {Array.from({ length: 5 }, (_, colIndex) => {
                      const startIndex = colIndex * Math.ceil(categories.length / 5);
                      const endIndex = Math.min(startIndex + Math.ceil(categories.length / 5), categories.length);
                      const columnCategories = categories.slice(startIndex, endIndex);
                      
                      return (
                        <div key={colIndex} className="space-y-2">
                          {columnCategories.map((category) => (
                            <div key={category.id}>
                              <Link
                                href={`/shop?category=${category.slug}`}
                                className="block text-xs font-normal text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors uppercase tracking-wide py-1 leading-relaxed"
                              >
                                {category.name}
                              </Link>
                            </div>
                          ))}
                          
                          {/* Add "All Products" link to the last column */}
                          {colIndex === 4 && (
                            <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                              <Link
                                href="/shop"
                                className="block text-xs font-normal text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors uppercase tracking-wide py-1 leading-relaxed"
                              >
                                All Products
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
                  </div>
                )}
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
                    <form onSubmit={handleSearchSubmit}>
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-900 dark:text-white" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="SEARCH PRODUCTS..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors uppercase tracking-wide font-medium"
                      />
                    </form>
                    
                    {/* Mobile Search Suggestions */}
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 shadow-lg z-50 max-h-60 overflow-y-auto">
                        {searchSuggestions.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => {
                              handleSuggestionClick(product);
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-center gap-3"
                          >
                            {product.image && (
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-8 h-8 object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                ${product.price}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
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
                            {/* Dynamic Categories */}
                            {categories.map((category) => (
                              <Link
                                key={category.id}
                                href={`/shop?category=${category.slug}`}
                                className="block py-3 px-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wide"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {category.name}
                              </Link>
                            ))}
                            
                            {/* All Products Link */}
                            <Link
                              href="/shop"
                              className="block py-3 px-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wide border-t border-gray-200 dark:border-gray-700 mt-2 pt-4"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              All Products
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