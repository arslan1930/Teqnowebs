import type { NextConfig } from "next";
import path from "path";

const isDemo = process.env.NEXT_PUBLIC_OPS_MODE === "demo";

const nextConfig: NextConfig = {
  ...(isDemo
    ? {
        output: "export" as const,
        trailingSlash: true,
      }
    : {
        trailingSlash: false,
      }),
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
