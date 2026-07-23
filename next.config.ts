import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: {
    position: 'bottom-right',
  },
  allowedDevOrigins: [
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
    '192.168.29.51',
    '192.168.10.164',
    '10.71.245.134',
  ],
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@react-three/drei',
      'three',
      'recharts',
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/nexus',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
