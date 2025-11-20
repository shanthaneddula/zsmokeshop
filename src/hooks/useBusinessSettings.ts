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
        const response = await fetch('/api/admin/settings', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
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
        // Fallback to default values if API fails
        setSettings({
          storeName: 'Z SMOKE SHOP',
          businessPhone: '(512) 227-9820',
          businessEmail: 'info@zsmokeshop.com',
          locations: [
            {
              id: '1',
              name: 'Z SMOKE SHOP - William Cannon',
              address: '719 W William Cannon Dr #105, Austin, TX 78745',
              phone: '(512) 227-9820',
              hours: 'Mon-Thu: 10 AM - 11 PM\nFri-Sat: 10 AM - 12 AM\nSun: 10 AM - 11 PM',
              isActive: true,
              isPrimary: true
            },
            {
              id: '2',
              name: 'Z SMOKE SHOP - Cameron Rd',
              address: '5318 Cameron Rd, Austin, TX 78723',
              phone: '(512) 227-9820',
              hours: 'Mon-Thu: 10 AM - 11 PM\nFri-Sat: 10 AM - 12 AM\nSun: 10 AM - 11 PM',
              isActive: true,
              isPrimary: false
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
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