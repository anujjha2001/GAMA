import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: {
    position: 'bottom-right',
  },
  allowedDevOrigins: ['192.168.29.51', '192.168.10.164', 'localhost:3000'],
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
