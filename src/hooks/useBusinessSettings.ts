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
}

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/admin/settings');
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

  // Helper function to get primary phone number
  const getPrimaryPhone = () => {
    if (!settings) return '(512) 227-9820';
    return settings.businessPhone || settings.locations?.[0]?.phone || '(512) 227-9820';
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