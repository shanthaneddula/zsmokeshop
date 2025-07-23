import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://zsmokeshop.com' // Replace with your actual domain when deployed
  
  // Featured products from your homepage
  const featuredProducts = [
    {
      id: 'puffco-peak-pro',
      name: 'Puffco Peak Pro',
      category: 'dab-rigs',
      image: '/images/products/puffco-peak-pro.webp'
    },
    {
      id: 'diamond-glass',
      name: 'Diamond Glass',
      category: 'glass',
      image: '/images/products/Diamond_Glass.webp'
    },
    {
      id: 'empire-hookah',
      name: 'Empire Hookah',
      category: 'hookah',
      image: '/images/products/EmpireHookah.webp'
    },
    {
      id: 'flying-monkey',
      name: 'Flying Monkey',
      category: 'edibles',
      image: '/images/products/Flying Monkey.webp'
    },
    {
      id: 'foger-vape',
      name: 'Foger Vape',
      category: 'vapes',
      image: '/images/products/foger.webp'
    },
    {
      id: 'fvkd-disposable',
      name: 'FVKD Disposable',
      category: 'vapes',
      image: '/images/products/FVKD-1.webp'
    }
  ]

  // Generate sitemap entries for featured products
  const productPages = featuredProducts.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
    images: [`${baseUrl}${product.image}`],
  }))

  return productPages
}
