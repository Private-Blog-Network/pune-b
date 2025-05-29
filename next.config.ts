import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // This will ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
