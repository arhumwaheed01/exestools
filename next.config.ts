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
  async headers() {
    return [
      {
        // Backup for middleware: Google Sites can iframe these URLs. No X-Frame-Options.
        source: "/classroom-spinner/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://sites.google.com https://*.googleusercontent.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
