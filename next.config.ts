import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Serve at domain root (public_html). Do not set basePath — that caused
  // /Teqnowebs/Teqnowebs/... when files already lived under a Teqnowebs folder.
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/.tools/**", "**/node_modules/**"],
    };
    return config;
  },
};

export default nextConfig;
