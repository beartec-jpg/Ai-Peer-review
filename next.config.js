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

  // Bundle AI SDKs on server (moved from experimental)
  serverExternalPackages: ['openai'],

  // Vercel-specific (auto-handled, but explicit for caching)
  generateEtags: true,
};

module.exports = nextConfig;
