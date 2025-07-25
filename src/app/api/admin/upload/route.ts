// Image upload API for admin system (Phase 3 - Simplified for testing)
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
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

const UPLOAD_DIR = path.join(process.cwd(), 'public/images/admin');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
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

// Convert File to Buffer
async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // Ensure upload directory exists
    await ensureUploadDir();
    
    // Generate unique filename
    const fileName = generateFileName(file.name);
    const categoryDir = path.join(UPLOAD_DIR, category);
    await fs.mkdir(categoryDir, { recursive: true });
    
    const filePath = path.join(categoryDir, fileName);
    
    // Convert file to buffer and save
    const buffer = await fileToBuffer(file);
    await fs.writeFile(filePath, buffer);
    
    // Generate public URL
    const publicUrl = `/images/admin/${category}/${fileName}`;
    
    return NextResponse.json({
      success: true,
      data: {
        fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        category,
        url: publicUrl,
        path: filePath
      },
      message: 'File uploaded successfully'
    });
    
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}

// Delete uploaded image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'File path required' },
        { status: 400 }
      );
    }
    
    // Security check - ensure path is within upload directory
    const fullPath = path.resolve(filePath);
    const uploadPath = path.resolve(UPLOAD_DIR);
    
    if (!fullPath.startsWith(uploadPath)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file path' },
        { status: 403 }
      );
    }
    
    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Delete file
    await fs.unlink(fullPath);
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Delete failed' },
      { status: 500 }
    );
  }
}

// List uploaded images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'general';
    
    await ensureUploadDir();
    const categoryDir = path.join(UPLOAD_DIR, category);
    
    await fs.mkdir(categoryDir, { recursive: true });
      const files = await fs.readdir(categoryDir);
      
      const imageFiles = await Promise.all(
        files
          .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
          })
          .map(async (file) => {
            const filePath = path.join(categoryDir, file);
            const stats = await fs.stat(filePath);
            
            return {
              fileName: file,
              size: stats.size,
              created: stats.birthtime,
              modified: stats.mtime,
              url: `/images/admin/${category}/${file}`,
              path: filePath
            };
          })
      );
      
      // Sort by creation date (newest first)
      imageFiles.sort((a, b) => b.created.getTime() - a.created.getTime());
      
      return NextResponse.json({
        success: true,
        data: {
          category,
          images: imageFiles,
          total: imageFiles.length
        }
      });
    
  } catch (error: any) {
    console.error('List images error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list images' },
      { status: 500 }
    );
  }
}
