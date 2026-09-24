import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/spinner-wheel",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
