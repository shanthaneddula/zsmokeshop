import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductBySlug, getAllProducts } from '@/lib/product-utils-server';
import { generateProductMetadata } from '@/lib/seo-utils';
import ProductPageTemplate from '@/components/product/ProductPageTemplate';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return {
      title: 'Product Not Found | Z Smoke Shop - Austin, TX',
      description: 'The requested product could not be found at Z Smoke Shop in Austin, Texas.'
    };
  }

  return generateProductMetadata(product);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }

  return <ProductPageTemplate product={product} />;
}

// Generate static params for existing products (improves performance)
export async function generateStaticParams() {
  const products = await getAllProducts();
  
  return products
    .filter((product) => product.slug && product.status === 'active')
    .map((product) => ({
      slug: product.slug,
    }));
}
