import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true, // This will ignore type errors during the build
  },
  images: {
    domains: ['images.unsplash.com', 'i.ytimg.com'],
  },
};

export default nextConfig;
