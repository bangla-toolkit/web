import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  serverExternalPackages: ["@electric-sql/pglite"],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.sql$/,
      use: "raw-loader",
    });
    return config;
  },
};

export default nextConfig;
