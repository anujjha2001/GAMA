import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: {
    position: 'bottom-right',
  },
  allowedDevOrigins: ['192.168.29.51', '192.168.10.164', '10.71.245.134', 'localhost:3000'],
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
