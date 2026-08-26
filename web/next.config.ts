import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve Shopify CDN images directly (bypasses Vercel's image-optimization
    // quota that was returning HTTP 402 and blanking product images).
    loader: "custom",
    loaderFile: "./image-loader.ts",
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
};

export default nextConfig;
