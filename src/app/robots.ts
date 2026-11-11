export default function robots() {
  const baseUrl = 'https://www.zsmokeshop.com'

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
