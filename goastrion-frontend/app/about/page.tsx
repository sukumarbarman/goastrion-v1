// goastrion-frontend/app/about/page.tsx
import About from "../components/About";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About GoAstrion – Clarity Through Astrology & Technology",
  description:
    "Discover how GoAstrion blends Vedic astrology and modern technology to help students and professionals make smarter life decisions with timing clarity and confidence.",
  keywords: [
    "GoAstrion",
    "Vedic astrology",
    "astrology app",
    "Saturn Sade Sati",
    "ShubhDin",
    "astrology technology",
    "life timing",
    "career astrology",
  ],
  openGraph: {
    title: "About GoAstrion – Clarity Through Astrology & Technology",
    description:
      "GoAstrion transforms ancient Vedic astrology into modern, practical guidance. Learn our mission and the story behind our timing-based approach.",
    url: "https://goastrion.com/about",
    siteName: "GoAstrion",
    images: [
      {
        url: "https://goastrion.com/og/about.jpg",  // <-- Improved URL path
        width: 1200,
        height: 630,
        alt: "About GoAstrion",
      },
    ],
    locale: "en-IN",  // <-- Fix: use correct OG locale format
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About GoAstrion – Clarity Through Astrology & Technology",
    description:
      "GoAstrion brings astrology and technology together to help you plan your next 2 years with confidence and clarity.",
    images: ["https://goastrion.com/og/about.jpg"], // <-- Same improved image path
  },
  alternates: {
    canonical: "https://goastrion.com/about", // (Correct)
  },
};

export default function AboutPage() {
  return <About />;
}
