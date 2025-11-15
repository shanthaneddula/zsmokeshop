/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Next.js properly handles the HTML document
  reactStrictMode: true,
  // Disable any legacy features that might cause conflicts
  experimental: {
    // Configure experimental features correctly
  },
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
  },
};

module.exports = nextConfig;
