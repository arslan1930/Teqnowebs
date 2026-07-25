import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Hostinger folder: public_html/Teqnowebs → https://domain/Teqnowebs/
  // Upload build CONTENTS into that folder (do not nest another Teqnowebs/).
  basePath: "/Teqnowebs",
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
