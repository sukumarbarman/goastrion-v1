// app/faq/page.tsx
import FaqClient from "./FaqClient";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "GoAstrion FAQs – Your Astrology Questions Answered",
  description:
    "Find answers to common questions about Vedic charts, ShubhDin, the Life Wheel, Skills, Saturn Dasa, MD/AD timing, timezone accuracy, and how GoAstrion works.",
  keywords: [
    "GoAstrion FAQ",
    "astrology FAQ",
    "Vedic astrology questions",
    "ShubhDin help",
    "Sade Sati questions",
    "birth chart accuracy",
    "GoAstrion help",
  ],
  openGraph: {
    title: "GoAstrion FAQs – Your Astrology Questions Answered",
    description:
      "Explore detailed answers on charts, the Life Wheel, Skills, languages/localization, timing logic, and how GoAstrion provides accurate Vedic astrology insights.",
    url: "https://goastrion.com/faq",
    siteName: "GoAstrion",
    images: [
      {
        url: "https://goastrion.com/og/faq.jpg",
        width: 1200,
        height: 630,
        alt: "GoAstrion FAQ",
      },
    ],
    locale: "en-IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoAstrion FAQs – Frequently Asked Questions",
    description:
      "Get clear answers about Vedic birth charts, MD/AD, the Life Wheel, localization, timing calculations, Skills, and more.",
    images: ["https://goastrion.com/og/faq.jpg"],
  },
  alternates: {
    canonical: "https://goastrion.com/faq",
  },
};

/* ------------------- FAQ Structured Data (JSON-LD) ------------------- */
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is ShubhDin in astrology?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ShubhDin means your personal auspicious day or time window based on Vedic astrology. GoAstrion instantly calculates your daily ShubhDin for success in major activities.",
      },
    },
    {
      "@type": "Question",
      name: "How can I check my good and cautious time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GoAstrion uses your Vedic chart, planetary transits, and daily influences to show your personal Good Time and Cautious Time—free and instant.",
      },
    },
    {
      "@type": "Question",
      name: "What does Saturn Dasa or Sade Sati mean?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Saturn Dasa and Sade Sati represent important karmic cycles that impact career, relationships, health, and timing. GoAstrion provides clarity on your current and upcoming Saturn phases.",
      },
    },
    {
      "@type": "Question",
      name: "Is GoAstrion really free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! All core features—including Vedic Birth Chart, ShubhDin, Life Wheel, and Saturn Dasa—are 100% free with no login required.",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      {/* Inject FAQPage structured data */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <FaqClient />
    </>
  );
}
