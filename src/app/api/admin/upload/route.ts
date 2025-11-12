// Image upload API for admin system - Uses Vercel Blob Storage for production compatibility
import { NextRequest, NextResponse } from 'next/server';
import { put, del, list } from '@vercel/blob';
import path from 'path';

// Use Node.js runtime for file operations
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Generate unique filename
function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, extension)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .substring(0, 20);
  
  return `${baseName}-${timestamp}-${random}${extension}`;
}

// Validate file type and size
function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }
  
  return { valid: true };
}

// Upload image to Vercel Blob storage
export async function POST(request: NextRequest) {
  try {
    console.log('��️ Starting file upload process...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      category
    });
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      console.log('❌ File validation failed:', validation.error);
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // Generate unique filename with category prefix
    const fileName = generateFileName(file.name);
    const blobPath = `admin/${category}/${fileName}`;
    
    console.log('📤 Uploading to Vercel Blob:', blobPath);
    
    // Upload to Vercel Blob storage
    const blob = await put(blobPath, file, {
      access: 'public',
      contentType: file.type,
    });
    
    console.log('✅ Upload successful:', blob.url);
    
    return NextResponse.json({
      success: true,
      data: {
        fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        category,
        url: blob.url,
        path: blobPath,
        downloadUrl: blob.downloadUrl
      },
      message: 'File uploaded successfully'
    });
    
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

// Delete uploaded image from Vercel Blob storage
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const path = searchParams.get('path');
    
    if (!url && !path) {
      return NextResponse.json(
        { success: false, error: 'File URL or path required' },
        { status: 400 }
      );
    }
    
    console.log('🗑️ Deleting file:', url || path);
    
    // Delete from Vercel Blob storage
    if (url) {
      await del(url);
    } else if (path) {
      // If only path is provided, we need to construct the blob URL
      const blobs = await list({ prefix: path });
      if (blobs.blobs.length > 0) {
        await del(blobs.blobs[0].url);
      }
    }
    
    console.log('✅ Delete successful');
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
    
  } catch (error: any) {
    console.error('❌ Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Delete failed: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

// List uploaded images from Vercel Blob storage
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'general';
    
    console.log('📂 Listing images for category:', category);
    
    // List blobs with the admin/{category}/ prefix
    const prefix = `admin/${category}/`;
    const { blobs } = await list({ prefix });
    
    // Filter for image files and format response
    const imageFiles = blobs
      .filter(blob => {
        const ext = path.extname(blob.pathname).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      })
      .map(blob => ({
        fileName: path.basename(blob.pathname),
        size: blob.size,
        created: new Date(blob.uploadedAt),
        modified: new Date(blob.uploadedAt),
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        path: blob.pathname
      }))
      // Sort by creation date (newest first)
      .sort((a, b) => b.created.getTime() - a.created.getTime());
    
    console.log(`📊 Found ${imageFiles.length} images in category ${category}`);
    
    return NextResponse.json({
      success: true,
      data: {
        category,
        images: imageFiles,
        total: imageFiles.length
      }
    });
    
  } catch (error: any) {
    console.error('❌ List images error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list images: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
