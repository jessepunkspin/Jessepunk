import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Next 15 the "experimental.serverActions" must be an object
  // Use an empty object here to satisfy the validator and keep serverActions behavior.
  experimental: {
    serverActions: {}, // <-- use an object, not a boolean
    optimizePackageImports: ["@coinbase/onchainkit"],
  },

  images: {
    unoptimized: true, // required for MiniApps in Base
  },

  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
