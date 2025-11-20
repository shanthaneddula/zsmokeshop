'use client';

import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, itemCount, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-900 pt-[6.7rem]">
        <div className="container-wide py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 dark:text-white uppercase mb-4">
                Shopping Cart
              </h1>
              <div className="w-16 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-6"></div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white p-12 text-center">
              <div className="w-20 h-20 border-2 border-gray-900 dark:border-white flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-10 w-10 text-gray-900 dark:text-white" />
              </div>
              
              <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase mb-4">
                Your cart is empty
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium mb-8">
                Add some products to get started
              </p>
              
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 pt-[6.7rem]">
      <div className="container-wide py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white uppercase mb-4">
              Shopping Cart
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">
              {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-900 dark:hover:border-white transition-colors"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 border border-gray-200 dark:border-gray-700">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                          <ShoppingCart className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase mb-1 truncate">
                        {item.product.name}
                      </h3>
                      {item.product.brand && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {item.product.brand}
                        </p>
                      )}
                      <p className="text-xl font-black text-gray-900 dark:text-white mt-2">
                        ${item.product.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-4">
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 font-bold min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 uppercase tracking-wide font-medium transition-colors"
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white p-6 sticky top-24">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="uppercase tracking-wide">Subtotal</span>
                    <span className="font-bold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="uppercase tracking-wide">Tax (8.25%)</span>
                    <span className="font-bold">${(subtotal * 0.0825).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-black text-gray-900 dark:text-white uppercase">Total</span>
                      <span className="text-2xl font-black text-gray-900 dark:text-white">
                        ${(subtotal * 1.0825).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="block w-full px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold uppercase tracking-wide text-center hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                  
                  <Link
                    href="/shop"
                    className="block w-full px-6 py-4 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-bold uppercase tracking-wide text-center hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide text-center">
                    In-store pickup only • Austin, TX
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
