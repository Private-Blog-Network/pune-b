import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Ignore TypeScript build errors in production
    ignoreBuildErrors: true,
  },
  eslint: {
    // This will ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
