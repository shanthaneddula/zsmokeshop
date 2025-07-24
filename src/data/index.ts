import { Category, PromoItem, Location, Product } from '@/types';

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

export const locations: Location[] = [
  {
    id: '1',
    name: 'Z SMOKE SHOP',
    address: '719 W William Cannon Dr #105, Austin, TX 78745',
    phone: '(661) 371-1413',
    hours: 'Mon-Thu, Sun: 10AM-11PM | Fri-Sat: 10AM-12AM'
  },
  {
    id: '2',
    name: '5 STAR SMOKE SHOP & GIFTS',
    address: '5318 Cameron Rd, Austin, TX 78723',
    phone: '(661) 371-1413',
    hours: 'Mon-Thu, Sun: 10:00 AM - 11:00 PM | Fri-Sat: 10:00 AM - 12:00 AM'
  },
];

// 24 Realistic Mock Products across all categories
export const products: Product[] = [
  // Vapes, Mods & Pods (4 products)
  {
    id: '1',
    name: 'SMOK Nord 4 Pod Kit',
    category: 'vapes-mods-pods',
    price: 34.99,
    salePrice: 29.99,
    image: '/images/products/smok-nord-4.jpg',
    description: 'Compact and powerful pod system with 2000mAh battery and adjustable wattage.',
    brand: 'SMOK',
    inStock: true,
    badges: ['best-seller', 'sale']
  },
  {
    id: '2',
    name: 'Voopoo Drag X Plus',
    category: 'vapes-mods-pods',
    price: 49.99,
    image: '/images/products/voopoo-drag-x-plus.jpg',
    description: 'Advanced mod with GENE.TT chip and 100W max output.',
    brand: 'Voopoo',
    inStock: true,
    badges: ['new']
  },
  {
    id: '3',
    name: 'Uwell Caliburn G2',
    category: 'vapes-mods-pods',
    price: 24.99,
    image: '/images/products/uwell-caliburn-g2.jpg',
    description: 'Sleek pod system perfect for beginners and experienced vapers.',
    brand: 'Uwell',
    inStock: true,
    badges: ['best-seller']
  },
  {
    id: '4',
    name: 'GeekVape Aegis Legend 2',
    category: 'vapes-mods-pods',
    price: 64.99,
    image: '/images/products/geekvape-aegis-legend-2.jpg',
    description: 'Rugged and waterproof dual-battery mod with 200W power.',
    brand: 'GeekVape',
    inStock: false,
    badges: ['out-of-stock']
  },

  // Glass (4 products)
  {
    id: '5',
    name: 'Thick Glass Beaker Bong 12"',
    category: 'glass',
    price: 89.99,
    salePrice: 74.99,
    image: '/images/products/beaker-bong-12.jpg',
    description: 'High-quality borosilicate glass beaker bong with ice catcher.',
    brand: 'Premium Glass',
    inStock: true,
    badges: ['best-seller', 'sale']
  },
  {
    id: '6',
    name: 'Straight Tube Water Pipe 14"',
    category: 'glass',
    price: 69.99,
    image: '/images/products/straight-tube-14.jpg',
    description: 'Classic straight tube design with diffused downstem.',
    brand: 'Clear Choice',
    inStock: true,
    badges: []
  },
  {
    id: '7',
    name: 'Recycler Dab Rig 8"',
    category: 'glass',
    price: 124.99,
    image: '/images/products/recycler-dab-rig.jpg',
    description: 'Advanced recycler design for smooth concentrate hits.',
    brand: 'Heady Glass',
    inStock: true,
    badges: ['new']
  },
  {
    id: '8',
    name: 'Mini Bubbler 6"',
    category: 'glass',
    price: 39.99,
    salePrice: 34.99,
    image: '/images/products/mini-bubbler.jpg',
    description: 'Compact bubbler perfect for on-the-go sessions.',
    brand: 'Pocket Glass',
    inStock: true,
    badges: ['sale']
  },

  // Shisha & Hookah (3 products)
  {
    id: '9',
    name: 'Khalil Mamoon Hookah 32"',
    category: 'shisha-hookah',
    price: 149.99,
    image: '/images/products/khalil-mamoon-hookah.jpg',
    description: 'Authentic Egyptian hookah with traditional brass stem.',
    brand: 'Khalil Mamoon',
    inStock: true,
    badges: ['best-seller']
  },
  {
    id: '10',
    name: 'Al Fakher Shisha 250g - Double Apple',
    category: 'shisha-hookah',
    price: 12.99,
    image: '/images/products/al-fakher-double-apple.jpg',
    description: 'Premium shisha tobacco with classic double apple flavor.',
    brand: 'Al Fakher',
    inStock: true,
    badges: []
  },
  {
    id: '11',
    name: 'Starbuzz Shisha 250g - Blue Mist',
    category: 'shisha-hookah',
    price: 15.99,
    salePrice: 13.99,
    image: '/images/products/starbuzz-blue-mist.jpg',
    description: 'High-quality American shisha with refreshing blue mist flavor.',
    brand: 'Starbuzz',
    inStock: true,
    badges: ['sale']
  },

  // E-Liquids (3 products)
  {
    id: '12',
    name: 'Naked 100 - Lava Flow 60ml',
    category: 'e-liquids',
    price: 19.99,
    image: '/images/products/naked-lava-flow.jpg',
    description: 'Tropical blend of strawberry, coconut, and pineapple.',
    brand: 'Naked 100',
    inStock: true,
    badges: ['best-seller']
  },
  {
    id: '13',
    name: 'Juice Head - Peach Pear 100ml',
    category: 'e-liquids',
    price: 24.99,
    salePrice: 19.99,
    image: '/images/products/juice-head-peach-pear.jpg',
    description: 'Sweet and juicy peach pear blend in large 100ml bottle.',
    brand: 'Juice Head',
    inStock: true,
    badges: ['sale', 'new']
  },
  {
    id: '14',
    name: 'Coastal Clouds - Vanilla Custard 60ml',
    category: 'e-liquids',
    price: 17.99,
    image: '/images/products/coastal-clouds-vanilla.jpg',
    description: 'Rich and creamy vanilla custard dessert flavor.',
    brand: 'Coastal Clouds',
    inStock: true,
    badges: []
  },

  // Smoke Accessories (3 products)
  {
    id: '15',
    name: 'RAW Classic Rolling Papers King Size',
    category: 'smoke-accessories',
    price: 2.99,
    image: '/images/products/raw-papers-king.jpg',
    description: 'Natural unrefined rolling papers, king size.',
    brand: 'RAW',
    inStock: true,
    badges: ['best-seller']
  },
  {
    id: '16',
    name: 'Element Rolling Tray Large',
    category: 'smoke-accessories',
    price: 14.99,
    salePrice: 12.99,
    image: '/images/products/element-rolling-tray.jpg',
    description: 'Large metal rolling tray with curved edges.',
    brand: 'Element',
    inStock: true,
    badges: ['sale']
  },
  {
    id: '17',
    name: 'Clipper Lighter 4-Pack',
    category: 'smoke-accessories',
    price: 8.99,
    image: '/images/products/clipper-lighter-4pack.jpg',
    description: 'Refillable butane lighters in assorted colors.',
    brand: 'Clipper',
    inStock: true,
    badges: []
  },

  // Grinders, Scales & Trays (2 products)
  {
    id: '18',
    name: 'Santa Cruz Shredder 4-Piece Large',
    category: 'grinders-scales-trays',
    price: 64.99,
    image: '/images/products/santa-cruz-shredder.jpg',
    description: 'Premium aluminum grinder with unique tooth design.',
    brand: 'Santa Cruz Shredder',
    inStock: true,
    badges: ['best-seller']
  },
  {
    id: '19',
    name: 'Digital Pocket Scale 0.1g',
    category: 'grinders-scales-trays',
    price: 19.99,
    salePrice: 16.99,
    image: '/images/products/digital-pocket-scale.jpg',
    description: 'Precision digital scale with 0.1g accuracy.',
    brand: 'WeighMax',
    inStock: true,
    badges: ['sale']
  },

  // Lighters & Torches (2 products)
  {
    id: '20',
    name: 'Blazer Big Shot Torch',
    category: 'lighters-torches',
    price: 49.99,
    image: '/images/products/blazer-big-shot.jpg',
    description: 'Professional butane torch with adjustable flame.',
    brand: 'Blazer',
    inStock: true,
    badges: ['best-seller']
  },
  {
    id: '21',
    name: 'Zippo Classic Lighter',
    category: 'lighters-torches',
    price: 24.99,
    image: '/images/products/zippo-classic.jpg',
    description: 'Iconic windproof lighter with lifetime warranty.',
    brand: 'Zippo',
    inStock: true,
    badges: []
  },

  // Detox (1 product)
  {
    id: '22',
    name: 'Mega Clean Detox Drink 32oz',
    category: 'detox',
    price: 39.99,
    salePrice: 34.99,
    image: '/images/products/mega-clean-detox.jpg',
    description: 'Fast-acting detox drink for cleansing support.',
    brand: 'Detoxify',
    inStock: true,
    badges: ['sale']
  },

  // Kratoms (1 product)
  {
    id: '23',
    name: 'Red Bali Kratom Powder 1oz',
    category: 'kratoms',
    price: 12.99,
    image: '/images/products/red-bali-kratom.jpg',
    description: 'Premium red vein Bali kratom powder.',
    brand: 'Botanical Wellness',
    inStock: true,
    badges: ['new']
  },

  // Batteries (1 product)
  {
    id: '24',
    name: 'Samsung 18650 Battery 2-Pack',
    category: 'batteries',
    price: 16.99,
    image: '/images/products/samsung-18650-battery.jpg',
    description: 'High-drain 18650 batteries for vape mods.',
    brand: 'Samsung',
    inStock: true,
    badges: ['best-seller']
  }
];
