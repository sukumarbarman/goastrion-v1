// app/faq/page.tsx
import FaqClient from "./FaqClient";
import type { Metadata } from "next";

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

export default function Page() {
  return <FaqClient />;
}
