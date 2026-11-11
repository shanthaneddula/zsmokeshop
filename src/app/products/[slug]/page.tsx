import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductBySlug, getAllProducts } from '@/lib/product-utils-server';
import { generateProductMetadata } from '@/lib/seo-utils';
import ProductPageTemplate from '@/components/product/ProductPageTemplate';
import CatalogProductTemplate from '@/components/catalog/CatalogProductTemplate';
import { USE_STATIC_CATALOG } from '@/lib/catalog-source';
import { getCatalogProduct, getRelatedCatalogProducts, toShopProduct } from '@/data/catalog';
import { getHiddenCatalogSlugs } from '@/lib/catalog-visibility';
import { isRestrictedProduct } from '@/lib/restricted-content';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const catalogProduct = USE_STATIC_CATALOG ? getCatalogProduct(slug) : undefined;
  if (catalogProduct && (await getHiddenCatalogSlugs()).has(slug)) {
    return { title: 'Product Not Found | Z Smoke Shop - Austin, TX', robots: { index: false } };
  }
  if (catalogProduct) {
    const title = `${catalogProduct.name} | ${catalogProduct.category} | Z Smoke Shop - Austin, TX`;
    return {
      title,
      description: catalogProduct.description,
      openGraph: { title, description: catalogProduct.description, images: [catalogProduct.image] },
    };
  }

  const product = await getProductBySlug(slug);
  
  if (!product || isRestrictedProduct(product)) {
    return {
      title: 'Product Not Found | Z Smoke Shop - Austin, TX',
      description: 'The requested product could not be found at Z Smoke Shop in Austin, Texas.'
    };
  }

  return generateProductMetadata(product);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Static display-only catalog first; falls through to the Redis product below.
  const catalogProduct = USE_STATIC_CATALOG ? getCatalogProduct(slug) : undefined;
  if (catalogProduct) {
    // Hidden catalog products 404 (and never fall through to the Redis lookup).
    const hidden = await getHiddenCatalogSlugs();
    if (hidden.has(slug)) notFound();
    const related = getRelatedCatalogProducts(catalogProduct, 8, hidden).map(toShopProduct);
    return <CatalogProductTemplate product={catalogProduct} related={related} />;
  }

  const product = await getProductBySlug(slug);
  
  if (!product || isRestrictedProduct(product)) {
    notFound();
  }

  return <ProductPageTemplate product={product} />;
}

// Generate static params for existing products (improves performance)
export async function generateStaticParams() {
  const products = await getAllProducts();
  
  return products
    .filter((product) => product.slug && product.status === 'active' && !isRestrictedProduct(product))
    .map((product) => ({
      slug: product.slug,
    }));
}
