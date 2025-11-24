// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  // ⭐ Prevents duplicate URLs (/page and /page/)
  trailingSlash: false,

  // ⭐ Improve performance & AdSense rendering
  compress: true,

  async redirects() {
    return [
      {
        source: "/dasha",
        destination: "/vimshottari",
        permanent: true,
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
