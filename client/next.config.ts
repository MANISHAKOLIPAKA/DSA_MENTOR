import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "userpic.codeforces.org" },
    ],
  },
  experimental: {
    optimizePackageImports: ["firebase", "@anthropic-ai/sdk"],
  },
};

export default nextConfig;
