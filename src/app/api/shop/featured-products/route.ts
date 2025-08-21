// API endpoint for dynamic featured products based on admin settings
import { NextResponse } from 'next/server';
import { AdminProduct } from '@/types/admin';
import { Product } from '@/types';

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
    description: adminProduct.description || '',
    brand: adminProduct.brand,
    inStock: adminProduct.inStock,
    badges: adminProduct.badges,
    rating: 4.5 // Default rating for now
  };
}

// Serverless-compatible function to read products
async function readProductsServerless(): Promise<AdminProduct[]> {
  try {
    const productsData = await import('@/data/products.json');
    return (productsData.default || []) as AdminProduct[];
  } catch (error) {
    console.error('Error reading products.json:', error);
    return [];
  }
}

// Read featured products settings (for now using defaults, later from settings file)
function getFeaturedProductsSettings() {
  return {
    enabled: true,
    selectedBadges: ['featured', 'best-seller', 'new'],
    maxProducts: 12,
    sortOrder: 'newest' as const,
    showOnlyInStock: true
  };
}

// Sort products based on sort order
function sortProducts(products: AdminProduct[], sortOrder: string): AdminProduct[] {
  switch (sortOrder) {
    case 'newest':
      return products.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
    case 'name':
      return products.sort((a, b) => a.name.localeCompare(b.name));
    case 'price-low':
      return products.sort((a, b) => a.price - b.price);
    case 'price-high':
      return products.sort((a, b) => b.price - a.price);
    default:
      return products;
  }
}

export async function GET() {
  try {
    // Get featured products settings
    const settings = getFeaturedProductsSettings();
    
    // If featured products are disabled, return empty array
    if (!settings.enabled) {
      return NextResponse.json({
        success: true,
        data: {
          products: [],
          settings: settings
        }
      });
    }

    // Read all products
    const allProducts = await readProductsServerless();
    
    // Filter products based on settings
    let filteredProducts = allProducts.filter((product: AdminProduct) => {
      // Must be active
      if (product.status !== 'active') return false;
      
      // Check stock filter
      if (settings.showOnlyInStock && !product.inStock) return false;
      
      // Check if product has any of the selected badges
      if (!product.badges || product.badges.length === 0) return false;
      
      return product.badges.some(badge => settings.selectedBadges.includes(badge));
    });

    // Sort products
    filteredProducts = sortProducts(filteredProducts, settings.sortOrder);
    
    // Apply limit
    if (settings.maxProducts > 0) {
      filteredProducts = filteredProducts.slice(0, settings.maxProducts);
    }
    
    // Convert to public format
    const publicProducts = filteredProducts.map(convertToPublicProduct);

    const response = NextResponse.json({
      success: true,
      data: {
        products: publicProducts,
        settings: settings,
        total: publicProducts.length
      }
    });
    
    // Add cache headers to prevent stale data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch featured products',
        data: {
          products: [],
          settings: null,
          total: 0
        }
      },
      { status: 500 }
    );
  }
}
