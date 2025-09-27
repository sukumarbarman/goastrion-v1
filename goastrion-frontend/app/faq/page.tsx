// app/faq/page.tsx
import Script from "next/script";

export const metadata = {
  title: "GoAstrion FAQs",
  description: "Answers to common questions about charts and guidance.",
  alternates: { canonical: "https://goastrion.com/faq" },
};

const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is the chart free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can generate a basic chart for free. Premium insights are optional."
      }
    },
    {
      "@type": "Question",
      "name": "Do you use Vedic (sidereal) calculations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes—North Indian style charts with sidereal calculations."
      }
    },
    {
      "@type": "Question",
      "name": "What details do I need to generate a chart?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Date of birth, time of birth, and place (latitude/longitude helps for accuracy)."
      }
    },
    {
      "@type": "Question",
      "name": "Can I view highlights like Career or Finance?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The app summarizes key houses and planetary influences for domains like Career, Finance, Marriage, and Health."
      }
    }
  ]
};

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">FAQs</h1>
      <div className="mt-4 space-y-4 text-slate-200/90">
        <details><summary className="cursor-pointer font-medium">Is the chart free?</summary>
          <p className="mt-2">You can generate a basic chart for free. Premium insights are optional.</p>
        </details>
        <details><summary className="cursor-pointer font-medium">Do you use Vedic (sidereal) calculations?</summary>
          <p className="mt-2">Yes—North Indian style charts with sidereal calculations.</p>
        </details>
        <details><summary className="cursor-pointer font-medium">What details do I need to generate a chart?</summary>
          <p className="mt-2">Date of birth, time of birth, and place (latitude/longitude helps for accuracy).</p>
        </details>
        <details><summary className="cursor-pointer font-medium">Can I view highlights like Career or Finance?</summary>
          <p className="mt-2">Yes. The app summarizes key houses and planetary influences for domains like Career, Finance, Marriage, and Health.</p>
        </details>
      </div>

      {/* JSON-LD for rich results */}
      <Script
        id="ld-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />
    </main>
  );
}
