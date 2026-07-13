import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Allow local network IP HMR requests to prevent slow full-page reloads
  devIndicators: {
    appIsrStatus: false,
  },
  // In Next.js, allowedDevOrigins is placed at the root of the configuration
  allowedDevOrigins: ['192.168.29.51', 'localhost:3000']
};

export default nextConfig;
