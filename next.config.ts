import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: {
    position: 'bottom-right',
  },
  // In Next.js, allowedDevOrigins is placed at the root of the configuration
  allowedDevOrigins: ['192.168.29.51', 'localhost:3000'],
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/nexus',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
