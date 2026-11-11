import { NextResponse } from 'next/server'
import { USE_STATIC_CATALOG } from '@/lib/catalog-source'
import { isRestrictedCategorySlug } from '@/lib/restricted-content'
import { filterVisibleCategories } from '@/data/catalog'
import { getHiddenCatalogSlugs } from '@/lib/catalog-visibility'
import * as CategoryStorage from '@/lib/category-storage-service'

function staticXml(urls: string[]) {
  const now = new Date().toISOString()
  const body = urls.map(u => `  <url>\n    <loc>${u.replace(/&/g, '&amp;')}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`).join('\n')
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate' }
  })
}

export async function GET() {
  // Static catalog: list its pages instead of the Redis ones (Redis code below is unchanged).
  if (USE_STATIC_CATALOG) return staticXml(filterVisibleCategories(await getHiddenCatalogSlugs()).flatMap(c => [`https://www.zsmokeshop.com/shop?category=${c.slug}`, ...c.brands.map(b => `https://www.zsmokeshop.com/shop?category=${c.slug}&brand=${b.slug}`)]))

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zsmokeshop.com'
  
  try {
    const categories = await CategoryStorage.readCategories()
    
    // Only include active categories
    const activeCategories = categories.filter(category => category.status === 'active' && !isRestrictedCategorySlug(category.slug))
    
    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${activeCategories.map(category => {
  const lastmod = category.updatedAt ? new Date(category.updatedAt).toISOString() : new Date().toISOString()
  return `  <url>
    <loc>${baseUrl}/shop?category=${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
}).join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate'
      }
    })
  } catch (error) {
    console.error('Error generating category sitemap:', error)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: {
        'Content-Type': 'application/xml'
      }
    })
  }
}
