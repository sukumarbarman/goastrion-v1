// app/daily/page.tsx
import type { Metadata } from "next";
import DailyClient from "@/app/components/daily/DailyClient";

export const metadata: Metadata = {
  title: "Daily Predictions – GoAstrion Astrology for Today",
  description:
    "Check your daily supportive windows, caution periods, highlights, and helpful remedies based on authentic Vedic astrology.",
  keywords: [
    "daily astrology",
    "today astrology",
    "daily horoscope Vedic",
    "supportive time today",
    "caution time today",
    "ShubhDin today",
    "GoAstrion daily",
  ],
  alternates: {
    canonical: "https://goastrion.com/daily",
  },
  openGraph: {
    title: "Daily Predictions – GoAstrion Astrology for Today",
    description:
      "Explore today's supportive windows, planetary highlights, caution periods, and suggested remedies calculated through Vedic astrology.",
    url: "https://goastrion.com/daily",
    siteName: "GoAstrion",
    images: [
      {
        url: "https://goastrion.com/og/daily.jpg", // Create this file
        width: 1200,
        height: 630,
        alt: "Daily Astrology – GoAstrion",
      },
    ],
    type: "website",
    locale: "en-IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Predictions – GoAstrion",
    description:
      "Your daily astrology timing windows: supportive, caution, highlights, and remedies.",
    images: ["https://goastrion.com/og/daily.jpg"],
  },
};

export default function DailyPage() {
  return <DailyClient />;
}
