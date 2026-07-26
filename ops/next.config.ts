import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
