'use client';

import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { Bell, X, Settings as SettingsIcon, Volume2, VolumeX, Clock } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function OrderNotificationBell() {
  const { newOrders, unreadCount, settings, markAsRead, clearAll, updateSettings, stopNotificationSound } = useOrderNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleTestSound = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.7;
    audio.play().catch(err => {
      console.error('Error playing test sound:', err);
      alert('Could not play sound. Please check browser permissions.');
    });
  };

  const handleStopSound = () => {
    stopNotificationSound();
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-black text-white bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-gray-700 shadow-lg z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-gray-900 dark:border-gray-700">
              <h3 className="text-sm font-black uppercase tracking-wide text-gray-900 dark:text-white">
                New Orders
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  aria-label="Settings"
                >
                  <SettingsIcon className="w-4 h-4" />
                </button>
                {unreadCount > 0 && (
                  <>
                    <button
                      onClick={handleStopSound}
                      className="px-2 py-1 text-xs font-bold uppercase tracking-wide bg-red-600 text-white hover:bg-red-700 transition-colors rounded"
                    >
                      Stop Sound
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-xs font-bold uppercase tracking-wide text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Clear All
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="p-4 border-b-2 border-gray-900 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-3">
                  {/* Sound Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                      {settings.soundEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                      Sound Alerts
                    </span>
                    <button
                      onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.soundEnabled ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform ${
                          settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Polling Interval */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Check Interval
                    </span>
                    <select
                      value={settings.pollingInterval}
                      onChange={(e) => updateSettings({ pollingInterval: Number(e.target.value) })}
                      className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 focus:outline-none focus:border-gray-900 dark:focus:border-white"
                    >
                      <option value={10000}>10 sec</option>
                      <option value={30000}>30 sec</option>
                      <option value={60000}>1 min</option>
                      <option value={300000}>5 min</option>
                    </select>
                  </div>

                  {/* Test Sound Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleTestSound}
                      className="w-full px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" />
                      Test Sound
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {newOrders.length > 0 ? (
                newOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Link
                          href={`/admin/orders`}
                          onClick={() => {
                            markAsRead(order.id);
                            setIsOpen(false);
                          }}
                          className="text-sm font-bold text-gray-900 dark:text-white hover:underline"
                        >
                          Order #{order.id.substring(0, 8).toUpperCase()}
                        </Link>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {order.customerName}
                        </p>
                      </div>
                      <button
                        onClick={() => markAsRead(order.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Mark as read"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(order.total)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(order.timeline.placedAt)}
                      </span>
                      <span className="px-2 py-1 text-xs font-black uppercase tracking-wide bg-yellow-100 text-yellow-800 border border-yellow-600">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No new orders</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You&apos;re all caught up!
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {newOrders.length > 0 && (
              <div className="p-3 border-t-2 border-gray-900 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <Link
                  href="/admin/orders"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm font-black uppercase tracking-wide text-gray-900 dark:text-white hover:underline"
                >
                  View All Orders
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
