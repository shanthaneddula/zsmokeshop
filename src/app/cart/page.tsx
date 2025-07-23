import { Metadata } from "next";
import { ShoppingCart, ArrowLeft, Package, CreditCard, Truck, Shield } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shopping Cart | Z Smoke Shop",
  description: "Review your selected items and proceed to checkout at Z Smoke Shop.",
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 pt-[6.7rem]">
      <div className="container-wide py-16">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 dark:text-white uppercase mb-4">
              Shopping Cart
            </h1>
            <div className="w-16 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">
              Review and manage your items
            </p>
          </div>
          
          {/* Coming Soon Section */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white p-12 mb-12">
            <div className="text-center mb-12">
              <div className="w-20 h-20 border-2 border-gray-900 dark:border-white flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-10 w-10 text-gray-900 dark:text-white" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white uppercase mb-4">
                Coming Soon
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium mb-8">
                Shopping cart in development
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="border border-gray-300 dark:border-gray-600 p-6 hover:border-gray-900 dark:hover:border-white transition-colors">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-8 border border-gray-900 dark:border-white flex items-center justify-center">
                    <Package className="h-4 w-4 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide">Smart Cart</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Manage quantities with ease</p>
              </div>
              
              <div className="border border-gray-300 dark:border-gray-600 p-6 hover:border-gray-900 dark:hover:border-white transition-colors">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-8 border border-gray-900 dark:border-white flex items-center justify-center">
                    <Shield className="h-4 w-4 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide">Save Items</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Keep items across sessions</p>
              </div>
              
              <div className="border border-gray-300 dark:border-gray-600 p-6 hover:border-gray-900 dark:hover:border-white transition-colors">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-8 border border-gray-900 dark:border-white flex items-center justify-center">
                    <Truck className="h-4 w-4 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide">Delivery Options</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Pickup or delivery available</p>
              </div>
              
              <div className="border border-gray-300 dark:border-gray-600 p-6 hover:border-gray-900 dark:hover:border-white transition-colors">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-8 border border-gray-900 dark:border-white flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide">Secure Checkout</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Safe payment processing</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-8 py-4 border-2 border-gray-900 dark:border-white hover:bg-white hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white transition-all duration-300 uppercase tracking-wide"
              >
                <ShoppingCart className="h-5 w-5" />
                Continue Shopping
              </Link>
              
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-3 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-bold px-8 py-4 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all duration-300 uppercase tracking-wide"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Home
              </Link>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-12">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight uppercase mb-4">
                Get Notified
              </h3>
              <div className="w-12 h-0.5 bg-white dark:bg-gray-900 mx-auto mb-6"></div>
              <p className="text-gray-300 dark:text-gray-600 uppercase tracking-wide font-medium mb-8">
                Be first to shop online when we launch
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="ENTER YOUR EMAIL"
                  className="flex-1 border-2 border-white dark:border-gray-900 bg-transparent px-4 py-3 text-white dark:text-gray-900 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-gray-300 dark:focus:border-gray-600 uppercase tracking-wide font-medium"
                  required
                />
                <button
                  type="submit"
                  className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold px-8 py-3 border-2 border-white dark:border-gray-900 hover:bg-transparent hover:text-white dark:hover:bg-transparent dark:hover:text-gray-900 transition-all duration-300 uppercase tracking-wide"
                >
                  Notify Me
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
