'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, Phone, Search, CheckCircle, Clock, XCircle, AlertCircle, MapPin, ShoppingBag } from 'lucide-react';
import { PickupOrder, OrderStatus } from '@/types/orders';
import Image from 'next/image';

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [order, setOrder] = useState<PickupOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [autoLoaded, setAutoLoaded] = useState(false);

  // Auto-load order if coming from checkout
  useEffect(() => {
    const orderId = searchParams.get('orderId') || searchParams.get('orderNumber');
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');
    
    if (orderId && (phone || email) && !autoLoaded) {
      setOrderNumber(orderId);
      if (phone) {
        setPhoneNumber(phone);
      }
      setAutoLoaded(true);
      
      // Auto-search the order
      const autoSearch = async () => {
        setLoading(true);
        setError('');
        setSearched(true);
        
        try {
          const contactParam = phone ? `phone=${encodeURIComponent(phone)}` : `email=${encodeURIComponent(email || '')}`;
          const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderId)}&${contactParam}`);
          
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Order not found');
          }

          const data = await res.json();
          setOrder(data.order);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to find order');
        } finally {
          setLoading(false);
        }
      };
      
      autoSearch();
    }
  }, [searchParams, autoLoaded]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSearched(true);
    setOrder(null);

    try {
      // Use phone if provided, otherwise fall back to email field as phone
      const contactParam = phoneNumber.includes('@') 
        ? `email=${encodeURIComponent(phoneNumber.trim())}`
        : `phone=${encodeURIComponent(phoneNumber.trim())}`;
        
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}&${contactParam}`);
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Order not found');
      }

      const data = await res.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'ORDER RECEIVED',
          message: 'We received your order and will confirm shortly',
        };
      case 'confirmed':
        return {
          icon: CheckCircle,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'CONFIRMED',
          message: 'Your order is confirmed and being prepared',
        };
      case 'ready':
        return {
          icon: Package,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'READY FOR PICKUP',
          message: 'Your order is ready! Please pick up within 1 hour',
        };
      case 'picked-up':
        return {
          icon: CheckCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'COMPLETED',
          message: 'Order picked up successfully',
        };
      case 'no-show':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'EXPIRED',
          message: 'Pickup window expired. Please contact store',
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'CANCELLED',
          message: 'This order has been cancelled',
        };
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimeRemaining = () => {
    if (!order || !order.timeline.readyAt) return null;
    
    const readyTime = new Date(order.timeline.readyAt).getTime();
    const expiryTime = readyTime + (60 * 60 * 1000);
    const now = Date.now();
    const remaining = expiryTime - now;

    if (remaining <= 0) return 'Expired';

    const minutes = Math.floor(remaining / 60000);
    return `${minutes} min`;
  };

  const getLocationInfo = (location: string) => {
    if (location === 'william-cannon') {
      return {
        name: 'William Cannon',
        address: '719 W William Cannon Dr #105',
        city: 'Austin, TX 78745',
      };
    }
    return {
      name: 'Cameron Rd',
      address: '5318 Cameron Rd',
      city: 'Austin, TX 78723',
    };
  };

  const statusInfo = order ? getStatusInfo(order.status) : null;
  const StatusIcon = statusInfo?.icon;
  const locationInfo = order ? getLocationInfo(order.storeLocation) : null;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Package className="w-20 h-20 text-white mx-auto mb-6" />
            <h1 className="text-5xl font-black text-white mb-4 tracking-wider uppercase">Track Your Order</h1>
            <p className="text-gray-300 text-xl font-light">Enter your details to check order status</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Form */}
        <div className="bg-white border-4 border-black p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wider">
                Order Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="ZS-000001"
                className="w-full px-4 py-4 border-2 border-black bg-white text-black placeholder-gray-600 focus:outline-none focus:border-gray-700 font-mono text-lg tracking-wider transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wider">
                Phone Number or Email Address
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (512) 555-0123 or email@example.com"
                  className="w-full pl-12 pr-4 py-4 border-2 border-black bg-white text-black placeholder-gray-600 focus:outline-none focus:border-gray-700 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white font-black uppercase tracking-wider hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 text-sm">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && statusInfo && StatusIcon && locationInfo && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className="bg-black border-4 border-white p-8">
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 bg-white flex items-center justify-center">
                  <StatusIcon className="w-10 h-10 text-black" />
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-wider">
                    {statusInfo.label}
                  </h2>
                  <p className="text-gray-300 text-xl mb-6 font-light">{statusInfo.message}</p>
                  
                  {order.status === 'ready' && (
                    <div className="bg-white border-2 border-black px-6 py-3 inline-flex items-center">
                      <Clock className="w-5 h-5 mr-3 text-black" />
                      <span className="text-black font-black uppercase tracking-wider">
                        Pickup within: {getTimeRemaining()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Details */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Order Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Order Number</p>
                    <p className="text-2xl font-bold text-gray-900 font-mono tracking-wider">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Placed</p>
                    <p className="text-lg font-medium text-gray-900">{formatTime(order.timeline.placedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-green-600">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Pickup Location */}
              <div className="bg-white border-4 border-black p-8">
                <h3 className="text-sm font-black text-black uppercase tracking-wider mb-6">
                  Pickup Location
                </h3>
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-black flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-black uppercase tracking-wide">{locationInfo.name}</p>
                    <p className="text-black mt-2 font-medium text-lg">{locationInfo.address}</p>
                    <p className="text-black font-medium text-lg">{locationInfo.city}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border-4 border-black p-8">
              <h3 className="text-sm font-black text-black uppercase tracking-wider mb-8">
                Order Timeline
              </h3>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-black"></div>
                
                <div className="space-y-10">
                  {/* Placed */}
                  <div className="flex items-start space-x-6 relative">
                    <div className={`w-16 h-16 flex items-center justify-center flex-shrink-0 z-10 ${
                      order.timeline.placedAt ? 'bg-black border-4 border-white' : 'bg-gray-400 border-4 border-gray-200'
                    }`}>
                      <ShoppingBag className={order.timeline.placedAt ? 'text-white' : 'text-gray-600'} size={24} />
                    </div>
                    <div className="flex-1 pt-3">
                      <p className="text-xl font-black text-black uppercase tracking-wide">Order Placed</p>
                      {order.timeline.placedAt && (
                        <p className="text-gray-700 mt-2 font-medium">{formatTime(order.timeline.placedAt)}</p>
                      )}
                    </div>
                  </div>

                  {/* Confirmed */}
                  <div className="flex items-start space-x-6 relative">
                    <div className={`w-16 h-16 flex items-center justify-center flex-shrink-0 z-10 ${
                      order.timeline.confirmedAt ? 'bg-black border-4 border-white' : 'bg-gray-400 border-4 border-gray-200'
                    }`}>
                      <CheckCircle className={order.timeline.confirmedAt ? 'text-white' : 'text-gray-600'} size={24} />
                    </div>
                    <div className="flex-1 pt-3">
                      <p className="text-xl font-black text-black uppercase tracking-wide">Order Confirmed</p>
                      {order.timeline.confirmedAt ? (
                        <p className="text-gray-700 mt-2 font-medium">{formatTime(order.timeline.confirmedAt)}</p>
                      ) : (
                        <p className="text-gray-500 mt-2 font-medium">Awaiting confirmation</p>
                      )}
                    </div>
                  </div>

                  {/* Ready */}
                  <div className="flex items-start space-x-4 relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      order.timeline.readyAt ? 'bg-green-100 border-4 border-green-500' : 'bg-gray-100 border-4 border-gray-300'
                    }`}>
                      <Package className={order.timeline.readyAt ? 'text-green-600' : 'text-gray-400'} size={20} />
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-lg font-semibold text-gray-900">Ready for Pickup</p>
                      {order.timeline.readyAt ? (
                        <p className="text-gray-600 mt-1">{formatTime(order.timeline.readyAt)}</p>
                      ) : (
                        <p className="text-gray-500 mt-1">Being prepared</p>
                      )}
                    </div>
                  </div>

                  {/* Picked Up */}
                  {order.timeline.completedAt && order.status === 'picked-up' && (
                    <div className="flex items-start space-x-4 relative">
                      <div className="w-12 h-12 rounded-full bg-green-100 border-4 border-green-500 flex items-center justify-center flex-shrink-0 z-10">
                        <CheckCircle className="text-green-600" size={20} />
                      </div>
                      <div className="flex-1 pt-2">
                        <p className="text-lg font-semibold text-gray-900">Order Completed</p>
                        <p className="text-gray-600 mt-1">{formatTime(order.timeline.completedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
                Items in Order
              </h3>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                    {item.productImage && (
                      <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex-shrink-0 overflow-hidden">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{item.productName}</h4>
                      <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Qty: <span className="font-semibold text-gray-900">{item.quantity}</span>
                        </p>
                        <p className="text-lg font-bold text-green-600">${item.totalPrice.toFixed(2)}</p>
                      </div>
                      
                      {item.wasReplaced && item.replacementProductName && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-800 font-semibold">
                            Replaced with: {item.replacementProductName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-green-600">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            {(order.status === 'ready' || order.status === 'confirmed') && (
              <div className="bg-green-50 border-l-4 border-green-400 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Need Help?
                </h3>
                <p className="text-green-700">
                  Contact us at {order.storeLocation === 'william-cannon' ? '(512) XXX-XXXX' : '(512) XXX-XXXX'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {searched && !loading && !order && !error && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Orders Found
            </h3>
            <p className="text-gray-600">Check your order number and phone number</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-6"></div>
          <p className="text-white text-xl font-black uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}
