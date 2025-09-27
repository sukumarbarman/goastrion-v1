// app/layout.tsx
import "./globals.css";
import ClientShell from "./ClientShell";
import { I18nProvider } from "./lib/i18n";
import Footer from "./components/Footer";
import GATracker from "./gtm-tracker";
import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";   // ✅ add this

export const metadata: Metadata = {
  title: "GoAstrion",
  description: "Astrology-driven guidance",
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0B1020] text-slate-200 flex flex-col">
        {GA_ID && (
          <>
            <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
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

        <I18nProvider>
          {/* ✅ Wrap anything that uses useSearchParams in Suspense */}
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
