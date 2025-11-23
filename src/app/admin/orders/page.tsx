'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Search,
  RefreshCw,
  MapPin,
  Phone,
  AlertTriangle,
  User,
  DollarSign,
  ShoppingBag,
  MessageSquare
} from 'lucide-react';
import { PickupOrder, OrderStatus, StoreLocation, OrderStats } from '@/types/orders';
import { getRemainingTime, isOrderExpiringSoon, formatRemainingTime } from '@/lib/order-timer-utils';
import AdminLayout from '../components/AdminLayout';

type TabStatus = 'all' | OrderStatus;

function AdminOrdersContent() {
  const [orders, setOrders] = useState<PickupOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [locationFilter, setLocationFilter] = useState<StoreLocation | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PickupOrder | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab);
      if (locationFilter !== 'all') params.append('location', locationFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/orders?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, locationFilter, searchQuery]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/orders?stats=true');
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
    
    const interval = setInterval(() => {
      fetchOrders();
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${orderId}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchOrders(true);
        await fetchStats();
        if (selectedOrder?.id === orderId) {
          const res = await fetch(`/api/orders/${orderId}`);
          const data = await res.json();
          setSelectedOrder(data);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-900 border-gray-300';
      case 'confirmed': return 'bg-gray-200 text-gray-900 border-gray-400';
      case 'ready': return 'bg-black text-white border-black';
      case 'picked-up': return 'bg-white text-gray-900 border-gray-300';
      case 'no-show': return 'bg-gray-800 text-white border-gray-900';
      case 'cancelled': return 'bg-gray-400 text-white border-gray-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <AlertCircle className="w-4 h-4" />;
      case 'ready': return <Package className="w-4 h-4" />;
      case 'picked-up': return <CheckCircle2 className="w-4 h-4" />;
      case 'no-show':
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatShortTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const tabs: { id: TabStatus; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Orders', icon: <Package className="w-4 h-4" /> },
    { id: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
    { id: 'confirmed', label: 'Confirmed', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'ready', label: 'Ready', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'picked-up', label: 'Picked Up', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'no-show', label: 'No-Show', icon: <XCircle className="w-4 h-4" /> },
    { id: 'cancelled', label: 'Cancelled', icon: <XCircle className="w-4 h-4" /> },
  ];

  const getTabCount = (tabId: TabStatus) => {
    if (!stats) return 0;
    if (tabId === 'all') return stats.today.total;
    return orders.filter(o => o.status === tabId).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pickup Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track all customer pickup orders</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Location Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value as StoreLocation | 'all')}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black appearance-none bg-white"
            >
              <option value="all">All Locations</option>
              <option value="william-cannon">William Cannon</option>
              <option value="cameron-rd">Cameron Rd</option>
            </select>
          </div>
          
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedOrder(null);
            }}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-black border-b-2 border-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            {tab.label}
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === tab.id
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {getTabCount(tab.id)}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number, customer name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Split View: Orders List + Details Panel */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Orders List */}
        <div className="w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600">No orders found</p>
              <p className="text-sm text-gray-500 mt-1">Orders matching your filters will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => {
                const isReady = order.status === 'ready' && order.timeline.readyAt;
                const remainingTime = isReady ? getRemainingTime(order.timeline.readyAt!) : null;
                const expiringSoon = isReady ? isOrderExpiringSoon(order.timeline.readyAt!) : false;
                const isSelected = selectedOrder?.id === order.id;

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-gray-100 border-l-4 border-black' : 'hover:bg-gray-50'
                    } ${expiringSoon ? 'bg-red-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{order.orderNumber}</span>
                          {expiringSoon && remainingTime !== null && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              {Math.floor(remainingTime / 60000)}m
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 text-gray-600">
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          {order.items.length} items
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-gray-900">
                          <DollarSign className="w-3 h-3" />
                          {order.total.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatShortTime(order.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Details Panel */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto">
          {!selectedOrder ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Package className="w-20 h-20 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Order Selected</h3>
              <p className="text-gray-600">Select an order from the list to view details</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Order Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Order {selectedOrder.orderNumber}</h2>
                    <p className="text-gray-600 mt-1">
                      Placed {formatTime(selectedOrder.timeline?.placedAt || selectedOrder.createdAt)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status.toUpperCase().replace('-', ' ')}
                  </span>
                </div>

                {/* Time Warning for Ready Orders */}
                {selectedOrder.status === 'ready' && selectedOrder.timeline.readyAt && (() => {
                  const remaining = getRemainingTime(selectedOrder.timeline.readyAt);
                  const expiringSoon = isOrderExpiringSoon(selectedOrder.timeline.readyAt);
                  const expired = remaining === null;

                  if (expired) {
                    return (
                      <div className="mb-4 bg-red-50 border-2 border-red-600 rounded-lg p-4 flex items-start animate-pulse">
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
                      <div className="mb-4 bg-orange-50 border-2 border-orange-500 rounded-lg p-4 flex items-start">
                        <AlertTriangle className="w-6 h-6 text-orange-600 mt-0.5 mr-3 flex-shrink-0 animate-pulse" />
                        <div className="flex-1">
                          <h3 className="font-bold text-orange-900 text-lg">EXPIRING SOON</h3>
                          <p className="text-orange-700 font-mono text-2xl mt-1 font-bold">
                            {formatRemainingTime(selectedOrder.timeline.readyAt)}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                      <Clock className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900">Pickup Window Active</h3>
                        <p className="text-green-700 font-mono text-lg mt-1 font-semibold">
                          {formatRemainingTime(selectedOrder.timeline.readyAt)}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Customer Information */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{selectedOrder.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {selectedOrder.storeLocation === 'william-cannon'
                        ? 'William Cannon - 719 W William Cannon Dr #105'
                        : 'Cameron Rd - 5318 Cameron Rd'}
                    </span>
                  </div>
                </div>
                {selectedOrder.customerNotes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="italic">&quot;{selectedOrder.customerNotes}&quot;</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order Items ({selectedOrder.items.length})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <p className="text-sm text-gray-600">{item.category}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-700">Qty: {item.quantity}</span>
                          <span className="text-sm text-gray-700">${item.pricePerUnit.toFixed(2)} each</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${item.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax:</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedOrder.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmed')}
                      disabled={updating}
                      className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
                    >
                      Confirm Order
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                      disabled={updating}
                      className="px-6 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'ready')}
                    disabled={updating}
                    className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
                  >
                    Mark as Ready
                  </button>
                )}
                {selectedOrder.status === 'ready' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'picked-up')}
                      disabled={updating}
                      className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
                    >
                      Mark as Picked Up
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'no-show')}
                      disabled={updating}
                      className="px-6 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold disabled:opacity-50"
                    >
                      No-Show
                    </button>
                  </>
                )}
              </div>

              {/* Store Notes */}
              {selectedOrder.storeNotes && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Store Notes</h4>
                  <p className="text-yellow-800">{selectedOrder.storeNotes}</p>
                </div>
              )}

              {/* Communications Log */}
              {selectedOrder.communications && selectedOrder.communications.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Communications ({selectedOrder.communications.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.communications.map((comm) => (
                      <div key={comm.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-600 uppercase">
                            {comm.method} - {comm.direction.replace('-', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">{formatTime(comm.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-800">{comm.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <AdminOrdersContent />
    </AdminLayout>
  );
}
