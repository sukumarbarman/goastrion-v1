// app/layout.tsx
import "./globals.css";
import ClientShell from "./ClientShell";
import { I18nProvider } from "./lib/i18n";
import Footer from "./components/Footer";
import GATracker from "./gtm-tracker";

import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import ConsentBanner from "./components/ConsentBanner";

/** ——— Site constants ——— */
const SITE_URL = "https://goastrion.com";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const ADS_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT; // ca-pub-xxxx
const ENABLE_ADS = process.env.NEXT_PUBLIC_ENABLE_ADS === "true";

/** ——— Metadata (unchanged) ——— */
export const metadata: Metadata = { /* ... keep your existing metadata ... */ };

const ORG = { /* ... unchanged ... */ };
const WEBSITE = { /* ... unchanged ... */ };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0B1020] text-slate-200 flex flex-col">

        {/* GA4 (kept as-is) */}
        {GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}

                // Consent Mode v2 defaults (safe)
                gtag('consent','default', {
                  ad_storage: 'denied',
                  analytics_storage: 'granted',
                  ad_user_data: 'denied',
                  ad_personalization: 'denied'
                });

                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: false, transport_type: 'beacon' });
              `}
            </Script>
          </>
        )}

        {/* AdSense loader (Auto ads enabled in AdSense UI).
            Loads only in prod when ENABLE_ADS=true and client is set. */}
        {ENABLE_ADS && ADS_CLIENT && (
          <Script
            id="adsense-init"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}

        {/* JSON-LD */}
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
        <ConsentBanner />
        <I18nProvider>
          <Suspense fallback={null}>
            <GATracker />
          </Suspense>

          <div className="flex-1">
            <ClientShell>{children}</ClientShell>
          </div>

          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
