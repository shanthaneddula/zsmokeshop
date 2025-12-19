// Order Notifications Hook
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { PickupOrder } from '@/types/orders';

interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  pollingInterval: number; // in milliseconds
}

interface UseOrderNotificationsReturn {
  newOrders: PickupOrder[];
  unreadCount: number;
  settings: NotificationSettings;
  markAsRead: (orderId: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  stopNotificationSound: () => void;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  pollingInterval: 30000, // 30 seconds
};

export function useOrderNotifications(): UseOrderNotificationsReturn {
  const [newOrders, setNewOrders] = useState<PickupOrder[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState<string>(new Date().toISOString());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.7; // Increase volume
      audioRef.current.preload = 'auto'; // Preload the audio
      audioRef.current.loop = true; // Loop the audio for continuous sound
      
      // Log audio initialization
      console.log('🔊 Notification audio initialized:', {
        src: audioRef.current.src,
        volume: audioRef.current.volume,
        loop: audioRef.current.loop
      });
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('orderNotificationSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        console.log('📋 Loaded notification settings:', parsed);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }

    // Cleanup - stop audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    if (settings.soundEnabled && audioRef.current) {
      // Reset audio to beginning
      audioRef.current.currentTime = 0;
      
      audioRef.current.play().catch(err => {
        console.error('Error playing notification sound:', err);
        console.log('Sound settings:', { soundEnabled: settings.soundEnabled, audioElement: !!audioRef.current });
      });
    } else {
      console.log('Sound not played:', { soundEnabled: settings.soundEnabled, audioElement: !!audioRef.current });
    }
  }, [settings.soundEnabled]);

  const stopNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      console.log('🔇 Notification sound stopped');
    }
  }, []);

  const checkForNewOrders = useCallback(async () => {
    if (!settings.enabled) return;

    try {
      const response = await fetch(`/api/orders?since=${lastCheckedTimestamp}&status=pending`);
      
      if (response.ok) {
        const data = await response.json();
        const orders: PickupOrder[] = data.orders || [];

        // Filter out orders we've already seen
        setNewOrders(prev => {
          const trulyNewOrders = orders.filter(
            order => !prev.some(existing => existing.id === order.id)
          );

          if (trulyNewOrders.length > 0) {
            console.log('🔔 New orders detected:', trulyNewOrders.length);
            playNotificationSound();

            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('New Order Received!', {
                body: `${trulyNewOrders.length} new ${trulyNewOrders.length === 1 ? 'order' : 'orders'} received`,
                icon: '/images/admin/notification-icon.png',
                tag: 'new-order',
              });
            }

            setUnreadCount(c => c + trulyNewOrders.length);
            return [...trulyNewOrders, ...prev];
          }

          return prev;
        });

        setLastCheckedTimestamp(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    }
  }, [settings.enabled, playNotificationSound]); // Removed lastCheckedTimestamp and newOrders from dependencies

  // Polling effect
  useEffect(() => {
    if (!settings.enabled) return;

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initial check
    checkForNewOrders();

    // Set up polling
    const intervalId = setInterval(checkForNewOrders, settings.pollingInterval);

    return () => clearInterval(intervalId);
  }, [settings.enabled, settings.pollingInterval, checkForNewOrders]);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('orderNotificationSettings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAsRead = useCallback((orderId: string) => {
    setNewOrders(prev => {
      const updated = prev.filter(order => order.id !== orderId);
      // Stop sound if no pending orders remain
      if (updated.length === 0) {
        stopNotificationSound();
      }
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [stopNotificationSound]);

  const clearAll = useCallback(() => {
    setNewOrders([]);
    setUnreadCount(0);
    stopNotificationSound();
  }, [stopNotificationSound]);

  return {
    newOrders,
    unreadCount,
    settings,
    markAsRead,
    clearAll,
    updateSettings,
    stopNotificationSound,
  };
}
