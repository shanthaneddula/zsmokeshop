import { Metadata } from 'next';
import { Suspense } from 'react';
import ShopPageClient from './shop-client';
import StaticShopClient from './static-shop-client';
import { USE_STATIC_CATALOG } from '@/lib/catalog-source';
import { getHiddenCatalogSlugs } from '@/lib/catalog-visibility';

// Visibility (hidden products) can change from /admin, so render per request.
export const dynamic = 'force-dynamic';

// SEO metadata for the shop page
export const metadata: Metadata = {
  title: 'Shop | Z Smoke Shop - Premium Smoke Products in Austin, TX',
  description: 'Browse our complete collection of premium smoke shop products including vapes, glass, accessories, and more. Two convenient Austin locations.',
  keywords: 'smoke shop Austin, vapes Austin, glass pipes Austin, smoke accessories, hookah Austin, CBD Austin',
  openGraph: {
    title: 'Shop All Products | Z Smoke Shop Austin',
    description: 'Discover our complete collection of premium smoke shop products and accessories in Austin, Texas.',
    type: 'website',
  },
};

export default async function ShopPage() {
  const hiddenSlugs = USE_STATIC_CATALOG ? Array.from(await getHiddenCatalogSlugs()) : [];
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {USE_STATIC_CATALOG ? <StaticShopClient hiddenSlugs={hiddenSlugs} /> : <ShopPageClient />}
    </Suspense>
  );
}
