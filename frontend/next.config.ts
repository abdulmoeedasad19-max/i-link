import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    qualities: [75, 90, 100],
    unoptimized: true,
  },
  experimental: {
    cpus: 1, // Restricts build workers to 1 to prevent Out-Of-Memory crashes
    serverActions: {
      bodySizeLimit: "6mb",
    },
  }
};

export default nextConfig;