import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: true,
    optimizePackageImports: ["@coinbase/onchainkit"],
  },

  images: {
    unoptimized: true, // required for Farcaster MiniApps
  },

  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
