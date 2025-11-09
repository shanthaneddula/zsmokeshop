import { Category, PromoItem, Product } from '@/types';

export const categories: Category[] = [
  { id: '1', name: 'Batteries', slug: 'batteries', image: '/images/categories/batteries.svg' },
  { id: '2', name: 'Candles & Incense', slug: 'candles-incense', image: '/images/categories/candles.svg' },
  { id: '3', name: 'Cigarillos', slug: 'cigarillos', image: '/images/categories/cigarillos.svg' },
  { id: '4', name: 'Detox', slug: 'detox', image: '/images/categories/detox.svg' },
  { id: '5', name: 'E-Liquids', slug: 'e-liquids', image: '/images/categories/e-liquids.svg' },
  { id: '6', name: 'Energy Drinks', slug: 'energy-drinks', image: '/images/categories/e-liquids.svg' },
  { id: '7', name: 'Exotic', slug: 'exotic', image: '/images/categories/vapes.svg' },
  { id: '8', name: 'Glass', slug: 'glass', image: '/images/categories/glass.svg' },
  { id: '9', name: 'Grinders, Scales & Trays', slug: 'grinders-scales-trays', image: '/images/categories/accessories.svg' },
  { id: '10', name: 'High-End Vaporizers', slug: 'high-end-vaporizers', image: '/images/categories/vapes.svg' },
  { id: '11', name: 'Kratoms', slug: 'kratoms', image: '/images/categories/detox.svg' },
  { id: '12', name: 'Lighters & Torches', slug: 'lighters-torches', image: '/images/categories/accessories.svg' },
  { id: '13', name: 'Shisha & Hookah', slug: 'shisha-hookah', image: '/images/categories/hookah.svg' },
  { id: '14', name: 'Smoke Accessories', slug: 'smoke-accessories', image: '/images/categories/accessories.svg' },
  { id: '15', name: 'THC-A', slug: 'thc-a', image: '/images/categories/vapes.svg' },
  { id: '16', name: 'Vapes, Mods & Pods', slug: 'vapes-mods-pods', image: '/images/categories/vapes.svg' },
];

export const promoItems: PromoItem[] = [
  {
    id: '1',
    title: 'New Arrivals',
    description: 'Check out our latest products and accessories',
    image: '/images/hero/new-arrivals.svg',
    cta: 'Shop Now'
  },
  {
    id: '2',
    title: 'Buy any 2 Disposable Vapes',
    description: 'Get $2 off your purchase',
    image: '/images/hero/vape-discount.svg',
    discount: '$2 OFF',
    cta: 'Get Deal'
  },
  {
    id: '3',
    title: 'Special Deals on Hookah and Bong',
    description: 'Premium glass pieces at unbeatable prices',
    image: '/images/hero/glass-hookah-deals.svg',
    cta: 'View Deals'
  },
  {
    id: '4',
    title: 'Buy $50+ get 4% off',
    description: 'Save more when you spend more',
    image: '/images/hero/spend-save-50.svg',
    discount: '4% OFF',
    cta: 'Shop $50+'
  },
  {
    id: '5',
    title: 'Deal $100+ get 8% off',
    description: 'Maximum savings on large orders',
    image: '/images/hero/spend-save-100.svg',
    discount: '8% OFF',
    cta: 'Shop $100+'
  },
];

// Locations are now managed dynamically through the admin system via useBusinessSettings hook
// Static locations export removed to prevent conflicts with admin-managed data

// Products are now managed dynamically through the admin system
// Static products removed to prevent build conflicts with admin-managed data
export const products: Product[] = [];
