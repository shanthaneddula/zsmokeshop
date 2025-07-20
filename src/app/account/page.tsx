import { Metadata } from "next";
import { User, ArrowLeft, Construction, Settings, ShoppingBag, Heart, Bell } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Account | Z Smoke Shop",
  description: "Manage your account, orders, and preferences at Z Smoke Shop.",
};

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="container-wide py-16">
        {/* Under Construction Message */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-900/20 dark:to-accent-900/20 rounded-full"></div>
            </div>
            <div className="relative z-10 flex items-center justify-center">
              <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center">
                <Construction className="h-12 w-12 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            My Account
          </h1>
          
          <div className="bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-900/10 dark:to-accent-900/10 rounded-2xl p-8 border border-brand-100 dark:border-brand-800">
            <User className="h-16 w-16 text-brand-600 dark:text-brand-400 mx-auto mb-6" />
            
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Account Dashboard Coming Soon!
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              We&apos;re building a comprehensive account management system to enhance your shopping experience. Soon you&apos;ll be able to:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <ShoppingBag className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Order History</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Track past purchases and reorder favorites</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Wishlist</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Save products for later purchase</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Preferences</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Manage shipping, payment, and notifications</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Stay updated on deals and new arrivals</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
                Continue Shopping
              </Link>
              
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Home
              </Link>
            </div>
          </div>

          {/* Temporary Sign-in/Register Links */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Ready to Shop In-Store?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              While we finalize our online account system, visit us at either of our Austin locations for the full Z Smoke Shop experience!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/locations"
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Find Our Stores
              </Link>
              <Link
                href="/contact"
                className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Newsletter signup for account updates */}
          <div className="mt-8 bg-gradient-to-r from-brand-600 to-accent-600 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-semibold mb-4">
              Get Early Access to Your Account
            </h3>
            <p className="text-brand-100 mb-6">
              Be among the first to create an account when our system launches!
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border-0 bg-white/20 backdrop-blur-sm px-4 py-3 text-white placeholder-white/70 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
              <button
                type="submit"
                className="bg-white text-brand-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Join Waitlist
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
