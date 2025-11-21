'use client';

import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, MapPin, Phone, Mail, User } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    email: '',
    storeLocation: '719 W William Cannon Dr #105, Austin, TX 78745',
    replacementPreference: 'call',
    notificationMethod: 'email' as 'email' | 'sms',
    smsConsent: false,
  });

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-900 pt-[6.7rem]">
        <div className="container-wide py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white p-12 text-center">
              <div className="w-20 h-20 border-2 border-gray-900 dark:border-white flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-10 w-10 text-gray-900 dark:text-white" />
              </div>
              
              <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase mb-4">
                Your cart is empty
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium mb-8">
                Add some products to checkout
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.phoneNumber,
          customerEmail: formData.email,
          notificationMethod: formData.notificationMethod,
          storeLocation: formData.storeLocation === '719 W William Cannon Dr #105, Austin, TX 78745' ? 'william-cannon' : 'cameron-rd',
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            replacementPreference: formData.replacementPreference,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Clear cart and redirect to tracking page
      clearCart();
      router.push(`/orders/track?orderId=${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  const taxAmount = subtotal * 0.0825;
  const total = subtotal + taxAmount;

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 pt-[6.7rem]">
      <div className="container-wide py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 uppercase tracking-wide font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Cart
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white uppercase mb-4">
              Checkout
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">
              Complete your order for in-store pickup
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Customer Information */}
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white p-6">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase mb-6 flex items-center gap-2">
                    <User className="h-6 w-6" />
                    Customer Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="customerName" className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="customerName"
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-white outline-none transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                        Phone Number {formData.notificationMethod === 'sms' ? '*' : '(Optional)'}
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        required={formData.notificationMethod === 'sms'}
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-white outline-none transition-colors"
                        placeholder="+1 (512) 555-0123"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                        Email {formData.notificationMethod === 'email' ? '*' : '(Optional)'}
                      </label>
                      <input
                        type="email"
                        id="email"
                        required={formData.notificationMethod === 'email'}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-white outline-none transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Method */}
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white p-6">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase mb-6 flex items-center gap-2">
                    <Mail className="h-6 w-6" />
                    Order Updates
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    How would you like to receive order status updates?
                  </p>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border-2 border-gray-900 dark:border-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="notificationMethod"
                        value="email"
                        checked={formData.notificationMethod === 'email'}
                        onChange={(e) => setFormData({ ...formData, notificationMethod: e.target.value as 'email' | 'sms' })}
                        className="mt-1 accent-gray-900 dark:accent-white"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white uppercase flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          Email Notifications
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Get detailed order updates via email (Recommended)
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="notificationMethod"
                        value="sms"
                        checked={formData.notificationMethod === 'sms'}
                        onChange={(e) => setFormData({ ...formData, notificationMethod: e.target.value as 'email' | 'sms' })}
                        className="mt-1 accent-gray-900 dark:accent-white"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white uppercase flex items-center gap-2">
                          <Phone className="h-5 w-5" />
                          SMS Text Messages
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Receive quick text message updates
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Pickup Location */}
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white p-6">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase mb-6 flex items-center gap-2">
                    <MapPin className="h-6 w-6" />
                    Pickup Location
                  </h2>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 p-4 border-2 border-gray-900 dark:border-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="storeLocation"
                        value="719 W William Cannon Dr #105, Austin, TX 78745"
                        checked={formData.storeLocation === '719 W William Cannon Dr #105, Austin, TX 78745'}
                        onChange={(e) => setFormData({ ...formData, storeLocation: e.target.value })}
                        className="mt-1 accent-gray-900 dark:accent-white"
                      />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white uppercase">William Cannon Location</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">719 W William Cannon Dr #105</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Austin, TX 78745</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="storeLocation"
                        value="5318 Cameron Rd, Austin, TX 78723"
                        checked={formData.storeLocation === '5318 Cameron Rd, Austin, TX 78723'}
                        onChange={(e) => setFormData({ ...formData, storeLocation: e.target.value })}
                        className="mt-1 accent-gray-900 dark:accent-white"
                      />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white uppercase">Cameron Road Location</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">5318 Cameron Rd</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Austin, TX 78723</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Replacement Preferences */}
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white p-6">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase mb-6">
                    If Item is Unavailable
                  </h2>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="replacementPreference"
                        value="call"
                        checked={formData.replacementPreference === 'call'}
                        onChange={(e) => setFormData({ ...formData, replacementPreference: e.target.value })}
                        className="accent-gray-900 dark:accent-white"
                      />
                      <span className="text-gray-900 dark:text-white uppercase tracking-wide font-medium">Call me for replacement options</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="replacementPreference"
                        value="refund"
                        checked={formData.replacementPreference === 'refund'}
                        onChange={(e) => setFormData({ ...formData, replacementPreference: e.target.value })}
                        className="accent-gray-900 dark:accent-white"
                      />
                      <span className="text-gray-900 dark:text-white uppercase tracking-wide font-medium">Refund the item</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="replacementPreference"
                        value="cancel"
                        checked={formData.replacementPreference === 'cancel'}
                        onChange={(e) => setFormData({ ...formData, replacementPreference: e.target.value })}
                        className="accent-gray-900 dark:accent-white"
                      />
                      <span className="text-gray-900 dark:text-white uppercase tracking-wide font-medium">Cancel the entire order</span>
                    </label>
                  </div>
                </div>

                {/* SMS Consent - Only show if SMS is selected */}
                {formData.notificationMethod === 'sms' && (
                  <div className="bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white p-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={formData.smsConsent}
                        onChange={(e) => setFormData({ ...formData, smsConsent: e.target.checked })}
                        className="mt-1 accent-gray-900 dark:accent-white"
                      />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="mb-2">
                          <span className="font-bold text-gray-900 dark:text-white">I consent to receive SMS notifications</span> about my order status, including order confirmation, preparation updates, and pickup reminders. *
                        </p>
                        <p className="text-xs">
                          Message and data rates may apply. You can opt out at any time by replying STOP. 
                          View our{' '}
                          <a href="/sms-terms.html" target="_blank" className="underline hover:text-gray-900 dark:hover:text-white">
                            SMS Terms
                          </a>
                          .
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-600 p-4">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white p-6 sticky top-24">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase mb-6">
                    Order Summary
                  </h2>

                  {/* Order Items */}
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">
                            {item.product.name}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white ml-4">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 mb-6 pt-4 border-t border-gray-300 dark:border-gray-600">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span className="uppercase tracking-wide text-sm">Subtotal</span>
                      <span className="font-bold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span className="uppercase tracking-wide text-sm">Tax (8.25%)</span>
                      <span className="font-bold">${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-black text-gray-900 dark:text-white uppercase">Total</span>
                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Placing Order...' : 'Place Order'}
                  </button>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Phone className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <p className="uppercase tracking-wide">
                        You&apos;ll receive an SMS when your order is ready for pickup (typically 15 minutes)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
