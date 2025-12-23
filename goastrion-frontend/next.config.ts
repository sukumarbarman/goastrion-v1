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
      // Dasha → Vimshottari redirects
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

      // Domains → Life Wheel restructure
      {
        source: "/domains",
        destination: "/life-wheel",
        permanent: true,
      },
      {
        source: "/domains/:path*",
        destination: "/life-wheel/:path*",
        permanent: true,
      },

      // Standalone life area pages → Life Wheel
      {
        source: "/finance",
        destination: "/life-wheel/finance",
        permanent: true,
      },
      {
        source: "/health",
        destination: "/life-wheel/health",
        permanent: true,
      },
      {
        source: "/marriage",
        destination: "/life-wheel/marriage",
        permanent: true,
      },
      {
        source: "/career-guidance",
        destination: "/life-wheel/career",
        permanent: true,
      },

      // Privacy policy redirect (NEW FIX)
      {
        source: "/privacy-policy",
        destination: "/privacy",
        permanent: true,
      },

      // Chart → Create redirect (NEW FIX)
      {
        source: "/chart",
        destination: "/create",
        permanent: true,
      },

      // Language variants → Homepage (if not planning localization)
      {
        source: "/hi",
        destination: "/",
        permanent: true,
      },
      {
        source: "/bn",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;