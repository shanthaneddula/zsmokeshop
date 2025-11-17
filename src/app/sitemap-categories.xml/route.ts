import { NextResponse } from 'next/server'
import * as CategoryStorage from '@/lib/category-storage-service'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zsmokeshop.com'
  
  try {
    const categories = await CategoryStorage.readCategories()
    
    // Only include active categories
    const activeCategories = categories.filter(category => category.status === 'active')
    
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
