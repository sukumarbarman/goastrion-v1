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
  "Find auspicious dates (ShubhDin) for job change, marriage, property & more. Create a free Vedic birth chart and get Saturn/Sade Sati insights in seconds.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GoAstrion — ShubhDin, Saturn & Free Vedic Birth Chart",
    template: "%s | GoAstrion",
  },
  description: defaultDescription,
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "GoAstrion — ShubhDin, Saturn & Free Vedic Birth Chart",
    description: defaultDescription,
    siteName: "GoAstrion",
    images: [
      {
        url: "/og/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "GoAstrion — ShubhDin & Saturn insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GoAstrion — ShubhDin, Saturn & Free Vedic Birth Chart",
    description: defaultDescription,
    images: ["/og/og-home.jpg"],
  },
  robots: { index: true, follow: true },
};

/* ----------------------------- JSON-LD Schema ----------------------------- */
const ORG = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GoAstrion",
  url: SITE_URL,
  logo: SITE_URL + "/logo.png",
};

const WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GoAstrion",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: SITE_URL + "/search?q={query}",
    query: "required",
  },
};

/* ------------------------------- Root Layout ------------------------------ */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
                analytics_storage:'granted',
                ad_user_data:'denied',
                ad_personalization:'denied'
              });
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { send_page_view: false });
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
