// Public API endpoint for shop products
// Serves only active products from admin-managed data
import { NextResponse } from 'next/server';
import { AdminProduct } from '@/types/admin';
import { Product } from '@/types';
import * as ProductStorage from '@/lib/product-storage-service';
import { USE_STATIC_CATALOG } from '@/lib/catalog-source';
import { searchCatalog, toShopProduct } from '@/data/catalog';
import { isRestrictedProduct } from '@/lib/restricted-content';

// Convert AdminProduct to public Product format
function convertToPublicProduct(adminProduct: AdminProduct): Product {
  return {
    id: adminProduct.id,
    name: adminProduct.name,
    slug: adminProduct.slug,
    category: adminProduct.category,
    price: adminProduct.price,
    salePrice: adminProduct.salePrice,
    image: adminProduct.image,
    description: adminProduct.description,
    brand: adminProduct.brand,
    inStock: adminProduct.inStock,
    badges: adminProduct.badges,
    rating: 4.5 // Default rating for now
  };
}

// Static display-only catalog response (same shape as the Redis response).
function staticCatalogResponse(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category')?.trim().toLowerCase();
  const brand = searchParams.get('brand')?.trim().toLowerCase();
  const limitNum = parseInt(searchParams.get('limit') || '', 10);
  let items = searchCatalog(searchParams.get('search') || '');
  if (category) items = items.filter((p) => p.categorySlug === category);
  if (brand) items = items.filter((p) => p.brandSlug === brand);
  const products = items.map(toShopProduct);
  const finalProducts = !isNaN(limitNum) && limitNum > 0 ? products.slice(0, limitNum) : products;
  return NextResponse.json({ success: true, data: { products: finalProducts, total: products.length } });
}

export async function GET(request: Request) {
  if (USE_STATIC_CATALOG) {
    return staticCatalogResponse(request);
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    
    // Read admin-managed products from Redis/storage
    const adminProducts = await ProductStorage.readProducts();
    
    // Filter only active and in-stock products for public shop
    let filteredProducts = adminProducts
      .filter((product: AdminProduct) => product.status === 'active' && product.inStock && !isRestrictedProduct(product));
    
    // Apply search filter if provided
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      filteredProducts = filteredProducts.filter((product: AdminProduct) => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply category filter if provided
    if (category && category.trim()) {
      filteredProducts = filteredProducts.filter((product: AdminProduct) => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Convert to public format
    const publicProducts = filteredProducts.map(convertToPublicProduct);
    
    // Apply limit if provided
    let finalProducts = publicProducts;
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        finalProducts = publicProducts.slice(0, limitNum);
      }
    }

    const response = NextResponse.json({
      success: true,
      data: {
        products: finalProducts,
        total: publicProducts.length // Total before limit is applied
      }
    });
    
    // Add cache headers to prevent stale data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error) {
    console.error('Error fetching shop products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        data: {
          products: [],
          total: 0
        }
      },
      { status: 500 }
    );
  }
}
