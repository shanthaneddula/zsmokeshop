// Admin store photos API route - Individual photo operations
import { NextRequest, NextResponse } from 'next/server';
import * as StorePhotosStorage from '@/lib/store-photos-storage-service';

// GET /api/admin/store-photos/[id] - Get a single store photo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Photo ID is required'
      }, { status: 400 });
    }
    
    const photo = await StorePhotosStorage.getStorePhoto(id);
    
    if (!photo) {
      return NextResponse.json({
        success: false,
        error: 'Photo not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: photo
    });
    
  } catch (error) {
    console.error('Error fetching store photo:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch store photo'
    }, { status: 500 });
  }
}

// PUT /api/admin/store-photos/[id] - Update a store photo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Photo ID is required'
      }, { status: 400 });
    }
    
    // Check if photo exists
    const existingPhoto = await StorePhotosStorage.getStorePhoto(id);
    if (!existingPhoto) {
      return NextResponse.json({
        success: false,
        error: 'Photo not found'
      }, { status: 404 });
    }
    
    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    
    if (body.url !== undefined) updateData.url = body.url.trim();
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.status !== undefined) updateData.status = body.status;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    
    // Update the photo
    const updatedPhoto = await StorePhotosStorage.updateStorePhoto(id, updateData);
    
    return NextResponse.json({
      success: true,
      data: updatedPhoto,
      message: 'Store photo updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating store photo:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update store photo'
    }, { status: 500 });
  }
}

// DELETE /api/admin/store-photos/[id] - Delete a store photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Photo ID is required'
      }, { status: 400 });
    }
    
    // Check if photo exists
    const existingPhoto = await StorePhotosStorage.getStorePhoto(id);
    if (!existingPhoto) {
      return NextResponse.json({
        success: false,
        error: 'Photo not found'
      }, { status: 404 });
    }
    
    // Delete the photo
    const deleted = await StorePhotosStorage.deleteStorePhoto(id);
    
    if (deleted) {
      return NextResponse.json({
        success: true,
        message: 'Store photo deleted successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete store photo'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error deleting store photo:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete store photo'
    }, { status: 500 });
  }
}
