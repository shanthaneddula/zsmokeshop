import { MetadataRoute } from 'next'
import { USE_STATIC_CATALOG } from '@/lib/catalog-source'
import { filterVisibleCategories } from '@/data/catalog'
import { getHiddenCatalogSlugs } from '@/lib/catalog-visibility'

// Canonical public host. Admin, account, cart, checkout and API routes are never listed.
const SITE_URL = 'https://www.zsmokeshop.com'

// Re-check hidden products (admin visibility overrides) every 5 minutes.
export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL
  const now = new Date()

  // Main static pages - high priority pages for SEO
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/locations`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/request-product`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/support`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Redis-backed storefront keeps using /sitemap-categories.xml and /sitemap-products.xml.
  if (!USE_STATIC_CATALOG) return staticPages

  const catalogPages: MetadataRoute.Sitemap = []
  // Hidden products (and brands/categories left empty) are never listed.
  const hidden = await getHiddenCatalogSlugs()
  for (const category of filterVisibleCategories(hidden)) {
    catalogPages.push({
      url: `${baseUrl}/shop?category=${encodeURIComponent(category.slug)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
    for (const brand of category.brands) {
      catalogPages.push({
        // Next does not XML-escape sitemap URLs, so the query separator is written as &amp;
        url: `${baseUrl}/shop?category=${encodeURIComponent(category.slug)}&amp;brand=${encodeURIComponent(brand.slug)}`,
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
