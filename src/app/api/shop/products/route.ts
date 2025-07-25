// Public API endpoint for shop products
// Serves only active products from admin-managed data
import { NextResponse } from 'next/server';
import { ProductsJsonUtils } from '@/lib/admin/json-utils';
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

export async function GET() {
  try {
    // Read admin-managed products
    const adminProducts = await ProductsJsonUtils.readProducts();
    
    // Filter only active and in-stock products for public shop
    const activeProducts = adminProducts
      .filter(product => product.status === 'active' && product.inStock)
      .map(convertToPublicProduct);

    return NextResponse.json({
      success: true,
      products: activeProducts,
      total: activeProducts.length
    });

  } catch (error) {
    console.error('Error fetching shop products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        products: [],
        total: 0
      },
      { status: 500 }
    );
  }
}
