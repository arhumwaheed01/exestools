import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/spinner-wheel",
        destination: "/",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/about",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
