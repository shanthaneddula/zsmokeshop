'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Clock, 
  Phone, 
  MapPin, 
  Package, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Send,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { PickupOrder, OrderStatus } from '@/types/orders';
import { formatRemainingTime, getRemainingTime, isOrderExpiringSoon } from '@/lib/order-timer-utils';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>('');
  const [order, setOrder] = useState<PickupOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [replacementProductId, setReplacementProductId] = useState('');
  const [replacementNote, setReplacementNote] = useState('');

  useEffect(() => {
    params.then(p => {
      setOrderId(p.id);
      fetchOrder(p.id);
    });
  }, [params]);

  // Update timer every second for ready orders
  useEffect(() => {
    if (order?.status === 'ready' && order.timeline.readyAt) {
      const interval = setInterval(() => {
        // Force re-render to update timer display
        fetchOrder(orderId);
      }, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [order, orderId]);

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/orders/${id}`);
      
      if (!res.ok) {
        throw new Error('Order not found');
      }
      
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    
    try {
      setUpdating(true);
      const res = await fetch(`/api/orders/${order.id}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      await fetchOrder(order.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const suggestReplacement = async () => {
    if (!order || !selectedProduct || !replacementProductId) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/orders/${order.id}/suggest-replacement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalProductId: selectedProduct,
          replacementProductId,
          note: replacementNote,
        }),
      });

      if (!res.ok) throw new Error('Failed to suggest replacement');

      await fetchOrder(order.id);
      setSelectedProduct(null);
      setReplacementProductId('');
      setReplacementNote('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to suggest replacement');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">Order Not Found</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/orders')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'picked-up': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'no-show': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLocationName = (location: string) => {
    return location === 'william-cannon' 
      ? 'William Cannon (719 W William Cannon Dr #105)'
      : 'Cameron Rd (5318 Cameron Rd)';
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/orders')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Orders
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">Placed {formatTime(order.timeline.placedAt)}</p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <span className={`inline-block px-4 py-2 rounded-lg border font-semibold text-sm ${getStatusColor(order.status)}`}>
              {order.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Time Remaining Alert */}
      {order.status === 'ready' && order.timeline.readyAt && (() => {
        const remaining = getRemainingTime(order.timeline.readyAt);
        const expiringSoon = isOrderExpiringSoon(order.timeline.readyAt);
        const expired = remaining === null;
        
        if (expired) {
          return (
            <div className="mb-6 bg-red-50 border-2 border-red-600 rounded-lg p-4 flex items-start animate-pulse">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-red-900 text-lg">PICKUP WINDOW EXPIRED</h3>
                <p className="text-red-700 text-sm mt-1">This order should be marked as no-show</p>
              </div>
            </div>
          );
        }
        
        if (expiringSoon) {
          return (
            <div className="mb-6 bg-orange-50 border-2 border-orange-500 rounded-lg p-4 flex items-start">
              <AlertTriangle className="w-6 h-6 text-orange-600 mt-0.5 mr-3 flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <h3 className="font-bold text-orange-900 text-lg">EXPIRING SOON</h3>
                <p className="text-orange-700 font-mono text-2xl mt-1 font-bold">
                  {formatRemainingTime(order.timeline.readyAt)}
                </p>
              </div>
            </div>
          );
        }
        
        return (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <Clock className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Pickup Window Active</h3>
              <p className="text-green-700 font-mono text-lg mt-1 font-semibold">
                {formatRemainingTime(order.timeline.readyAt)}
              </p>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start">
                <Package className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Customer Name</p>
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium text-gray-900">{order.customerPhone}</p>
                </div>
              </div>
              
              <div className="flex items-start sm:col-span-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Pickup Location</p>
                  <p className="font-medium text-gray-900">{getLocationName(order.storeLocation)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-start border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  {item.productImage && (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-lg mr-4"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.productName}</h3>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Quantity: {item.quantity} × ${item.pricePerUnit.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Preference: <span className="font-medium capitalize">{item.replacementPreference.replace('-', ' ')}</span>
                    </p>
                    
                    {item.wasReplaced && item.replacementProductName && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-900">
                          <strong>Replaced with:</strong> {item.replacementProductName}
                        </p>
                        {item.replacementApprovedAt && (
                          <p className="text-xs text-blue-700 mt-1">
                            Approved {formatTime(item.replacementApprovedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-900">${item.totalPrice.toFixed(2)}</p>
                    
                    {!item.wasReplaced && order.status === 'confirmed' && (
                      <button
                        onClick={() => setSelectedProduct(item.productId)}
                        className="mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
                      >
                        Suggest Replacement
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">${order.total.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
              </p>
            </div>
          </div>

          {/* Communications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Communication History
            </h2>
            
            {order.communications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No communications yet</p>
            ) : (
              <div className="space-y-3">
                {order.communications.map((comm) => (
                  <div key={comm.id} className="border-l-4 border-gray-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        comm.direction.includes('customer') ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {comm.direction === 'to-customer' && '→ Customer'}
                        {comm.direction === 'from-customer' && '← Customer'}
                        {comm.direction === 'to-store' && '→ Store'}
                        {comm.direction === 'from-store' && '← Store'}
                      </span>
                      <span className="text-xs text-gray-500">{formatTime(comm.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comm.message}</p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-gray-500 capitalize">{comm.method}</span>
                      {comm.status && (
                        <span className={`text-xs ${
                          comm.status === 'delivered' ? 'text-green-600' :
                          comm.status === 'sent' ? 'text-blue-600' :
                          'text-red-600'
                        }`}>
                          • {comm.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Actions</h2>
            
            <div className="space-y-3">
              {order.status === 'pending' && (
                <button
                  onClick={() => updateStatus('confirmed')}
                  disabled={updating}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Order
                </button>
              )}
              
              {order.status === 'confirmed' && (
                <button
                  onClick={() => updateStatus('ready')}
                  disabled={updating}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Mark as Ready
                </button>
              )}
              
              {order.status === 'ready' && (
                <>
                  <button
                    onClick={() => updateStatus('picked-up')}
                    disabled={updating}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Picked Up
                  </button>
                  
                  <button
                    onClick={() => updateStatus('no-show')}
                    disabled={updating}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Mark as No-Show
                  </button>
                </>
              )}
              
              {(order.status === 'pending' || order.status === 'confirmed') && (
                <button
                  onClick={() => updateStatus('cancelled')}
                  disabled={updating}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Order
                </button>
              )}
              
              <button
                onClick={() => fetchOrder(orderId)}
                className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Placed</p>
                <p className="text-sm text-gray-600">{formatTime(order.timeline.placedAt)}</p>
              </div>
              
              {order.timeline.confirmedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-900">Confirmed</p>
                  <p className="text-sm text-gray-600">{formatTime(order.timeline.confirmedAt)}</p>
                </div>
              )}
              
              {order.timeline.readyAt && (
                <div>
                  <p className="text-sm font-medium text-gray-900">Ready for Pickup</p>
                  <p className="text-sm text-gray-600">{formatTime(order.timeline.readyAt)}</p>
                </div>
              )}
              
              {/* Picked Up */}
              {order.timeline.completedAt && order.status === 'picked-up' && (
                <div>
                  <p className="text-sm font-medium text-gray-900">Picked Up</p>
                  <p className="text-sm text-gray-600">{formatTime(order.timeline.completedAt)}</p>
                </div>
              )}
              
              {/* No Show */}
              {order.timeline.completedAt && order.status === 'no-show' && (
                <div>
                  <p className="text-sm font-medium text-red-900">No Show</p>
                  <p className="text-sm text-red-600">{formatTime(order.timeline.completedAt)}</p>
                </div>
              )}
              
              {order.timeline.cancelledAt && (
                <div>
                  <p className="text-sm font-medium text-gray-900">Cancelled</p>
                  <p className="text-sm text-gray-600">{formatTime(order.timeline.cancelledAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.storeNotes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Store Notes</h2>
              <p className="text-sm text-gray-700">{order.storeNotes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Replacement Suggestion Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Suggest Replacement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Replacement Product ID
                </label>
                <input
                  type="text"
                  value={replacementProductId}
                  onChange={(e) => setReplacementProductId(e.target.value)}
                  placeholder="Enter product ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note to Customer (Optional)
                </label>
                <textarea
                  value={replacementNote}
                  onChange={(e) => setReplacementNote(e.target.value)}
                  placeholder="e.g., Similar flavor and nicotine strength"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={suggestReplacement}
                  disabled={!replacementProductId || updating}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send SMS
                </button>
                
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setReplacementProductId('');
                    setReplacementNote('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
