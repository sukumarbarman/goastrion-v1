// goastrion-frontend/app/shubhdin/page.tsx
import Container from "@/app/components/Container";
import ShubhDinClient from "./ShubhDinClient";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShubhDin – Your Auspicious & Inauspicious Day Windows | GoAstrion",
  description:
    "Check your personalized ShubhDin — auspicious and inauspicious day windows — based on Vedic astrology, lunar movements, and your birth chart. Discover the best days for job change, investments, travel, and major events.",
  keywords: [
    "ShubhDin",
    "auspicious day",
    "inauspicious day",
    "good time astrology",
    "best dates Vedic astrology",
    "day prediction",
    "astrology daily timing",
    "GoAstrion ShubhDin",
  ],
  alternates: {
    canonical: "https://goastrion.com/shubhdin",
  },
  openGraph: {
    title:
      "ShubhDin – Find Your Auspicious & Inauspicious Days | GoAstrion Astrology",
    description:
      "Explore your ShubhDin: favorable and unfavorable day windows calculated using authentic Vedic astrology and your personal birth chart.",
    url: "https://goastrion.com/shubhdin",
    siteName: "GoAstrion",
    images: [
      {
        url: "https://goastrion.com/og/shubhdin.jpg", // Add this image
        width: 1200,
        height: 630,
        alt: "ShubhDin – Auspicious & Inauspicious Day Windows",
      },
    ],
    locale: "en-IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShubhDin – Your Auspicious & Inauspicious Timing | GoAstrion",
    description:
      "Know your favorable and unfavorable day windows using Vedic astrology rules, tithis, nakshatras, and your own chart.",
    images: ["https://goastrion.com/og/shubhdin.jpg"],
  },
};

export default function Page() {
  return (
    <Container>
      <div className="px-4 md:px-6 pt-6">
        <Suspense fallback={<div className="text-slate-300">Loading…</div>}>
          <ShubhDinClient showTitle />
        </Suspense>
      </div>
    </Container>
  );
}
