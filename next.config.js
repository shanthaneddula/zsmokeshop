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
    domains: [],
  },
};

module.exports = nextConfig;
