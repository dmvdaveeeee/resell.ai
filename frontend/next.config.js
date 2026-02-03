/** @type {import('next').NextConfig} */
const nextConfig = {
  // If using Next.js 13+ App Router (recommended)
  output: 'standalone',  // For serverless deployment
  
  // OR if you want static export (no API routes)
  // output: 'export',
  // distDir: 'dist',
  
  // Allow images from external sources (Alibaba images)
  images: {
    unoptimized: true,  // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
};

module.exports = nextConfig;
