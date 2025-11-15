/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Next.js properly handles the HTML document
  reactStrictMode: true,
  
  // Webpack configuration to handle potential conflicts
  webpack: (config, { dev, isServer }) => {
    // Handle potential module resolution issues
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        net: false,
        tls: false,
      },
    };

    // Optimize chunk splitting for production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },

  // Disable problematic features for production builds
  experimental: {
    // Keep experimental features minimal for stability
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },

  // Output configuration for better compatibility  
  // Note: Use standalone only for Docker/containerized deployments
  // output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Optimize image handling
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
      }
    ],
    // Add image optimization settings for production
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Additional optimizations
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
