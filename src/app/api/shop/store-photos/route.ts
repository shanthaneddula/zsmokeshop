// Public API endpoint for fetching active store photos
import { NextResponse } from 'next/server';
import * as StorePhotosStorage from '@/lib/store-photos-storage-service';

export async function GET() {
  try {
    // Read all store photos
    const allPhotos = await StorePhotosStorage.readStorePhotos();
    
    // Filter only active photos
    const activePhotos = allPhotos.filter(photo => photo.status === 'active');
    
    // Sort by sortOrder
    activePhotos.sort((a, b) => a.sortOrder - b.sortOrder);
    
    const response = NextResponse.json({
      success: true,
      data: {
        photos: activePhotos,
        total: activePhotos.length
      }
    });
    
    // Add cache headers to prevent stale data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
    
  } catch (error) {
    console.error('Error fetching store photos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch store photos',
        data: {
          photos: [],
          total: 0
        }
      },
      { status: 500 }
    );
  }
}
