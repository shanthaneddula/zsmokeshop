export default function robots() {
  const baseUrl = 'https://zsmokeshop.com' // Replace with your actual domain when deployed

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
