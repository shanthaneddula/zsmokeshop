import { Category } from '@/types';

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  brands?: string[];
  image?: string;
}

export interface CatalogueCategory extends Category {
  subcategories?: SubCategory[];
  brands?: string[];
}

export const catalogueData: CatalogueCategory[] = [
  {
    id: 'vaporizers',
    name: 'Vaporizers',
    slug: 'vaporizers',
    image: '/images/categories/vapes.svg',
    brands: ['PAX', 'WULF MODS', 'Thicket', 'Puffco', 'Lookah', 'Yokan']
  },
  {
    id: 'glass-smoking',
    name: 'GLASS & SMOKING',
    slug: 'glass-smoking',
    image: '/images/categories/glass.svg',
    brands: ['DIAMOMD GLASS', 'AQUA WORKS', 'CALI CLOUDX', 'SPACEKING', 'BLAZY SUSAN', 'BEAR QUARTZ', 'TIKI QUARTZ', 'DR.hemp', 'Cheech', 'AGO BONG', 'C.R.E.A.M', 'Raw', '420 wine yards', 'Boss glass', '710 Hypnostate']
  },
  {
    id: 'hookah',
    name: 'Hookah',
    slug: 'hookah',
    image: '/images/categories/hookah.svg',
    brands: ['EMPIRE HOOKAH', 'BY', 'AADHA']
  },
  {
    id: 'cannabis',
    name: 'CANNABIS',
    slug: 'cannabis',
    image: '/images/categories/cbd.svg',
    subcategories: [
      {
        id: 'flower',
        name: 'Flower',
        slug: 'flower',
        image: '/images/products/buds.jpg',
        brands: ['Dope pros', 'Fyre', 'Sticky green']
      },
      {
        id: 'pre-rolls',
        name: 'Pre-Rolls',
        slug: 'pre-rolls',
        image: '/images/products/pre-rolls.jpg',
        brands: ['Zour stash', 'Terpboys', 'Casper', 'FVKD', 'DANK LEAF', 'GOO\'D extracts', 'Flying monkey', 'lost thc', 'Ikonik', 'Dank leaf']
      },
      {
        id: 'edibles',
        name: 'Edibles',
        slug: 'edibles',
        image: '/images/products/edibles.jpg',
        brands: ['Mellow fellow', 'Flying horse', 'Casper', 'FVKD', 'Hidden hills', 'Happy hour', 'LOOPER', 'Half baked', 'Elevated edibles', 'Hometown hero', 'Double stacked Bitez', 'Just cbd', 'Minds eye', 'WCW winners circle wellness', 'Looper']
      },
      {
        id: 'extracts',
        name: 'Extracts',
        slug: 'extracts',
        image: '/images/products/extracts.jpg',
        brands: ['Half baked']
      },
      {
        id: 'vapes',
        name: 'Vapes',
        slug: 'vapes',
        image: '/images/products/thc-vape.jpg',
        brands: ['Mellow fellow', 'Flying horse', 'Casper', 'FVKD', 'Hidden hills', 'Happy hour', 'LOOPER', 'Half baked']
      }
    ]
  },
  {
    id: 'mushroom',
    name: 'Mushroom',
    slug: 'mushroom',
    image: '/images/categories/mushroom.svg',
    brands: ['Road trip', 'Diamond shruumz', 'Wunder', 'Silly farms magic mushroom chocolate', 'MOO shrooms', 'Goomz mad honey', 'Moocah gummies', 'Sacred journey', 'Mochi magic mushroom chocolate']
  },
  {
    id: 'vapes-mods-pods',
    name: 'VAPES, MODS & PODS',
    slug: 'vapes-mods-pods',
    image: '/images/categories/vapes.svg',
    brands: ['Smok', 'Geekvape', 'Vaporesso', 'Leaf buddi', 'Ooze', 'Iconic', 'Exus Snap', 'V-mod', 'UWELL CALIBURN']
  },
  {
    id: 'e-liquids',
    name: 'E-LIQUIDS',
    slug: 'e-liquids',
    image: '/images/categories/e-liquids.svg',
    brands: ['Cloud nurdz', 'Costal clouds', 'Juice heads', 'Vapetesia Better salt', 'Lucid air', 'Hometown hero']
  },
  {
    id: 'disposable-vapes',
    name: 'DISPOSABLE VAPES',
    slug: 'disposable-vapes',
    image: '/images/categories/disposable-vapes.svg',
    brands: ['Geek bar', 'Foger', 'Fiftybar', 'Lostmary', 'Privbar', 'flamingo', 'Cloud nurdz PYRO']
  }
];

// Mock product data generator function
export const generateMockProducts = (categoryId: string, subcategoryId: string, count: number = 8) => {
  const category = catalogueData.find(cat => cat.id === categoryId);
  const subcategory = category?.subcategories?.find(sub => sub.id === subcategoryId);
  
  if (!category || !subcategory) return [];
  
  const brands = subcategory.brands || ['Generic Brand'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${categoryId}-${subcategoryId}-${i + 1}`,
    name: `${brands[i % brands.length]} ${subcategory.name} ${i + 1}`,
    price: 19.99 + (i * 5),
    image: subcategory.image || '/images/products/placeholder.jpg',
    category: categoryId,
    subcategory: subcategoryId,
    inStock: Math.random() > 0.2,
    description: `Premium quality ${subcategory.name.toLowerCase()} from ${brands[i % brands.length]}.`,
    brand: brands[i % brands.length]
  }));
};
