import { Metadata } from "next";
import { User, ArrowLeft, Settings, ShoppingBag, Heart, Bell, Package } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Account | Z Smoke Shop",
  description: "Manage your account, orders, and preferences at Z Smoke Shop.",
};

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 pt-16">
      <div className="container-wide py-16">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 dark:text-white uppercase mb-4">
              My Account
            </h1>
            <div className="w-16 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">
              Manage your profile and preferences
            </p>
          </div>
          
          {/* Coming Soon Section */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white p-12 mb-12">
            <div className="text-center mb-12">
              <div className="w-20 h-20 border-2 border-gray-900 dark:border-white flex items-center justify-center mx-auto mb-6">
                <User className="h-10 w-10 text-gray-900 dark:text-white" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white uppercase mb-4">
                Coming Soon
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium mb-8">
                Account dashboard in development
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="border border-gray-300 dark:border-gray-600 p-6 hover:border-gray-900 dark:hover:border-white transition-colors">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-8 border border-gray-900 dark:border-white flex items-center justify-center">
                    <Package className="h-4 w-4 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide">Order History</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Track purchases and reorder</p>
              </div>
              
              <div className="border border-gray-300 dark:border-gray-600 p-6 hover:border-gray-900 dark:hover:border-white transition-colors">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-8 border border-gray-900 dark:border-white flex items-center justify-center">
                    <Heart className="h-4 w-4 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide">Wishlist</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Save for later purchase</p>
              </div>
              
              <div className="border border-gray-300 dark:border-gray-600 p-6 hover:border-gray-900 dark:hover:border-white transition-colors">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-8 border border-gray-900 dark:border-white flex items-center justify-center">
                    <Settings className="h-4 w-4 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide">Preferences</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Manage account settings</p>
              </div>
              
              <div className="border border-gray-300 dark:border-gray-600 p-6 hover:border-gray-900 dark:hover:border-white transition-colors">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-8 border border-gray-900 dark:border-white flex items-center justify-center">
                    <Bell className="h-4 w-4 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide">Notifications</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Stay updated on deals</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-8 py-4 border-2 border-gray-900 dark:border-white hover:bg-white hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white transition-all duration-300 uppercase tracking-wide"
              >
                <ShoppingBag className="h-5 w-5" />
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

          {/* Store Visit Section */}
          <div className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 p-12 mb-12">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase mb-4">
                Visit Our Store
              </h3>
              <div className="w-12 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-6"></div>
              <p className="text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium mb-8 max-w-2xl mx-auto">
                Experience our full product range at our Austin locations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/locations"
                  className="inline-flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-8 py-4 border-2 border-gray-900 dark:border-white hover:bg-white hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white transition-all duration-300 uppercase tracking-wide"
                >
                  Find Our Stores
                </Link>
                <Link
                  href="/support"
                  className="inline-flex items-center justify-center border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-bold px-8 py-4 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all duration-300 uppercase tracking-wide"
                >
                  Get Help
                </Link>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-12">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight uppercase mb-4">
                Get Early Access
              </h3>
              <div className="w-12 h-0.5 bg-white dark:bg-gray-900 mx-auto mb-6"></div>
              <p className="text-gray-300 dark:text-gray-600 uppercase tracking-wide font-medium mb-8">
                Be first to access your account dashboard
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
                  Join Waitlist
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
