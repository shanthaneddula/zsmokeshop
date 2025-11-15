// Admin store photos API route - GET (list) and POST (create)
import { NextRequest, NextResponse } from 'next/server';
import * as StorePhotosStorage from '@/lib/store-photos-storage-service';

// GET /api/admin/store-photos - List all store photos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let photos = await StorePhotosStorage.readStorePhotos();
    
    // Apply status filter
    if (status && (status === 'active' || status === 'inactive')) {
      photos = photos.filter(p => p.status === status);
    }
    
    // Sort by sortOrder
    photos.sort((a, b) => a.sortOrder - b.sortOrder);
    
    return NextResponse.json({
      success: true,
      data: photos,
      total: photos.length
    });
  } catch (error) {
    console.error('Error fetching store photos:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch store photos'
    }, { status: 500 });
  }
}

// POST /api/admin/store-photos - Create a new store photo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.url || typeof body.url !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Photo URL is required'
      }, { status: 400 });
    }
    
    const existingPhotos = await StorePhotosStorage.readStorePhotos();
    
    // Prepare photo data with defaults
    const photoData = {
      url: body.url.trim(),
      title: body.title?.trim() || '',
      description: body.description?.trim() || '',
      status: body.status || 'active' as const,
      sortOrder: body.sortOrder !== undefined ? body.sortOrder : existingPhotos.length
    };
    
    // Create the photo
    const newPhoto = await StorePhotosStorage.createStorePhoto(photoData);
    
    return NextResponse.json({
      success: true,
      data: newPhoto,
      message: 'Store photo added successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating store photo:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create store photo'
    }, { status: 500 });
  }
}

// PUT /api/admin/store-photos - Reorder photos
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.photoIds || !Array.isArray(body.photoIds)) {
      return NextResponse.json({
        success: false,
        error: 'photoIds array is required'
      }, { status: 400 });
    }
    
    const reorderedPhotos = await StorePhotosStorage.reorderStorePhotos(body.photoIds);
    
    return NextResponse.json({
      success: true,
      data: reorderedPhotos,
      message: 'Photos reordered successfully'
    });
    
  } catch (error) {
    console.error('Error reordering photos:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to reorder photos'
    }, { status: 500 });
  }
}

// DELETE /api/admin/store-photos - Bulk delete photos
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Photo IDs array is required'
      }, { status: 400 });
    }
    
    const result = await StorePhotosStorage.bulkDeleteStorePhotos(body.ids);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully deleted ${result.deleted} photo(s)`
    });
    
  } catch (error) {
    console.error('Error deleting photos:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete photos'
    }, { status: 500 });
  }
}
