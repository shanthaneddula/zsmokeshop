require('dotenv').config({ path: '.env.local' });
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

const categories = [
  {
    id: 'cat_disposable_vapes',
    name: 'Disposable Nicotine Vapes',
    slug: 'disposable-nicotine-vapes',
    description: 'Disposable vape pens and devices',
    image: '/images/categories/vapes.svg',
    status: 'active',
    active: true,
    sortOrder: 1,
    productCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_reusable_vapes',
    name: 'Reusable Vape Devices & Accessories',
    slug: 'vaporizers',
    description: 'Reusable vape devices and accessories',
    image: '/images/categories/vaporizers.svg',
    status: 'active',
    active: true,
    sortOrder: 2,
    productCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_dry_herb',
    name: 'Dry Herb & Concentrate Vaporizers',
    slug: 'high-end-vaporizers',
    description: 'Premium dry herb and concentrate vaporizers',
    image: '/images/categories/high-end-vapes.svg',
    status: 'active',
    active: true,
    sortOrder: 3,
    productCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_thca_edibles',
    name: 'THCA, CBD & Mushroom Edibles',
    slug: 'thc-a',
    description: 'THCA, CBD and mushroom edibles',
    image: '/images/categories/edibles.svg',
    status: 'active',
    active: true,
    sortOrder: 4,
    productCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_glass',
    name: 'Glass Pipes, Bongs & Concentrate Rigs',
    slug: 'glass',
    description: 'Glass pipes, bongs, and smoking accessories',
    image: '/images/categories/glass.svg',
    status: 'active',
    active: true,
    sortOrder: 5,
    productCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_dab_rigs',
    name: 'Dab Rigs',
    slug: 'dab-rigs',
    description: 'Dab rigs and concentrate accessories',
    image: '/images/categories/dab-rigs.svg',
    status: 'active',
    active: true,
    sortOrder: 6,
    productCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Smoking accessories, rolling papers, grinders, and supplies',
    image: '/images/categories/accessories.svg',
    status: 'active',
    active: true,
    sortOrder: 7,
    productCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_vape_batteries',
    name: 'Vape Batteries',
    slug: 'vape-batteries',
    description: 'Batteries and chargers for vape devices',
    image: '/images/categories/batteries.svg',
    status: 'active',
    active: true,
    sortOrder: 8,
    productCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

async function updateCategories() {
  try {
    console.log('🔄 Updating categories in Redis...\n');
    
    await redis.set('zsmokeshop:categories', JSON.stringify(categories));
    
    console.log('✅ Successfully updated', categories.length, 'categories\n');
    console.log('📂 Categories:');
    categories.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name.padEnd(45)} → ${c.slug}`);
    });
    
    console.log('\n✅ Categories are now live on the shop page!');
    console.log('   Refresh your browser to see the updated categories.');
    
  } catch (error) {
    console.error('❌ Error updating categories:', error);
  } finally {
    redis.quit();
  }
}

updateCategories();
