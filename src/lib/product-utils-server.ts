import { AdminProduct } from '@/types';
import * as ProductStorage from '@/lib/product-storage-service';

export async function getAllProducts(): Promise<AdminProduct[]> {
  try {
    return await ProductStorage.readProducts();
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<AdminProduct | null> {
  const products = await getAllProducts();
  return products.find(product => 
    product.slug === slug && 
    product.status === 'active'
  ) || null;
}

export async function getRelatedProducts(
  currentProduct: AdminProduct, 
  limit: number = 4
): Promise<AdminProduct[]> {
  const products = await getAllProducts();
  
  return products
    .filter(product => 
      product.id !== currentProduct.id && 
      product.category === currentProduct.category &&
      product.status === 'active' &&
      product.inStock
    )
    .slice(0, limit);
}

export async function getProductsByCategory(
  categorySlug: string, 
  limit?: number
): Promise<AdminProduct[]> {
  const products = await getAllProducts();
  
  const filtered = products.filter(product => 
    product.category === categorySlug &&
    product.status === 'active' &&
    product.inStock
  );
  
  return limit ? filtered.slice(0, limit) : filtered;
}

export async function searchProducts(query: string): Promise<AdminProduct[]> {
  const products = await getAllProducts();
  const searchTerm = query.toLowerCase();
  
  return products.filter(product => 
    product.status === 'active' &&
    (
      product.name.toLowerCase().includes(searchTerm) ||
      product.shortDescription?.toLowerCase().includes(searchTerm) ||
      product.detailedDescription?.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    )
  );
}
