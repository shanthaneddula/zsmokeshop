import { Metadata } from "next";
import { ShoppingCart, ArrowLeft, Construction } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shopping Cart | Z Smoke Shop",
  description: "Review your selected items and proceed to checkout at Z Smoke Shop.",
};

export default function CartPage() {
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
            Shopping Cart
          </h1>
          
          <div className="bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-900/10 dark:to-accent-900/10 rounded-2xl p-8 border border-brand-100 dark:border-brand-800">
            <ShoppingCart className="h-16 w-16 text-brand-600 dark:text-brand-400 mx-auto mb-6" />
            
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Coming Soon!
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              We&apos;re working hard to bring you an amazing shopping experience. Our cart functionality is currently under development and will be available soon with features like:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🛒 Smart Cart</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Add, remove, and modify quantities with ease</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💾 Save for Later</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Keep items saved across sessions</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🚚 Delivery Options</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Choose pickup or delivery to your location</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💳 Secure Checkout</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Safe and secure payment processing</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
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

          {/* Newsletter signup while waiting */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Get Notified When It&apos;s Ready
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Be the first to know when our online shopping feature launches!
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                required
              />
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Notify Me
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
