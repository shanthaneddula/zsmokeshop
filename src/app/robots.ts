export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zsmokeshop.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/dashboard/',
        '/api/',
        '/_next/',
        '/cart/',
        '/checkout/',
        '/account/',
        '/login/',
        '/register/',
        '/thank-you/',
        '/order-confirmation/',
      ],
    },
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-categories.xml`,
      `${baseUrl}/sitemap-products.xml`,
    ],
  }
}
