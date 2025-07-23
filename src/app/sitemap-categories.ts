import { MetadataRoute } from 'next'
import { categories } from '@/data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://zsmokeshop.com' // Replace with your actual domain when deployed
  
  // Generate sitemap entries for all product categories
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    // Add category image URLs
    images: category.image ? [`${baseUrl}${category.image}`] : undefined,
  }))

  return categoryPages
}
