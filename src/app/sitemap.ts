import { MetadataRoute } from 'next'
import { USE_STATIC_CATALOG } from '@/lib/catalog-source'
import { getCatalogCategories } from '@/data/catalog'

// Canonical public host. Admin, account, cart, checkout and API routes are never listed.
const SITE_URL = 'https://www.zsmokeshop.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL
  const now = new Date()

  // Main static pages - high priority pages for SEO
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/locations`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/support`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]

  // Redis-backed storefront keeps using /sitemap-categories.xml and /sitemap-products.xml.
  if (!USE_STATIC_CATALOG) return staticPages

  const catalogPages: MetadataRoute.Sitemap = []
  for (const category of getCatalogCategories()) {
    catalogPages.push({
      url: `${baseUrl}/shop?category=${encodeURIComponent(category.slug)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
    for (const brand of category.brands) {
      catalogPages.push({
        url: `${baseUrl}/shop?category=${encodeURIComponent(category.slug)}&brand=${encodeURIComponent(brand.slug)}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
      for (const product of brand.products) {
        catalogPages.push({
          url: `${baseUrl}/products/${encodeURIComponent(product.slug)}`,
          lastModified: now,
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      }
    }
  }

  return [...staticPages, ...catalogPages]
}
