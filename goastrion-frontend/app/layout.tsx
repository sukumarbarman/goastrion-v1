// app/layout.tsx
import "./globals.css";
import ClientShell from "./ClientShell";
import { I18nProvider } from "./lib/i18n";
import Footer from "./components/Footer";
import GATracker from "./gtm-tracker";

import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "GoAstrion",
  description: "Astrology-driven guidance",
};

const SITE_URL = "https://goastrion.com";

const ORG = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GoAstrion",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`, // TODO: update to your actual logo path
  sameAs: [
    "https://www.youtube.com/@Area5L",
  ],
};

const WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: SITE_URL,
  name: "GoAstrion",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={query}`,
    "query-input": "required name=query",
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0B1020] text-slate-200 flex flex-col">
        {/* GA4 */}
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
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { anonymize_ip: true, transport_type: 'beacon' });
              `}
            </Script>
          </>
        )}

        {/* JSON-LD: Organization & WebSite */}
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

        <I18nProvider>
          {/* Anything using useSearchParams must be inside Suspense */}
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
