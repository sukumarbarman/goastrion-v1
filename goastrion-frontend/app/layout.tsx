//goastrion-frontend/app/layout.tsx
import "./globals.css";
import ClientShell from "./ClientShell";
import { I18nProvider } from "./lib/i18n";
import Footer from "./components/Footer";
import GATracker from "./gtm-tracker";
import ConsentBanner from "./components/ConsentBanner";
import { AuthProvider } from "./context/AuthContext";

import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";

/* ----------------------------- Site constants ----------------------------- */
const SITE_URL = "https://goastrion.com" as const;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const ADS_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const ENABLE_ADS = process.env.NEXT_PUBLIC_ENABLE_ADS === "true";

/* ------------------------------- Metadata --------------------------------- */
const defaultDescription =
  "GoAstrion — Free online Vedic astrology tool to know your good time, cautious time, and auspicious days (ShubhDin) for today and tomorrow. Instantly generate your free Vedic birth chart, explore Saturn Dasa, Vimshottari Dasha, and Life Wheel insights. Discover favorable periods for marriage, relationship, job change, or travel — all based on authentic Vedic principles.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "GoAstrion — Free Vedic Birth Chart, ShubhDin & Astrology for Good Time Today",
    template: "%s | GoAstrion",
  },
  description: defaultDescription,
  keywords: [
    "GoAstrion",
    "free Vedic astrology",
    "Vedic birth chart online",
    "ShubhDin calculator",
    "good time today astrology",
    "cautious time astrology",
    "Saturn Dasa",
    "Sade Sati calculator",
    "Vimshottari Dasha",
    "Life Wheel astrology",
    "Skill astrology",
    "career astrology",
    "marriage astrology",
    "relationship prediction",
    "job change astrology",
    "travel astrology",
    "daily astrology insights",
    "Vedic horoscope",
    "free kundli online",
    "Vedic astrology software",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title:
      "GoAstrion — Free Vedic Astrology, ShubhDin & Saturn Dasa Insights",
    description: defaultDescription,
    siteName: "GoAstrion",
    images: [
      {
        url: "/og/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "GoAstrion — Free Vedic Astrology, ShubhDin & Birth Chart",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "GoAstrion — Know Your Good Time & Create Free Vedic Birth Chart Online",
    description: defaultDescription,
    images: ["/og/og-home.jpg"],
  },
  robots: { index: true, follow: true },   // <-- Canonical removed
  other: {
    slogan:
      "Know today, tomorrow, and your good & cautious times — with GoAstrion’s free Vedic birth chart and Saturn Dasa insights.",
  },
};

/* ----------------------------- JSON-LD Schema ----------------------------- */
const ORG = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GoAstrion",
  url: SITE_URL,
  logo: SITE_URL + "/logo.png",
  slogan:
    "Know today, tomorrow, and your good & cautious times with Vedic astrology insights.",
  sameAs: [
    "https://www.facebook.com/GoAstrion",
    "https://www.youtube.com/@GoAstrion",
    "https://x.com/GoAstrion",
  ],
};

const WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GoAstrion",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: SITE_URL + "/search?q={query}",
    "query-input": "required name=query",
  },
};

const FAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is ShubhDin in astrology?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ShubhDin means an auspicious day or time window calculated from your Vedic birth chart. GoAstrion instantly finds your personal ShubhDin for marriage, job change, or travel.",
      },
    },
    {
      "@type": "Question",
      name: "How can I find my good and cautious time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "With GoAstrion, you can check your daily good and cautious times using real-time Vedic planetary analysis — free and accurate.",
      },
    },
    {
      "@type": "Question",
      name: "What is Saturn Dasa or Sade Sati?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Saturn Dasa or Sade Sati represents key karmic phases influenced by Saturn. GoAstrion shows your current and upcoming Saturn Dasa periods and how they impact life areas like career, health, and relationships.",
      },
    },
    {
      "@type": "Question",
      name: "Is the Vedic birth chart on GoAstrion really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! GoAstrion offers a 100% free online Vedic birth chart, with instant calculation of houses, planets, and dasa timelines — no sign-up required.",
      },
    },
  ],
};

/* ------------------------------- Root Layout ------------------------------ */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />

      <body className="min-h-screen bg-[#0B1020] text-slate-200 flex flex-col">
        {/* -------------------- Analytics & Ads Scripts -------------------- */}
        {GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent','default',{
                ad_storage:'denied',
                ad_user_data:'denied',
                ad_personalization:'denied',
                analytics_storage:'granted'
              });
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}

        {ENABLE_ADS && ADS_CLIENT && (
          <Script
            id="adsense-init"
            strategy="beforeInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}

        {/* ----------------------- JSON-LD Structured Data ----------------------- */}
        <Script
          id="ld-org"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG) }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE) }}
        />
        <Script
          id="ld-faq"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ) }}
        />

        {/* -------------------------- App Providers -------------------------- */}
        <ConsentBanner />
        <I18nProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <GATracker />
            </Suspense>

            <div className="flex-1">
              <ClientShell>{children}</ClientShell>
            </div>

            <Footer />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
