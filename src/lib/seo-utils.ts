import { Metadata } from 'next';
import { AdminProduct } from '@/types';
import { formatPrice } from './product-utils';

const SITE_NAME = 'Z Smoke Shop';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zsmokeshop.com';
const BUSINESS_NAME = 'Z Smoke Shop - Austin, TX';
const LOCATION = 'Austin, Texas';

export function generateProductMetadata(product: AdminProduct): Metadata {
  const title = `${product.name} | ${BUSINESS_NAME}`;
  const description = generateProductDescription(product);
  const productUrl = `${SITE_URL}/products/${product.slug}`;
  const imageUrl = product.image ? `${SITE_URL}${product.image}` : `${SITE_URL}/images/og-default.jpg`;
  
  // Enhanced keywords with local SEO
  const keywords = [
    product.name,
    product.brand || '',
    product.category.replace(/-/g, ' '),
    'Austin smoke shop',
    'Austin vape shop',
    'Texas smoke accessories',
    'Austin tobacco store',
    LOCATION,
    'smoke shop near me'
  ].filter(Boolean).join(', ');

  return {
    title,
    description,
    keywords,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    
    // Open Graph
    openGraph: {
      title,
      description,
      url: productUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${product.name} - Available at ${BUSINESS_NAME}`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@zsmokeshop',
    },
    
    // Additional metadata
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Canonical URL
    alternates: {
      canonical: productUrl,
    },
    
    // Additional meta tags
    other: {
      'product:price:amount': product.salePrice || product.price,
      'product:price:currency': 'USD',
      'product:availability': product.inStock ? 'in stock' : 'out of stock',
      'product:brand': product.brand || '',
      'product:category': product.category,
      'business:contact_data:locality': 'Austin',
      'business:contact_data:region': 'Texas',
      'business:contact_data:country_name': 'United States',
    },
  };
}

function generateProductDescription(product: AdminProduct): string {
  const baseDescription = product.shortDescription || product.detailedDescription || `${product.name} available at ${BUSINESS_NAME}`;
  const priceText = product.salePrice 
    ? `Sale price ${formatPrice(product.salePrice)} (was ${formatPrice(product.price)})`
    : `Price ${formatPrice(product.price)}`;
  
  const stockText = product.inStock ? 'In stock' : 'Currently out of stock';
  const locationText = `Available at our ${LOCATION} location`;
  
  return `${baseDescription} ${priceText}. ${stockText}. ${locationText}. Shop premium smoke accessories, vapes, and tobacco products in Austin, Texas.`;
}

export function generateStructuredData(product: AdminProduct) {
  const productUrl = `${SITE_URL}/products/${product.slug}`;
  const imageUrl = product.image ? `${SITE_URL}${product.image}` : null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.detailedDescription || `${product.name} available at ${BUSINESS_NAME}`,
    image: imageUrl ? [imageUrl] : [],
    url: productUrl,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'USD',
      price: product.salePrice || product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: BUSINESS_NAME,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Austin',
          addressRegion: 'TX',
          addressCountry: 'US',
        },
      },
    },
    category: product.category.replace(/-/g, ' '),
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        ratingCount: 1, // Placeholder - can be enhanced with actual review system
      },
    }),
  };
}

export function generateLocalBusinessStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TobaccoShop',
    name: BUSINESS_NAME,
    image: `${SITE_URL}/images/store-front.jpg`,
    '@id': SITE_URL,
    url: SITE_URL,
    telephone: '+1-512-XXX-XXXX', // Replace with actual phone
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'XXX Street', // Replace with actual address
      addressLocality: 'Austin',
      addressRegion: 'TX',
      postalCode: 'XXXXX', // Replace with actual zip
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 30.2672, // Austin coordinates - replace with actual
      longitude: -97.7431,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '21:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '10:00',
        closes: '22:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '12:00',
        closes: '20:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/zsmokeshop', // Replace with actual social media
      'https://www.instagram.com/zsmokeshop',
    ],
  };
}

export function generateBreadcrumbStructuredData(product: AdminProduct) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: `${SITE_URL}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category.replace(/-/g, ' '),
        item: `${SITE_URL}/shop?category=${product.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `${SITE_URL}/products/${product.slug}`,
      },
    ],
  };
}
