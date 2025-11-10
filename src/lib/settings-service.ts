import { kv } from '@vercel/kv';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'src/data/admin-config.json');
const KV_KEY = 'business-settings';

interface BusinessSettings {
  storeName?: string;
  businessPhone?: string;
  businessEmail?: string;
  locations: Array<{
    id: string;
    name: string;
    address: string;
    phone: string;
    hours?: string;
    isActive?: boolean;
    isPrimary?: boolean;
  }>;
  reviewSettings?: {
    enableGoogleReviews: boolean;
    enableYelpReviews: boolean;
    enableAppleReviews: boolean;
    autoRefreshInterval: number;
  };
  taxRate?: number;
  currency?: string;
  minimumAge?: number;
  ageVerificationRequired?: boolean;
  ageVerificationMessage?: string;
  orderPrefix?: string;
  orderStartNumber?: number;
  orderExpirationHours?: number;
}

export class SettingsService {
  static async getSettings(): Promise<BusinessSettings> {
    try {
      // Try Vercel KV first (production) - only if both URL and TOKEN are set
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        console.log('📊 Using Vercel KV for settings');
        try {
          const kvSettings = await kv.get<BusinessSettings>(KV_KEY);
          if (kvSettings) {
            console.log('📊 Retrieved settings from KV:', kvSettings);
            return kvSettings;
          }
          console.log('📊 No settings found in KV, checking local file');
        } catch (kvError) {
          console.error('📊 KV error, falling back to local file:', kvError);
        }
      }

      // Fallback to local file (development)
      console.log('📊 Using local file for settings');
      const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
      const config = JSON.parse(configData);
      const settings = config.businessSettings || this.getDefaultSettings();
      
      // If we have KV available and no settings there, seed it from local file
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN && settings) {
        try {
          console.log('📊 Seeding KV with local settings');
          await kv.set(KV_KEY, settings);
        } catch (kvError) {
          console.error('📊 Failed to seed KV, continuing with local settings:', kvError);
        }
      }
      
      return settings;
    } catch (error) {
      console.error('Error reading settings:', error);
      return this.getDefaultSettings();
    }
  }

  static async updateSettings(newSettings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };

      // Update Vercel KV (production) - only if both URL and TOKEN are set
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        console.log('📊 Updating settings in Vercel KV');
        await kv.set(KV_KEY, updatedSettings);
        console.log('📊 Settings updated in KV successfully');
        return updatedSettings;
      }

      // Check if running in production without KV
      if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        console.error('❌ KV environment variables not set in production!');
        throw new Error('Vercel KV is required in production. Please set KV_REST_API_URL and KV_REST_API_TOKEN environment variables.');
      }

      // Update local file (development only)
      console.log('📊 Updating local file settings (development mode)');
      const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
      const config = JSON.parse(configData);
      config.businessSettings = updatedSettings;
      await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
      console.log('📊 Settings updated in local file successfully');
      
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error instanceof Error ? error : new Error('Failed to update settings');
    }
  }

  private static getDefaultSettings(): BusinessSettings {
    return {
      storeName: 'Z SMOKE SHOP',
      businessPhone: '(512) 227-9820',
      businessEmail: 'info@zsmokeshop.com',
      locations: [
        {
          id: '1',
          name: 'Z SMOKE SHOP',
          address: '719 W William Cannon Dr #105, Austin, TX 78745',
          phone: '(512) 227-9820',
          hours: 'Mon-Thu, Sun: 10:00 AM - 11:00 PM | Fri-Sat: 10:00 AM - 12:00 AM',
          isActive: true,
          isPrimary: true
        },
        {
          id: '2',
          name: '5 STAR SMOKE SHOP & GIFTS',
          address: '5318 Cameron Rd, Austin, TX 78723',
          phone: '(661) 371-1413',
          hours: 'Mon-Thu, Sun: 10:00 AM - 11:00 PM | Fri-Sat: 10:00 AM - 12:00 AM',
          isActive: true,
          isPrimary: false
        }
      ],
      reviewSettings: {
        enableGoogleReviews: true,
        enableYelpReviews: true,
        enableAppleReviews: true,
        autoRefreshInterval: 24
      }
    };
  }
}