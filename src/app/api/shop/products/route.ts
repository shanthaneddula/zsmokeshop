// Public API endpoint for shop products
// Serves only active products from admin-managed data
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
    description: adminProduct.description,
    brand: adminProduct.brand,
    inStock: adminProduct.inStock,
    badges: adminProduct.badges,
    rating: 4.5 // Default rating for now
  };
}

// Serverless-compatible function to read products
async function readProductsServerless(): Promise<AdminProduct[]> {
  try {
    // Try to import the JSON file directly (works in serverless)
    const productsData = await import('@/data/products.json');
    return (productsData.default || []) as AdminProduct[];
  } catch (error) {
    console.error('Error reading products.json:', error);
    // Fallback to empty array if file doesn't exist
    return [];
  }
}

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    
    // Read admin-managed products using serverless-compatible method
    const adminProducts = await readProductsServerless();
    
    // Filter only active and in-stock products for public shop
    let filteredProducts = adminProducts
      .filter((product: AdminProduct) => product.status === 'active' && product.inStock);
    
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

    return NextResponse.json({
      success: true,
      data: {
        products: finalProducts,
        total: publicProducts.length // Total before limit is applied
      }
    });

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
