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

export const products: Product[] = [
  // Vapes, Mods & Pods
  {
    id: '1',
    name: 'SMOK Nord 4 Pod Kit',
    category: 'vapes-mods-pods',
    price: 34.99,
    originalPrice: 39.99,
    image: '/images/products/smok-nord-4.jpg',
    description: 'Advanced pod system with RPM and RPM 2 coil compatibility',
    inStock: true,
    badges: ['best-seller', 'sale'],
    brand: 'SMOK',
    sku: 'SMK-N4-001'
  },
  {
    id: '2',
    name: 'Vaporesso XROS 3 Pod System',
    category: 'vapes-mods-pods',
    price: 29.99,
    image: '/images/products/vaporesso-xros-3.jpg',
    description: 'Sleek pod system with adjustable airflow and long-lasting battery',
    inStock: true,
    badges: ['new'],
    brand: 'Vaporesso',
    sku: 'VAP-XR3-001'
  },
  {
    id: '3',
    name: 'GeekVape Aegis Legend 2 Kit',
    category: 'vapes-mods-pods',
    price: 79.99,
    image: '/images/products/geekvape-aegis-legend-2.jpg',
    description: 'Rugged dual-battery mod with waterproof and shockproof design',
    inStock: true,
    brand: 'GeekVape',
    sku: 'GV-AL2-001'
  },
  {
    id: '4',
    name: 'Lost Vape Orion Bar 7500',
    category: 'vapes-mods-pods',
    price: 19.99,
    image: '/images/products/lost-vape-orion-bar.jpg',
    description: 'Disposable vape with 7500 puffs and premium flavors',
    inStock: true,
    badges: ['new'],
    brand: 'Lost Vape',
    sku: 'LV-OB75-001'
  },
  {
    id: '5',
    name: 'Voopoo Drag X Plus Kit',
    category: 'vapes-mods-pods',
    price: 59.99,
    originalPrice: 69.99,
    image: '/images/products/voopoo-drag-x-plus.jpg',
    description: 'High-performance pod mod with adjustable wattage',
    inStock: false,
    badges: ['sale', 'out-of-stock'],
    brand: 'Voopoo',
    sku: 'VP-DXP-001'
  },

  // High-End Vaporizers
  {
    id: '6',
    name: 'Storz & Bickel Mighty+ Vaporizer',
    category: 'high-end-vaporizers',
    price: 399.99,
    image: '/images/products/storz-bickel-mighty-plus.jpg',
    description: 'Premium portable vaporizer with precise temperature control',
    inStock: true,
    badges: ['best-seller'],
    brand: 'Storz & Bickel',
    sku: 'SB-MP-001'
  },
  {
    id: '7',
    name: 'Pax 3 Complete Kit',
    category: 'high-end-vaporizers',
    price: 249.99,
    originalPrice: 279.99,
    image: '/images/products/pax-3-complete.jpg',
    description: 'Dual-use vaporizer for dry herb and concentrates',
    inStock: true,
    badges: ['sale'],
    brand: 'Pax',
    sku: 'PAX-3C-001'
  },
  {
    id: '8',
    name: 'DaVinci IQC Vaporizer',
    category: 'high-end-vaporizers',
    price: 199.99,
    image: '/images/products/davinci-iqc.jpg',
    description: 'Conduction vaporizer with precision temperature control',
    inStock: true,
    brand: 'DaVinci',
    sku: 'DV-IQC-001'
  },

  // Glass
  {
    id: '9',
    name: 'Thick Glass Beaker Bong 14"',
    category: 'glass',
    price: 89.99,
    image: '/images/products/thick-glass-beaker-bong.jpg',
    description: 'Heavy-duty borosilicate glass bong with ice catcher',
    inStock: true,
    badges: ['best-seller'],
    brand: 'Thick Glass',
    sku: 'TG-BB14-001'
  },
  {
    id: '10',
    name: 'Empire Glassworks Pineapple Pipe',
    category: 'glass',
    price: 45.99,
    image: '/images/products/empire-pineapple-pipe.jpg',
    description: 'Artistic hand pipe with intricate pineapple design',
    inStock: true,
    badges: ['new'],
    brand: 'Empire Glassworks',
    sku: 'EG-PP-001'
  },
  {
    id: '11',
    name: 'Hemper Pineapple Bong',
    category: 'glass',
    price: 79.99,
    image: '/images/products/hemper-pineapple-bong.jpg',
    description: 'Unique pineapple-shaped water pipe with percolator',
    inStock: true,
    badges: ['new'],
    brand: 'Hemper',
    sku: 'HMP-PB-001'
  },
  {
    id: '12',
    name: 'Diamond Glass Straight Tube',
    category: 'glass',
    price: 129.99,
    originalPrice: 149.99,
    image: '/images/products/diamond-glass-straight-tube.jpg',
    description: 'Premium straight tube bong with diffused downstem',
    inStock: true,
    badges: ['sale'],
    brand: 'Diamond Glass',
    sku: 'DG-ST-001'
  },

  // E-Liquids
  {
    id: '13',
    name: 'Naked 100 Brain Freeze 60ml',
    category: 'e-liquids',
    price: 24.99,
    image: '/images/products/naked-100-brain-freeze.jpg',
    description: 'Premium menthol strawberry kiwi e-liquid',
    inStock: true,
    badges: ['best-seller'],
    brand: 'Naked 100',
    sku: 'N100-BF60-001'
  },
  {
    id: '14',
    name: 'Juice Head Peach Pear 100ml',
    category: 'e-liquids',
    price: 19.99,
    originalPrice: 24.99,
    image: '/images/products/juice-head-peach-pear.jpg',
    description: 'Sweet peach and pear blend in large bottle',
    inStock: true,
    badges: ['sale'],
    brand: 'Juice Head',
    sku: 'JH-PP100-001'
  },
  {
    id: '15',
    name: 'Coastal Clouds Maple Butter 60ml',
    category: 'e-liquids',
    price: 22.99,
    image: '/images/products/coastal-clouds-maple-butter.jpg',
    description: 'Rich maple butter breakfast flavor',
    inStock: true,
    brand: 'Coastal Clouds',
    sku: 'CC-MB60-001'
  },

  // Shisha & Hookah
  {
    id: '16',
    name: 'Al Fakher Double Apple 250g',
    category: 'shisha-hookah',
    price: 12.99,
    image: '/images/products/al-fakher-double-apple.jpg',
    description: 'Classic double apple flavored hookah tobacco',
    inStock: true,
    badges: ['best-seller'],
    brand: 'Al Fakher',
    sku: 'AF-DA250-001'
  },
  {
    id: '17',
    name: 'Khalil Mamoon Hookah 32"',
    category: 'shisha-hookah',
    price: 189.99,
    originalPrice: 219.99,
    image: '/images/products/khalil-mamoon-hookah.jpg',
    description: 'Traditional Egyptian hookah with brass stem',
    inStock: true,
    badges: ['sale'],
    brand: 'Khalil Mamoon',
    sku: 'KM-H32-001'
  },
  {
    id: '18',
    name: 'Starbuzz Blue Mist 250g',
    category: 'shisha-hookah',
    price: 18.99,
    image: '/images/products/starbuzz-blue-mist.jpg',
    description: 'Premium blueberry mint hookah tobacco',
    inStock: true,
    badges: ['new'],
    brand: 'Starbuzz',
    sku: 'SB-BM250-001'
  },

  // Grinders, Scales & Trays
  {
    id: '19',
    name: 'Santa Cruz Shredder 4-Piece Large',
    category: 'grinders-scales-trays',
    price: 89.99,
    image: '/images/products/santa-cruz-shredder-large.jpg',
    description: 'Premium aluminum grinder with unique tooth design',
    inStock: true,
    badges: ['best-seller'],
    brand: 'Santa Cruz Shredder',
    sku: 'SCS-4PL-001'
  },
  {
    id: '20',
    name: 'AWS Digital Scale 100g x 0.01g',
    category: 'grinders-scales-trays',
    price: 24.99,
    image: '/images/products/aws-digital-scale.jpg',
    description: 'Precision digital scale with 0.01g accuracy',
    inStock: true,
    brand: 'AWS',
    sku: 'AWS-DS100-001'
  },
  {
    id: '21',
    name: 'RAW Rolling Tray Large',
    category: 'grinders-scales-trays',
    price: 14.99,
    image: '/images/products/raw-rolling-tray-large.jpg',
    description: 'Large metal rolling tray with curved edges',
    inStock: true,
    badges: ['new'],
    brand: 'RAW',
    sku: 'RAW-RTL-001'
  },

  // Lighters & Torches
  {
    id: '22',
    name: 'Clipper Lighter 4-Pack',
    category: 'lighters-torches',
    price: 8.99,
    image: '/images/products/clipper-lighter-4pack.jpg',
    description: 'Refillable butane lighters in assorted colors',
    inStock: true,
    badges: ['best-seller'],
    brand: 'Clipper',
    sku: 'CLP-L4P-001'
  },
  {
    id: '23',
    name: 'Blazer Big Shot Torch',
    category: 'lighters-torches',
    price: 59.99,
    originalPrice: 69.99,
    image: '/images/products/blazer-big-shot-torch.jpg',
    description: 'Professional butane torch with adjustable flame',
    inStock: true,
    badges: ['sale'],
    brand: 'Blazer',
    sku: 'BLZ-BST-001'
  },

  // Detox
  {
    id: '24',
    name: 'Mega Clean Detox Drink 32oz',
    category: 'detox',
    price: 39.99,
    image: '/images/products/mega-clean-detox-32oz.jpg',
    description: 'Fast-acting detox drink for cleansing',
    inStock: true,
    badges: ['new'],
    brand: 'Detoxify',
    sku: 'DTX-MC32-001'
  }
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
