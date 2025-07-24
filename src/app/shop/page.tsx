import { Metadata } from 'next';
import ShopPageClient from './shop-client';

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

export default function ShopPage() {
  return <ShopPageClient />;
}
