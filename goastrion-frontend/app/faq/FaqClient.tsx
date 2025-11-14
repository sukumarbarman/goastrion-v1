//goastrion-frontend/app/faq/FaqClient.tsx
"use client";

import Script from "next/script";
import Link from "next/link";
import { useI18n } from "../lib/i18n";
import AdSlot from "../components/AdSlot";
import { FAQ_MID_SLOT_ID, FAQ_END_SLOT_ID } from "../constants/ads";

type FaqItem = { q: string; a: string };

export default function FaqClient() {
  const { t, get } = useI18n();

  // Simple fallback
  const tf = (k: string, fb: string) => {
    const v = t(k);
    return v === k ? fb : v;
  };

  // Headings
  const heading = tf("faqPage.heading", "Frequently Asked Questions");
  const introPrefix = tf("faqPage.introPrefix", "New to GoAstrion? Start on the");
  const introMiddle = tf("faqPage.introMiddle", "page, then explore the");
  const introAnd = tf("faqPage.introAnd", "and");
  const linkCreate = tf("faqPage.linkCreate", "Create");
  const linkLifeWheel = tf("faqPage.linkLifeWheel", "Life Wheel");
  const linkSkills = tf("faqPage.linkSkills", "Skills");

  /* ---------------------------
     FEATURED FAQS
  ---------------------------- */
  const featuredFallback: FaqItem[] = [
    {
      q: "What is ShubhDin (auspicious day)?",
      a: "ShubhDin is a supportive time window suggested from your birth details and current Saturn/Moon context. Use it for focused study, interviews, launches, travel planning, or simply a calmer day to move important tasks forward.",
    },
    {
      q: "How does GoAstrion plan for the next 2 years?",
      a: "We compute your chart using UTC/IST precision, then scan for clean Moon aspects, supportive windows, and avoid heavy Saturn station days. The result is a practical next-2-year timing plan.",
    },
    {
      q: "What is Saturn · Sade Sati and how should I use it?",
      a: "We treat Sade Sati as structure, not scare. It's a period to prune distractions and build strong habits. Pair ShubhDin windows with routines—sleep, study, budgeting—to navigate it confidently.",
    },
    {
      q: "What are ‘station’ or ‘retro overlap’ cautions in the app?",
      a: "Station = unstable momentum; avoid risky new commitments. Retro overlap = great for revisions, learning, and renegotiations. GoAstrion highlights these for smart planning.",
    },
  ];

  const rawFeatured = get("faqPage.featured");
  const featured: FaqItem[] = Array.isArray(rawFeatured)
    ? rawFeatured
    : featuredFallback;

  /* ---------------------------
     REMAINING FAQs
  ---------------------------- */
  const rawItems = get("faqPage.items");
  const i18nItems: FaqItem[] = Array.isArray(rawItems) ? rawItems : [];

  /* ---------------------------
     JSON-LD for SEO
  ---------------------------- */
  const allItems: FaqItem[] = [...featured, ...i18nItems];
  const FAQ_LD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      {/* Heading */}
      <h1 className="text-3xl font-semibold text-white">{heading}</h1>

      {/* Intro */}
      <p className="mt-3 text-slate-300 leading-relaxed">
        {introPrefix}{" "}
        <Link href="/create" className="underline decoration-indigo-400 hover:opacity-80">
          {linkCreate}
        </Link>{" "}
        {introMiddle}{" "}
        <Link href="/life-wheel" className="underline decoration-indigo-400 hover:opacity-80">
          {linkLifeWheel}
        </Link>{" "}
        {introAnd}{" "}
        <Link href="/skills" className="underline decoration-indigo-400 hover:opacity-80">
          {linkSkills}
        </Link>
        .
      </p>

      {/* Featured FAQs */}
      <div className="mt-8 space-y-4 text-slate-200">
        {featured.map((it, idx) => (
          <details
            key={`feat-${idx}`}
            className="rounded-xl bg-white/5 p-4 border border-white/10"
          >
            <summary className="cursor-pointer font-medium">{it.q}</summary>
            <p className="mt-2 text-slate-300">{it.a}</p>
          </details>
        ))}
      </div>

      {/* Ad — mid-page */}
      <div className="mt-8">
        <AdSlot slot={FAQ_MID_SLOT_ID} minHeight={300} fullWidthResponsive />
      </div>

      {/* Remaining FAQs */}
      {i18nItems.length > 0 && (
        <div className="mt-8 space-y-4 text-slate-200">
          {i18nItems.map((it, idx) => (
            <details
              key={`i18n-${idx}`}
              className="rounded-xl bg-white/5 p-4 border border-white/10"
            >
              <summary className="cursor-pointer font-medium">{it.q}</summary>
              <p className="mt-2 text-slate-300">{it.a}</p>
            </details>
          ))}
        </div>
      )}

      {/* Ad — bottom */}
      <div className="mt-10">
        <AdSlot slot={FAQ_END_SLOT_ID} minHeight={280} fullWidthResponsive />
      </div>

      {/* JSON-LD */}
      <Script
        id="ld-faq-json"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />
    </main>
  );
}
