import { NextResponse } from 'next/server'
import { USE_STATIC_CATALOG } from '@/lib/catalog-source'
import { isRestrictedProduct } from '@/lib/restricted-content'
import { searchCatalog } from '@/data/catalog'
import { getHiddenCatalogSlugs } from '@/lib/catalog-visibility'
import * as ProductStorage from '@/lib/product-storage-service'

function staticXml(urls: string[]) {
  const now = new Date().toISOString()
  const body = urls.map(u => `  <url>\n    <loc>${u.replace(/&/g, '&amp;')}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`).join('\n')
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate' }
  })
}

export async function GET() {
  // Static catalog: list its pages instead of the Redis ones (Redis code below is unchanged).
  if (USE_STATIC_CATALOG) return staticXml(searchCatalog('', await getHiddenCatalogSlugs()).map(p => `https://www.zsmokeshop.com/products/${p.slug}`))

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zsmokeshop.com'
  
  try {
    const products = await ProductStorage.readProducts()
    
    // Only include active products
    const activeProducts = products.filter(product => product.status === 'active' && !isRestrictedProduct(product))
    
    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${activeProducts.map(product => {
  const lastmod = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString()
  return `  <url>
    <loc>${baseUrl}/products/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
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
    console.error('Error generating product sitemap:', error)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: {
        'Content-Type': 'application/xml'
      }
    })
  }
}
