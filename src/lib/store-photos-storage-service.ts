// Store Photos Storage Service - Redis/KV/JSON storage for store photos
import { kv } from '@vercel/kv';
import * as fs from 'fs/promises';
import * as path from 'path';

// Store Photo interface
export interface StorePhoto {
  id: string;
  url: string;
  title?: string;
  description?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const REDIS_KEY = 'zsmokeshop:store-photos';
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const JSON_FILE_PATH = path.join(DATA_DIR, 'store-photos.json');

// Initialize Redis client if REDIS_URL is available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redisClient: any = null;

if (process.env.REDIS_URL) {
  import('ioredis').then(({ default: Redis }) => {
    redisClient = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
    console.log('📊 Redis client initialized for store photos...');
  }).catch(error => {
    console.error('❌ Failed to initialize Redis client:', error);
  });
}

// Determine storage method
const isProduction = process.env.NODE_ENV === 'production';
const hasRedis = !!process.env.REDIS_URL;
const hasKVConfig = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const useRedis = hasRedis;
const useKV = !hasRedis && (isProduction || hasKVConfig);

console.log('🔧 Store Photos Storage Service Initialized:', {
  environment: process.env.NODE_ENV,
  hasRedis,
  hasKVConfig,
  useRedis,
  useKV,
  storageMethod: useRedis ? 'Redis Cloud' : useKV ? 'Vercel KV' : 'JSON Files'
});

// Ensure directories exist (for file-based storage)
async function ensureDirectories() {
  if (!useRedis && !useKV) {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }
}

// Read store photos from Redis or JSON
export async function readStorePhotos(): Promise<StorePhoto[]> {
  try {
    console.log('📖 Reading store photos...');
    
    if (useRedis && redisClient) {
      // Use Redis Cloud
      console.log('📡 Reading from Redis Cloud...');
      
      try {
        const data = await redisClient.get(REDIS_KEY);
        if (data) {
          const photos = JSON.parse(data);
          console.log(`✅ Retrieved ${photos?.length || 0} store photos from Redis`);
          return photos;
        }
        console.log('ℹ️ No store photos found in Redis, returning empty array');
        return [];
      } catch (redisError) {
        console.error('❌ Redis error:', redisError);
        throw redisError;
      }
    } else if (useKV) {
      // Use Vercel KV as fallback
      console.log('📡 Reading from Vercel KV...');
      
      try {
        const photos = await kv.get<StorePhoto[]>(REDIS_KEY);
        console.log(`✅ Retrieved ${photos?.length || 0} store photos from KV`);
        return photos || [];
      } catch (kvError) {
        console.error('❌ Vercel KV error:', kvError);
        
        if (isProduction) {
          throw new Error('Storage service unavailable. Please ensure Redis or Vercel KV is configured.');
        }
        
        console.log('⚠️ Falling back to JSON file in development...');
        return readFromFile();
      }
    } else {
      // Use JSON file for local development
      console.log('📄 Reading from JSON file...');
      return readFromFile();
    }
  } catch (error) {
    console.error('Error reading store photos:', error);
    
    if (!isProduction) {
      return readFromFile();
    }
    
    return [];
  }
}

// Helper: Read from JSON file
async function readFromFile(): Promise<StorePhoto[]> {
  try {
    await ensureDirectories();
    const fileContent = await fs.readFile(JSON_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch {
    // If file doesn't exist, return empty array
    return [];
  }
}

// Write store photos to Redis or JSON
export async function writeStorePhotos(photos: StorePhoto[]): Promise<void> {
  try {
    console.log(`💾 Writing ${photos.length} store photos...`);
    
    if (useRedis && redisClient) {
      // Use Redis Cloud
      console.log('📡 Writing to Redis Cloud...');
      await redisClient.set(REDIS_KEY, JSON.stringify(photos));
      console.log('✅ Store photos saved to Redis');
    } else if (useKV) {
      // Use Vercel KV as fallback
      console.log('📡 Writing to Vercel KV...');
      await kv.set(REDIS_KEY, photos);
      console.log('✅ Store photos saved to KV');
    } else {
      // Use JSON file for local development
      console.log('📄 Writing to JSON file...');
      await writeToFile(photos);
      console.log('✅ Store photos saved to file');
    }
  } catch (error) {
    console.error('Error writing store photos:', error);
    throw error;
  }
}

// Helper: Write to JSON file
async function writeToFile(photos: StorePhoto[]): Promise<void> {
  await ensureDirectories();
  await fs.writeFile(JSON_FILE_PATH, JSON.stringify(photos, null, 2));
}

// Get a single store photo by ID
export async function getStorePhoto(id: string): Promise<StorePhoto | null> {
  const photos = await readStorePhotos();
  return photos.find(p => p.id === id) || null;
}

// Create a new store photo
export async function createStorePhoto(photoData: Omit<StorePhoto, 'id' | 'createdAt' | 'updatedAt'>): Promise<StorePhoto> {
  const photos = await readStorePhotos();
  
  const newPhoto: StorePhoto = {
    ...photoData,
    id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  photos.push(newPhoto);
  await writeStorePhotos(photos);
  
  return newPhoto;
}

// Update an existing store photo
export async function updateStorePhoto(id: string, updates: Partial<Omit<StorePhoto, 'id' | 'createdAt'>>): Promise<StorePhoto | null> {
  const photos = await readStorePhotos();
  const index = photos.findIndex(p => p.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedPhoto: StorePhoto = {
    ...photos[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  photos[index] = updatedPhoto;
  await writeStorePhotos(photos);
  
  return updatedPhoto;
}

// Delete a store photo
export async function deleteStorePhoto(id: string): Promise<boolean> {
  const photos = await readStorePhotos();
  const filteredPhotos = photos.filter(p => p.id !== id);
  
  if (filteredPhotos.length === photos.length) {
    return false; // Photo not found
  }
  
  await writeStorePhotos(filteredPhotos);
  return true;
}

// Bulk delete store photos
export async function bulkDeleteStorePhotos(ids: string[]): Promise<{ deleted: number; failed: string[] }> {
  const photos = await readStorePhotos();
  const idsSet = new Set(ids);
  
  const remainingPhotos = photos.filter(p => !idsSet.has(p.id));
  const deletedCount = photos.length - remainingPhotos.length;
  
  await writeStorePhotos(remainingPhotos);
  
  return {
    deleted: deletedCount,
    failed: []
  };
}

// Reorder store photos
export async function reorderStorePhotos(photoIds: string[]): Promise<StorePhoto[]> {
  const photos = await readStorePhotos();
  const photoMap = new Map(photos.map(p => [p.id, p]));
  
  const reorderedPhotos = photoIds
    .map((id, index) => {
      const photo = photoMap.get(id);
      if (photo) {
        return {
          ...photo,
          sortOrder: index,
          updatedAt: new Date().toISOString()
        };
      }
      return null;
    })
    .filter((p): p is StorePhoto => p !== null);
  
  // Add any photos that weren't in the reorder list
  photos.forEach(photo => {
    if (!photoIds.includes(photo.id)) {
      reorderedPhotos.push(photo);
    }
  });
  
  await writeStorePhotos(reorderedPhotos);
  return reorderedPhotos;
}
