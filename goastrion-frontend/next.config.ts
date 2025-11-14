// goastrion-frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  async redirects() {
    return [
      {
        source: "/dasha",
        destination: "/vimshottari",
        permanent: true, // 301 redirect
      },
      {
        source: "/dasha/:path*",
        destination: "/vimshottari/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
