//goastrion-frontend/app/vimshottari/page.tsx
import DashaPageClient from "../components/dasha/page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vimshottari Dasha – Your MD & AD Timeline | GoAstrion",
  description:
    "Explore your complete Vimshottari Dasha sequence with Mahadasha (MD), Antardasha (AD) timelines, strengths, transitions, and real Vedic astrology interpretations.",
  keywords: [
    "Vimshottari Dasha",
    "MD AD timeline",
    "Mahadasha calculator",
    "Antardasha",
    "dasha periods",
    "Vedic astrology dasha",
    "GoAstrion dasha",
  ],
  alternates: {
    canonical: "https://goastrion.com/vimshottari",
  },
  openGraph: {
    title: "Vimshottari Dasha – Mahadasha & Antardasha Timeline | GoAstrion",
    description:
      "Check your full Vedic Vimshottari Dasha timeline including Mahadashas, Antardashas, transitions, and strengths based on accurate Vedic calculations.",
    url: "https://goastrion.com/vimshottari",
    siteName: "GoAstrion",
    images: [
      {
        url: "https://goastrion.com/og/vimshottari.jpg",
        width: 1200,
        height: 630,
        alt: "Vimshottari Dasha – GoAstrion",
      },
    ],
    type: "website",
    locale: "en-IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vimshottari Dasha – MD/AD Timeline | GoAstrion",
    description:
      "View your Mahadasha and Antardasha periods with accurate Vedic calculations and transitions.",
    images: ["https://goastrion.com/og/vimshottari.jpg"],
  },
};

export default function Page() {
  return <DashaPageClient />;
}
