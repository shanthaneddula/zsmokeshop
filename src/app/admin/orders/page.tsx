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

type TabStatus = 'current' | 'all' | OrderStatus;

function AdminOrdersContent() {
  const [orders, setOrders] = useState<PickupOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabStatus>('current');
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
        const newOrders = data.orders;
        setOrders(newOrders);
        
        // Auto-select the first pending order if none selected, or if a new pending order arrives
        if (newOrders.length > 0) {
          const firstPendingOrder = newOrders.find((o: PickupOrder) => o.status === 'pending');
          
          // If there's a new pending order that we haven't selected yet, auto-select it
          if (firstPendingOrder && (!selectedOrder || selectedOrder.status !== 'pending')) {
            setSelectedOrder(firstPendingOrder);
          }
          // If current selected order is no longer in the list, select the first order
          else if (selectedOrder && !newOrders.find((o: PickupOrder) => o.id === selectedOrder.id)) {
            setSelectedOrder(newOrders[0]);
          }
          // If no order is selected at all, select the first one
          else if (!selectedOrder) {
            setSelectedOrder(newOrders[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, locationFilter, searchQuery, selectedOrder]);

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
          // Check if data has the order property or is the order itself
          setSelectedOrder(data.order || data);
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
    { id: 'current', label: 'Current Orders', icon: <Package className="w-4 h-4" /> },
    { id: 'pending', label: 'New Orders', icon: <Clock className="w-4 h-4" /> },
    { id: 'confirmed', label: 'Confirmed', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'ready', label: 'Ready', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'picked-up', label: 'Completed', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'cancelled', label: 'Cancelled', icon: <XCircle className="w-4 h-4" /> },
    { id: 'no-show', label: 'No-Show', icon: <XCircle className="w-4 h-4" /> },
    { id: 'all', label: 'All Orders', icon: <Package className="w-4 h-4" /> },
  ];

  // Get current active orders (not completed, cancelled, or no-show)
  const currentOrders = orders.filter(o => 
    o.status === 'pending' || o.status === 'confirmed' || o.status === 'ready'
  );

  const getTabCount = (tabId: TabStatus) => {
    if (tabId === 'all') return orders.length;
    if (tabId === 'current') return currentOrders.length;
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
    <div className="max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Pickup Orders</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and track all customer pickup orders</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Location Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value as StoreLocation | 'all')}
              className="w-full sm:w-auto pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black appearance-none bg-white text-sm sm:text-base"
            >
              <option value="all">All Locations</option>
              <option value="william-cannon">William Cannon</option>
              <option value="cameron-rd">Cameron Rd</option>
            </select>
          </div>
          
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-4 overflow-x-auto scrollbar-hide pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedOrder(null);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-3 font-medium transition-colors whitespace-nowrap text-xs sm:text-sm ${
              activeTab === tab.id
                ? 'text-black border-b-2 border-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span className="hidden xs:inline sm:inline">{tab.label}</span>
            <span className="xs:hidden sm:hidden">{tab.label.split(' ')[0]}</span>
            <span className={`px-1.5 sm:px-2 py-0.5 text-xs rounded-full ${
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
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Split View: Orders List + Details Panel */}
      <div className="flex flex-col lg:flex-row gap-4 min-h-[500px] lg:min-h-[600px]">
        {/* Orders List */}
        <div className="w-full lg:w-2/5 xl:w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto max-h-[400px] lg:max-h-[600px] flex-shrink-0">
          {(() => {
            // Filter orders based on active tab
            const displayOrders = activeTab === 'all' 
              ? orders 
              : activeTab === 'current'
              ? currentOrders
              : orders.filter(o => o.status === activeTab);

            if (displayOrders.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Package className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-600">No orders found</p>
                  <p className="text-sm text-gray-500 mt-1">Orders matching your filters will appear here</p>
                </div>
              );
            }

            return (
              <div className="divide-y divide-gray-200">
                {displayOrders.map((order) => {
                const isReady = order.status === 'ready' && order.timeline.readyAt;
                const remainingTime = isReady ? getRemainingTime(order.timeline.readyAt!) : null;
                const expiringSoon = isReady ? isOrderExpiringSoon(order.timeline.readyAt!) : false;
                const isSelected = selectedOrder?.id === order.id;
                const isPending = order.status === 'pending';
                const isNewOrder = isPending && new Date(order.createdAt).getTime() > Date.now() - 300000; // 5 minutes

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-black text-white border-l-4 border-yellow-400 shadow-lg' 
                        : isPending
                        ? 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-500'
                        : 'hover:bg-gray-50'
                    } ${expiringSoon ? 'bg-red-50' : ''} ${
                      isNewOrder ? 'animate-pulse' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {order.orderNumber}
                          </span>
                          {isNewOrder && !isSelected && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-green-600 text-white rounded animate-pulse">
                              NEW
                            </span>
                          )}
                          {expiringSoon && remainingTime !== null && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              {Math.floor(remainingTime / 60000)}m
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${isSelected ? 'text-gray-200' : 'text-gray-600'}`}>
                          {order.customerName}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${
                        isSelected 
                          ? 'bg-white text-black border-white' 
                          : getStatusColor(order.status)
                      }`}>
                        {getStatusIcon(order.status)}
                        {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ') : 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className={`flex items-center gap-3 ${isSelected ? 'text-gray-200' : 'text-gray-600'}`}>
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          {order.items.length} items
                        </span>
                        <span className={`flex items-center gap-1 font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                          <DollarSign className="w-3 h-3" />
                          {order.total.toFixed(2)}
                        </span>
                      </div>
                      <span className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                        {formatShortTime(order.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            );
          })()}
        </div>

        {/* Order Details Panel */}
        <div className="w-full lg:flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto max-h-[500px] lg:max-h-[600px] min-w-0">
          {!selectedOrder ? (
            <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center min-h-[200px]">
              <Package className="w-12 h-12 sm:w-20 sm:h-20 text-gray-300 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No Order Selected</h3>
              <p className="text-sm text-gray-600">Select an order from the list to view details</p>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              {/* Order Header */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Order {selectedOrder.orderNumber}</h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Placed {formatTime(selectedOrder.timeline?.placedAt || selectedOrder.createdAt)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm font-semibold self-start ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status?.toUpperCase().replace('-', ' ') || 'UNKNOWN'}
                  </span>
                </div>

                {/* Time Warning for Ready Orders */}
                {selectedOrder.status === 'ready' && selectedOrder.timeline.readyAt && (() => {
                  const remaining = getRemainingTime(selectedOrder.timeline.readyAt);
                  const expiringSoon = isOrderExpiringSoon(selectedOrder.timeline.readyAt);
                  const expired = remaining === null;

                  if (expired) {
                    return (
                      <div className="mb-3 sm:mb-4 bg-red-50 border-2 border-red-600 rounded-lg p-3 sm:p-4 flex items-start animate-pulse">
                        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                        <div>
                          <h3 className="font-bold text-red-900 text-sm sm:text-lg">PICKUP WINDOW EXPIRED</h3>
                          <p className="text-red-700 text-xs sm:text-sm mt-1">This order should be marked as no-show</p>
                        </div>
                      </div>
                    );
                  }

                  if (expiringSoon) {
                    return (
                      <div className="mb-3 sm:mb-4 bg-orange-50 border-2 border-orange-500 rounded-lg p-3 sm:p-4 flex items-start">
                        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0 animate-pulse" />
                        <div className="flex-1">
                          <h3 className="font-bold text-orange-900 text-sm sm:text-lg">EXPIRING SOON</h3>
                          <p className="text-orange-700 font-mono text-lg sm:text-2xl mt-1 font-bold">
                            {formatRemainingTime(selectedOrder.timeline.readyAt)}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="mb-3 sm:mb-4 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-start">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900 text-sm">Pickup Window Active</h3>
                        <p className="text-green-700 font-mono text-base sm:text-lg mt-1 font-semibold">
                          {formatRemainingTime(selectedOrder.timeline.readyAt)}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Customer Information */}
              <div className="mb-4 sm:mb-6 bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  Customer Information
                </h3>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <a href={`tel:${selectedOrder.customerPhone}`} className="text-gray-700 text-sm sm:text-base underline">{selectedOrder.customerPhone}</a>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-xs sm:text-sm">
                      {selectedOrder.storeLocation === 'william-cannon'
                        ? 'William Cannon - 719 W William Cannon Dr #105'
                        : 'Cameron Rd - 5318 Cameron Rd'}
                    </span>
                  </div>
                </div>
                {selectedOrder.customerNotes && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-600 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                      <span className="italic">&quot;{selectedOrder.customerNotes}&quot;</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="mb-4 sm:mb-6">
                <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  Order Items ({selectedOrder.items.length})
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{item.productName}</h4>
                        <p className="text-[10px] sm:text-sm text-gray-600">{item.category}</p>
                        <div className="flex items-center gap-2 sm:gap-3 mt-1">
                          <span className="text-[10px] sm:text-sm text-gray-700">Qty: {item.quantity}</span>
                          <span className="text-[10px] sm:text-sm text-gray-700">${item.pricePerUnit.toFixed(2)} each</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-gray-900 text-xs sm:text-sm">${item.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-4 sm:mb-6 bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="space-y-1.5 sm:space-y-2 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax:</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Now more prominent */}
              {selectedOrder.status === 'pending' && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                  <h3 className="font-bold text-yellow-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    Action Required - New Order
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmed')}
                      disabled={updating}
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors font-bold text-sm sm:text-lg disabled:opacity-50 shadow-lg"
                    >
                      ✓ Confirm Order
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                      disabled={updating}
                      className="px-4 sm:px-6 py-3 sm:py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors font-bold text-sm disabled:opacity-50 shadow-lg"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Other Action Buttons */}
              {selectedOrder.status !== 'pending' && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
                  {selectedOrder.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'ready')}
                      disabled={updating}
                      className="flex-1 px-4 sm:px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors font-semibold text-sm disabled:opacity-50"
                    >
                      Mark as Ready
                    </button>
                  )}
                  {selectedOrder.status === 'ready' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'picked-up')}
                        disabled={updating}
                        className="flex-1 px-4 sm:px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors font-semibold text-sm disabled:opacity-50"
                      >
                        Mark as Picked Up
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'no-show')}
                        disabled={updating}
                        className="px-4 sm:px-6 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors font-semibold text-sm disabled:opacity-50"
                      >
                        No-Show
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Store Notes */}
              {selectedOrder.storeNotes && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-1 sm:mb-2 text-sm">Store Notes</h4>
                  <p className="text-yellow-800 text-xs sm:text-sm">{selectedOrder.storeNotes}</p>
                </div>
              )}

              {/* Communications Log */}
              {selectedOrder.communications && selectedOrder.communications.length > 0 && (
                <div className="mt-4 sm:mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    Communications ({selectedOrder.communications.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.communications.map((comm) => (
                      <div key={comm.id} className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase">
                            {comm.method} - {comm.direction.replace('-', ' ')}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500">{formatTime(comm.timestamp)}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-800">{comm.message}</p>
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
  );
}

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <AdminOrdersContent />
    </AdminLayout>
  );
}
