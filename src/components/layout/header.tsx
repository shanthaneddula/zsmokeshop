"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, ShoppingCart, ChevronDown, Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
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
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header 
      className={`sticky top-0 z-sticky w-full transition-all duration-200 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-md dark:bg-gray-900/90" : "bg-transparent"
      }`}
    >
      <div className="container-wide relative flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-brand-800 dark:text-white">
            Z SMOKE SHOP
          </span>
        </Link>

        {/* Desktop Navigation - visible on md and above */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-brand-400"
          >
            Home
          </Link>
          <div className="relative group">
            <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-brand-400">
              Shop
              <ChevronDown className="h-4 w-4" />
            </button>
            {/* Dropdown menu for Shop */}
            <div className="absolute left-0 top-full z-dropdown mt-1 hidden min-w-[200px] overflow-hidden rounded-md bg-white p-1 shadow-lg ring-1 ring-black/5 group-hover:block dark:bg-gray-800 dark:ring-white/10">
              <Link
                href="/shop"
                className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                All Products
              </Link>
              <Link
                href="/category/vapes-mods-pods"
                className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Vapes & Mods
              </Link>
              <Link
                href="/category/glass"
                className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Glass
              </Link>
              <Link
                href="/category/accessories"
                className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Accessories
              </Link>
            </div>
          </div>
          <Link
            href="/contact"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-brand-400"
          >
            Contact
          </Link>
          <Link
            href="/locations"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-brand-400"
          >
            Locations
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          {mounted && (
            <div className="hidden sm:block">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          )}

          {/* User Account */}
          <Link
            href="/account"
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            aria-label="User account"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs text-white">
              0
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="ml-1 rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 md:hidden"
            aria-label="Open mobile menu"
          >
            <Menu className="h-6 w-6" />
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

            {/* Slide-out menu panel - Proper mobile navigation */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-40 w-full max-w-sm overflow-y-auto bg-white shadow-2xl dark:bg-gray-900 sm:max-w-xs"
            >
              {/* Mobile menu content container */}
              <div className="flex h-full flex-col p-6">
                {/* Mobile menu header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                  <span className="text-xl font-bold tracking-tight text-brand-800 dark:text-white">
                    Z SMOKE SHOP
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Mobile navigation links */}
                <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
                  <Link
                    href="/"
                    className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <div>
                    <p className="block rounded-lg px-4 py-3 text-base font-semibold text-gray-900 dark:text-white">
                      Shop
                    </p>
                    <div className="ml-4 space-y-1 border-l-2 border-brand-200 pl-4 dark:border-brand-700">
                      <Link
                        href="/shop"
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        All Products
                      </Link>
                      <Link
                        href="/category/vapes-mods-pods"
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Vapes & Mods
                      </Link>
                      <Link
                        href="/category/glass"
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Glass
                      </Link>
                      <Link
                        href="/category/accessories"
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Accessories
                      </Link>
                    </div>
                  </div>
                  <Link
                    href="/contact"
                    className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  <Link
                    href="/locations"
                    className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Locations
                  </Link>
                </nav>

                {/* Mobile Actions */}
                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Theme
                    </span>
                    <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                      <button
                        onClick={() => setTheme("light")}
                        className={`rounded-md p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                          theme === "light" ? "bg-white shadow-sm dark:bg-gray-700" : "hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                        aria-label="Light theme"
                      >
                        <Sun className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`rounded-md p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                          theme === "dark" ? "bg-white shadow-sm dark:bg-gray-700" : "hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                        aria-label="Dark theme"
                      >
                        <Moon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setTheme("system")}
                        className={`rounded-md p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                          theme === "system" ? "bg-white shadow-sm dark:bg-gray-700" : "hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                        aria-label="System theme"
                      >
                        <Laptop className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile user/cart links */}
                <div className="mt-6 space-y-3">
                  <Link
                    href="/account"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>My Account</span>
                  </Link>
                  <Link
                    href="/cart"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-brand-600 dark:hover:bg-brand-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>View Cart (0)</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}