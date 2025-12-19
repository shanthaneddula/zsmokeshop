// Barcode lookup API - Search product by barcode
import { NextRequest, NextResponse } from 'next/server';
import { readProducts } from '@/lib/product-storage-service';
import { verifyAdminAuth } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAdminAuth(request);
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get barcode from query string
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get('barcode');

    if (!barcode) {
      return NextResponse.json(
        { success: false, error: 'Barcode parameter is required' },
        { status: 400 }
      );
    }

    // Clean the barcode (remove any non-digit characters)
    const cleanBarcode = barcode.replace(/\D/g, '');

    if (cleanBarcode.length < 8 || cleanBarcode.length > 14) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid barcode format. Expected 8-14 digits (UPC/EAN format)' 
        },
        { status: 400 }
      );
    }

    // Read all products
    const products = await readProducts();

    // Search for product with matching barcode
    // Using type assertion since we know barcode field exists in our data
    const product = products.find(p => {
      const productBarcode = (p as { barcode?: string }).barcode;
      if (!productBarcode) return false;
      return productBarcode.replace(/\D/g, '') === cleanBarcode;
    });

    if (product) {
      return NextResponse.json({
        success: true,
        found: true,
        data: {
          product
        }
      });
    }

    // Product not found
    return NextResponse.json({
      success: true,
      found: false,
      data: {
        barcode: cleanBarcode,
        message: 'No product found with this barcode'
      }
    });

  } catch (error) {
    console.error('Error searching by barcode:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search by barcode'
      },
      { status: 500 }
    );
  }
}
