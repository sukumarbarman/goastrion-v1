// =========================
// app/components/StructuredData.tsx — JSON‑LD for SEO
// =========================
// =========================
"use client";
import React from "react";

export default function StructuredData() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GoAstrion",
    url: "https://goastrion.com",
    logo: "https://goastrion.com/logo.png",
    sameAs: [
      "https://www.youtube.com/@GoAstrion",
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GoAstrion",
    url: "https://goastrion.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://goastrion.com/search?q={query}",
      query: "required",
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://goastrion.com/",
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}
