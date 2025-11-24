// =========================
// app/components/StructuredData.tsx — JSON‑LD for SEO
// =========================
// =========================
// =========================
// Clean StructuredData Component
// For Home Page Only (AdSense + SEO Safe)
// =========================

"use client";
import React from "react";
import Script from "next/script";

export default function StructuredData() {
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "GoAstrion – Free Vedic Birth Chart & ShubhDin",
    url: "https://goastrion.com/",
    description:
      "Generate your free Vedic birth chart instantly. Explore ShubhDin, life domains, Saturn phases, skills, and personalized timing insights based on authentic Vedic astrology.",
  };

  return (
    <Script
      id="webpage-structured-data"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
    />
  );
}
