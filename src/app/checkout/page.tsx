'use client';

import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingBag, MapPin, Phone, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { ReplacementPreference, StoreLocation } from '@/types/orders';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [storeLocation, setStoreLocation] = useState<StoreLocation>('william-cannon');
  const [customerNotes, setCustomerNotes] = useState('');
  const [replacementPreferences, setReplacementPreferences] = useState<Record<string, ReplacementPreference>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  // Redirect if cart is empty
  if (items.length === 0 && !orderPlaced) {
    router.push('/cart');
    return null;
  }

  const getReplacementPreference = (productId: string): ReplacementPreference => {
    return replacementPreferences[productId] || 'call-me';
  };

  const setReplacementPreference = (productId: string, preference: ReplacementPreference) => {
    setReplacementPreferences(prev => ({
      ...prev,
      [productId]: preference,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          storeLocation,
          customerNotes: customerNotes.trim() || undefined,
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            replacementPreference: getReplacementPreference(item.product.id),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Order placed successfully
      setOrderNumber(data.order.orderNumber);
      setOrderPlaced(true);
      clearCart();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-[6.7rem] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Order Number: <strong className="text-purple-600 dark:text-purple-400">{orderNumber}</strong>
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                ✅ Check your phone for confirmation SMS
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                ✅ We'll text you when your order is ready
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                ✅ Pick up within 1 hour after ready notification
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Pay in store when you pick up your order
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/shop')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-[6.7rem] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Checkout - Pickup Order
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your information to place your pickup order
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Customer Info & Preferences */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="+1 (512) 555-0123"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      We&apos;ll send SMS updates about your order. Message & data rates may apply.
                    </p>
                  </div>
                  
                  {/* SMS Consent Checkbox */}
                  <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <input
                      type="checkbox"
                      id="sms-consent"
                      required
                      className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="sms-consent" className="text-sm text-gray-700 dark:text-gray-300">
                      I consent to receive SMS notifications about my order status at the phone number provided. 
                      Message and data rates may apply. You can opt-out anytime by replying STOP. 
                      <a href="/sms-terms.html" target="_blank" className="text-purple-600 hover:text-purple-700 underline ml-1">
                        View SMS Terms & Privacy
                      </a>
                    </label>
                  </div>
                </div>
              </div>

              {/* Store Location */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Pickup Location *
                </h2>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
                    <input
                      type="radio"
                      name="location"
                      value="william-cannon"
                      checked={storeLocation === 'william-cannon'}
                      onChange={(e) => setStoreLocation(e.target.value as StoreLocation)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">William Cannon Location</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">719 W William Cannon Dr #105</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Austin, TX 78745</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
                    <input
                      type="radio"
                      name="location"
                      value="cameron-rd"
                      checked={storeLocation === 'cameron-rd'}
                      onChange={(e) => setStoreLocation(e.target.value as StoreLocation)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">Cameron Rd Location</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">5318 Cameron Rd</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Austin, TX 78723</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Replacement Preferences */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Replacement Preferences
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  If an item is unavailable, how should we handle it?
                </p>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex gap-3 mb-3">
                        <div className="flex-shrink-0 w-16 h-16 relative rounded bg-gray-100">
                          {item.product.image && (
                            <Image src={item.product.image} alt={item.product.name} fill className="object-cover rounded" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={`replacement-${item.product.id}`}
                            value="substitute"
                            checked={getReplacementPreference(item.product.id) === 'substitute'}
                            onChange={() => setReplacementPreference(item.product.id, 'substitute')}
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            Substitute with similar item
                          </span>
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={`replacement-${item.product.id}`}
                            value="refund"
                            checked={getReplacementPreference(item.product.id) === 'refund'}
                            onChange={() => setReplacementPreference(item.product.id, 'refund')}
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            Refund if unavailable
                          </span>
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={`replacement-${item.product.id}`}
                            value="call-me"
                            checked={getReplacementPreference(item.product.id) === 'call-me'}
                            onChange={() => setReplacementPreference(item.product.id, 'call-me')}
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            Text me to confirm
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Additional Notes (Optional)
                </h2>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Any special requests or instructions..."
                />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax (8.25%)</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Placing Order...' : 'Place Order'}
                </button>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>Pickup Instructions:</strong>
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>✓ You'll receive SMS confirmation</li>
                    <li>✓ We'll text when order is ready</li>
                    <li>✓ Pick up within 1 hour</li>
                    <li>✓ Pay in store at pickup</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
