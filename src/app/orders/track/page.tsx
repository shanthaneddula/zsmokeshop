'use client';

import { useState } from 'react';
import { Package, Phone, Search, CheckCircle, Clock, XCircle, AlertCircle, MapPin, ShoppingBag } from 'lucide-react';
import { PickupOrder, OrderStatus } from '@/types/orders';
import Image from 'next/image';

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [order, setOrder] = useState<PickupOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSearched(true);
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phoneNumber.trim())}`);
      
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-black uppercase tracking-wider">Track Your Order</h1>
          <p className="text-gray-400 mt-2 font-light">Enter your details to check order status</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Form */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-none p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Order Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="ZS-000001"
                className="w-full px-4 py-4 bg-black border-2 border-gray-700 focus:border-white text-white placeholder-gray-600 transition-colors font-mono text-lg uppercase tracking-wider"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (512) 555-0123"
                  className="w-full pl-12 pr-4 py-4 bg-black border-2 border-gray-700 focus:border-white text-white placeholder-gray-600 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 transition-colors flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></div>
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
            <div className="mt-6 p-4 bg-red-900/20 border-2 border-red-600 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-500 uppercase tracking-wide text-sm">Error</p>
                <p className="text-red-400 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && statusInfo && StatusIcon && locationInfo && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-4 p-8`}>
              <div className="flex items-start space-x-4">
                <StatusIcon className={`w-12 h-12 ${statusInfo.color} flex-shrink-0`} />
                <div className="flex-1">
                  <h2 className={`text-2xl font-black uppercase tracking-wider ${statusInfo.color}`}>
                    {statusInfo.label}
                  </h2>
                  <p className={`mt-2 ${statusInfo.color} font-medium`}>{statusInfo.message}</p>
                  
                  {order.status === 'ready' && (
                    <div className="mt-4 inline-block bg-black text-white px-4 py-2 font-mono font-bold">
                      <Clock className="inline w-4 h-4 mr-2" />
                      PICKUP IN: {getTimeRemaining()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Details */}
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                  Order Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase text-gray-500">Order Number</p>
                    <p className="text-xl font-mono font-bold tracking-wider">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500">Placed</p>
                    <p className="font-medium">{formatTime(order.timeline.placedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500">Total Amount</p>
                    <p className="text-2xl font-black">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Pickup Location */}
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                  Pickup Location
                </h3>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-white mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-lg">{locationInfo.name}</p>
                    <p className="text-gray-400 text-sm mt-1">{locationInfo.address}</p>
                    <p className="text-gray-400 text-sm">{locationInfo.city}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">
                Order Timeline
              </h3>
              
              <div className="space-y-6">
                {/* Placed */}
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    order.timeline.placedAt ? 'bg-white' : 'bg-gray-800'
                  }`}>
                    <ShoppingBag className={order.timeline.placedAt ? 'text-black' : 'text-gray-600'} size={20} />
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="font-bold uppercase tracking-wide">Order Placed</p>
                    {order.timeline.placedAt && (
                      <p className="text-gray-400 text-sm mt-1">{formatTime(order.timeline.placedAt)}</p>
                    )}
                  </div>
                </div>

                {/* Confirmed */}
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    order.timeline.confirmedAt ? 'bg-white' : 'bg-gray-800'
                  }`}>
                    <CheckCircle className={order.timeline.confirmedAt ? 'text-black' : 'text-gray-600'} size={20} />
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="font-bold uppercase tracking-wide">Confirmed</p>
                    {order.timeline.confirmedAt ? (
                      <p className="text-gray-400 text-sm mt-1">{formatTime(order.timeline.confirmedAt)}</p>
                    ) : (
                      <p className="text-gray-600 text-sm mt-1">Awaiting confirmation</p>
                    )}
                  </div>
                </div>

                {/* Ready */}
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    order.timeline.readyAt ? 'bg-white' : 'bg-gray-800'
                  }`}>
                    <Package className={order.timeline.readyAt ? 'text-black' : 'text-gray-600'} size={20} />
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="font-bold uppercase tracking-wide">Ready for Pickup</p>
                    {order.timeline.readyAt ? (
                      <p className="text-gray-400 text-sm mt-1">{formatTime(order.timeline.readyAt)}</p>
                    ) : (
                      <p className="text-gray-600 text-sm mt-1">Being prepared</p>
                    )}
                  </div>
                </div>

                {/* Picked Up */}
                {order.timeline.completedAt && order.status === 'picked-up' && (
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="text-black" size={20} />
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="font-bold uppercase tracking-wide">Picked Up</p>
                      <p className="text-gray-400 text-sm mt-1">{formatTime(order.timeline.completedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">
                Items in Order
              </h3>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-800 last:border-0 last:pb-0">
                    {item.productImage && (
                      <div className="w-20 h-20 bg-gray-800 flex-shrink-0 overflow-hidden">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate">{item.productName}</h4>
                      <p className="text-sm text-gray-500 uppercase mt-1">{item.category}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-400">
                          Qty: <span className="font-bold text-white">{item.quantity}</span>
                        </p>
                        <p className="font-mono font-bold text-white">${item.totalPrice.toFixed(2)}</p>
                      </div>
                      
                      {item.wasReplaced && item.replacementProductName && (
                        <div className="mt-2 p-2 bg-blue-900/20 border border-blue-600">
                          <p className="text-xs text-blue-400 font-bold uppercase">
                            Replaced with: {item.replacementProductName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-white mt-6 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black uppercase tracking-wider">Total</span>
                  <span className="text-3xl font-black font-mono">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            {(order.status === 'ready' || order.status === 'confirmed') && (
              <div className="bg-gradient-to-r from-amber-600 to-amber-500 border-4 border-amber-400 p-6">
                <h3 className="text-lg font-black uppercase tracking-wider text-white mb-2">
                  Need Help?
                </h3>
                <p className="text-amber-50 font-medium">
                  Contact us at {order.storeLocation === 'william-cannon' ? '(512) XXX-XXXX' : '(512) XXX-XXXX'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {searched && !loading && !order && !error && (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-12 text-center">
            <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase tracking-wider text-gray-400">
              No Orders Found
            </h3>
            <p className="text-gray-600 mt-2">Check your order number and phone number</p>
          </div>
        )}
      </div>
    </div>
  );
}
