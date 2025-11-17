import { NextResponse } from 'next/server'
import * as ProductStorage from '@/lib/product-storage-service'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zsmokeshop.com'
  
  try {
    const products = await ProductStorage.readProducts()
    
    // Only include active products
    const activeProducts = products.filter(product => product.status === 'active')
    
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
