// app/results/page.tsx
import type { Metadata } from "next";
import ResultsClient from "./ResultsClient";

export const metadata: Metadata = {
  title: "Sample Report – GoAstrion Astrology Insights",
  description:
    "Preview the GoAstrion sample astrology report featuring Life Wheel (Domains), Skills mapping, ShubhDin good days, MD/AD timelines, and Saturn Sade Sati guidance.",
  keywords: [
    "GoAstrion report",
    "astrology sample report",
    "Vedic astrology summary",
    "Life Wheel report",
    "ShubhDin report",
    "Sade Sati insights",
    "MD AD report",
  ],
  openGraph: {
    title: "GoAstrion Sample Report – Astrology Summary",
    description:
      "Explore a sample GoAstrion report including Domains, Skills insights, ShubhDin windows, MD-AD timelines, and Saturn phase notes.",
    url: "https://goastrion.com/results",
    siteName: "GoAstrion",
    images: [
      {
        url: "https://goastrion.com/og/results.jpg", // Create this file
        width: 1200,
        height: 630,
        alt: "GoAstrion Sample Astrology Report",
      },
    ],
    locale: "en-IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoAstrion Sample Report – Free Astrology Preview",
    description:
      "See a preview of GoAstrion’s astrology report: Life Wheel domains, Skills mapping, ShubhDin days, and MD/AD timelines.",
    images: ["https://goastrion.com/og/results.jpg"],
  },
  alternates: {
    canonical: "https://goastrion.com/results",
  },
};

export default function ResultsPage() {
  return <ResultsClient />;
}
