import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  transpilePackages: ["fabric"],
};

export default nextConfig;
