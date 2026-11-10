'use client';

import { useState, useEffect } from 'react';

interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours?: string;
  isActive?: boolean;
  isPrimary?: boolean;
  googlePlaceId?: string;
  googleMapsUrl?: string;
  yelpBusinessId?: string;
  yelpUrl?: string;
  appleMapsPlaceId?: string;
  appleMapsUrl?: string;
}

interface BusinessSettings {
  storeName?: string;
  businessPhone?: string;
  businessEmail?: string;
  taxRate?: number;
  taxIncludedInPrice?: boolean;
  locations: BusinessLocation[];
  reviewSettings?: {
    enableGoogleReviews: boolean;
    enableYelpReviews: boolean;
    enableAppleReviews: boolean;
    autoRefreshInterval: number;
  };
  enableCart?: boolean;
  showPrices?: boolean;
}

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        // Add timestamp to prevent caching
        const timestamp = Date.now();
        const response = await fetch(`/api/public/business-info?_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        const data = await response.json();
        console.log('📊 Business Settings API Response:', data);
        setSettings(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
        // Fallback only used if the settings API fails. Keep in sync with Admin > Settings.
        setSettings({
          storeName: 'Z SMOKE SHOP',
          businessPhone: '(512) 227-9820',
          businessEmail: 'info@zsmokeshop.com',
          locations: [
            {
              id: '1',
              name: 'Z SMOKE SHOP',
              address: '719 W William Cannon Dr #105, Austin, TX 78745',
              phone: '(512) 227-9820',
              hours: 'Mon-Sun: 08:00 AM - 02:00 AM',
              isActive: true,
              isPrimary: true
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();

    // Listen for settings updates from admin panel
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'settings-updated') {
        console.log('🔄 Settings updated, refreshing...');
        fetchSettings();
      }
    };

    // Also listen for local storage changes in the same window
    const handleLocalUpdate = () => {
      console.log('🔄 Local settings update detected, refreshing...');
      fetchSettings();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settings-refresh', handleLocalUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-refresh', handleLocalUpdate as EventListener);
    };
  }, []);

  // Helper function to format phone number
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '(512) 227-9820';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // Format: 15122279820 -> (512) 227-9820
      const areaCode = cleaned.substring(1, 4);
      const prefix = cleaned.substring(4, 7);
      const number = cleaned.substring(7, 11);
      return `(${areaCode}) ${prefix}-${number}`;
    } else if (cleaned.length === 10) {
      // Format: 5122279820 -> (512) 227-9820
      const areaCode = cleaned.substring(0, 3);
      const prefix = cleaned.substring(3, 6);
      const number = cleaned.substring(6, 10);
      return `(${areaCode}) ${prefix}-${number}`;
    }
    
    // Return as-is if already formatted or unknown format
    return phone;
  };

  // Helper function to get primary phone number
  const getPrimaryPhone = () => {
    if (!settings) return '(512) 227-9820';
    
    const phone = settings.businessPhone || settings.locations?.[0]?.phone || '(512) 227-9820';
    return formatPhoneNumber(phone);
  };

  // Helper function to get active locations
  const getActiveLocations = () => {
    return settings?.locations?.filter(loc => loc.isActive !== false) || settings?.locations || [];
  };

  return { 
    settings, 
    loading, 
    error, 
    getPrimaryPhone, 
    getActiveLocations 
  };
}