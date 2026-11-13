/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic Next.js configuration
  reactStrictMode: true,
  
  // Webpack configuration for compatibility
  webpack: (config, { isServer }) => {
    // Handle Node.js modules on client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // No online sales: send any cart/checkout URL to the catalog.
  // Also pin the apex host to www with a permanent redirect (308). A temporary
  // 307 from the platform splits SEO signals across two origins.
  async redirects() {
    const apexToWww = [
      {
        source: '/',
        has: [{ type: 'host', value: 'zsmokeshop.com' }],
        destination: 'https://www.zsmokeshop.com/',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'zsmokeshop.com' }],
        destination: 'https://www.zsmokeshop.com/:path*',
        permanent: true,
      },
    ];
    return [
      ...apexToWww,
      { source: '/cart', destination: '/shop', permanent: false },
      { source: '/cart/:path*', destination: '/shop', permanent: false },
      { source: '/checkout', destination: '/shop', permanent: false },
      { source: '/checkout/:path*', destination: '/shop', permanent: false },
    ];
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'j9jxbouddwjbcz7m.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'grav.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.lookah.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hometownhero.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'genuineraw.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'blazysusan.com',
        port: '',
        pathname: '/**',
      },    ],
    formats: ['image/webp', 'image/avif'],
    qualities: [60, 70, 75, 80, 85, 90, 95],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; img-src 'self' data: https:; sandbox;",
  },

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Performance settings
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
