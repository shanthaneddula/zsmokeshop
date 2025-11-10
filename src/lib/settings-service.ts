import { kv } from '@vercel/kv';
import { promises as fs } from 'fs';
import path from 'path';
import Redis from 'ioredis';

const CONFIG_FILE = path.join(process.cwd(), 'src/data/admin-config.json');
const KV_KEY = 'business-settings';

// Initialize Redis client if REDIS_URL is provided
let redisClient: Redis | null = null;
if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });
    console.log('📊 Redis client initialized and connecting...');
  } catch (error) {
    console.error('❌ Failed to initialize Redis client:', error);
  }
}

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
      // Try Redis Cloud first (if REDIS_URL is set)
      if (redisClient) {
        console.log('📊 Using Redis Cloud for settings');
        try {
          const redisSettings = await redisClient.get(KV_KEY);
          if (redisSettings) {
            const parsed = JSON.parse(redisSettings);
            console.log('📊 Retrieved settings from Redis');
            return parsed;
          }
          console.log('📊 No settings found in Redis, checking other sources');
        } catch (redisError) {
          console.error('📊 Redis error, falling back:', redisError);
        }
      }

      // Try Vercel KV (Upstash) if configured
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
      
      // Seed Redis if available and no settings there
      if (redisClient && settings) {
        try {
          console.log('📊 Seeding Redis with local settings');
          await redisClient.set(KV_KEY, JSON.stringify(settings));
        } catch (redisError) {
          console.error('📊 Failed to seed Redis:', redisError);
        }
      }
      
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

      // Update Redis Cloud first (if configured)
      if (redisClient) {
        console.log('📊 Updating settings in Redis Cloud');
        try {
          await redisClient.set(KV_KEY, JSON.stringify(updatedSettings));
          console.log('📊 Settings updated in Redis successfully');
          return updatedSettings;
        } catch (redisError) {
          console.error('📊 Redis update failed:', redisError);
          // Continue to try other methods
        }
      }

      // Update Vercel KV (Upstash) if configured
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        console.log('📊 Updating settings in Vercel KV');
        await kv.set(KV_KEY, updatedSettings);
        console.log('📊 Settings updated in KV successfully');
        return updatedSettings;
      }

      // Check if running in production without any KV
      if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        console.error('❌ No KV storage configured in production!');
        throw new Error('Redis or Vercel KV is required in production. Please set REDIS_URL or KV_REST_API_URL and KV_REST_API_TOKEN environment variables.');
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