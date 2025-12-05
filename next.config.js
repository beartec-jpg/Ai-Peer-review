// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Env vars exposed to client (prefixed with NEXT_PUBLIC_)
  env: {
    // None needed yet; add e.g., NEXT_PUBLIC_APP_URL = process.env.VERCEL_URL
  },

  // Image optimization (for OG images or user uploads)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.openaiusercontent.com', // If using OpenAI-generated images
      },
      // Add more for external images
    ],
  },

  // Experimental features (optional: for better perf)
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk', 'openai', '@google/generative-ai'], // Bundle AI SDKs on server
  },

  // Vercel-specific (auto-handled, but explicit for caching)
  generateEtags: true,
  swcMinify: true,

  // Output: 'standalone' for Docker if needed (default 'auto' for Vercel)
  output: 'standalone',
};

module.exports = nextConfig;
