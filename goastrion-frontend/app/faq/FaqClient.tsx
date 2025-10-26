"use client";

import Script from "next/script";
import Link from "next/link";
import { useI18n } from "../lib/i18n";
import AdSlot from "../components/AdSlot";

type FaqItem = { q: string; a: string };

export default function FaqClient() {
  const { t, get } = useI18n();

  // tiny inline fallback helper
  const tf = (k: string, fb: string) => {
    const v = t(k);
    return v === k ? fb : v;
  };

  const heading       = tf("faqPage.heading", "Frequently Asked Questions");
  const introPrefix   = tf("faqPage.introPrefix", "New to GoAstrion? Start on the");
  const introMiddle   = tf("faqPage.introMiddle", "page, then explore the");
  const introAnd      = tf("faqPage.introAnd", "and");
  const linkCreate    = tf("faqPage.linkCreate", "Create");
  const linkLifeWheel = tf("faqPage.linkLifeWheel", "Life Wheel");
  const linkSkills    = tf("faqPage.linkSkills", "Skills");

  // ---- Featured (from i18n with English defaults) ----
  const featuredFallback: FaqItem[] = [
    {
      q: "What is ShubhDin (auspicious day)?",
      a: "ShubhDin is a supportive time window suggested from your birth details and current Saturn/Moon context. Use it for focused study, interviews, launches, travel planning, or simply a calmer day to move important tasks forward.",
    },
    {
      q: "How does GoAstrion plan for Next 2 yrs?",
      a: "We compute your chart in UTC or IST, then scan for lighter lunar context and clean aspects within your chosen horizon. We avoid heavy station days and highlight windows where friction is lower so small efforts compound.",
    },
    {
      q: "What is Saturn · Sade Sati and how should I use it?",
      a: "We treat Sade Sati as structure, not scare: a period to prune distractions and build routines. Expect more review/discipline days. Pair ShubhDin windows with tiny repeatable actions—sleep, blocks of study, budgeting—to exit stronger.",
    },
    {
      q: "What are ‘station’ or ‘retro overlap’ cautions in the app?",
      a: "Station days = momentum unstable; avoid fresh, high-risk commitments and double-check paperwork. Retro overlaps = great for reviews, fixes, and renegotiations—just pad timelines for rework.",
    },
  ];
  const rawFeatured = get("faqPage.featured");
  const featured: FaqItem[] = Array.isArray(rawFeatured)
    ? (rawFeatured as FaqItem[])
    : featuredFallback;

  // ---- Remaining items from i18n (optional) ----
  const rawItems = get("faqPage.items");
  const i18nItems: FaqItem[] = Array.isArray(rawItems) ? (rawItems as FaqItem[]) : [];

  // ---- JSON-LD (featured + i18n) ----
  const allItems: FaqItem[] = [...featured, ...i18nItems];
  const FAQ_LD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  } as const;

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-white">{heading}</h1>

      <p className="mt-3 text-slate-300">
        {introPrefix}{" "}
        <Link href="/create" className="underline decoration-indigo-400 hover:opacity-80">
          {linkCreate}
        </Link>{" "}
        {introMiddle}{" "}
        <Link href="/domains" className="underline decoration-indigo-400 hover:opacity-80">
          {linkLifeWheel}
        </Link>{" "}
        {introAnd}{" "}
        <Link href="/skills" className="underline decoration-indigo-400 hover:opacity-80">
          {linkSkills}
        </Link>
        .
      </p>

      {/* Featured block */}
      <div className="mt-8 space-y-4 text-slate-200/90">
        {featured.map((it, idx) => (
          <details key={`feat-${idx}`} className="rounded-xl bg-white/5 p-4">
            <summary className="cursor-pointer font-medium">{it.q}</summary>
            <p className="mt-2">{it.a}</p>
          </details>
        ))}
      </div>

      {/* Ad: mid placement */}
      <div className="mt-6">
        <AdSlot slot="9938358013" minHeight={300} />
      </div>

      {/* Remaining i18n FAQs */}
      {i18nItems.length > 0 && (
        <div className="mt-8 space-y-4 text-slate-200/90">
          {i18nItems.map((it, idx) => (
            <details key={`i18n-${idx}`} className="rounded-xl bg-white/5 p-4">
              <summary className="cursor-pointer font-medium">{it.q}</summary>
              <p className="mt-2">{it.a}</p>
            </details>
          ))}
        </div>
      )}

      {/* Ad: end-of-page */}
      <div className="mt-8">
        <AdSlot slot="1952056782" minHeight={280} />
      </div>

      {/* JSON-LD */}
      <Script
        id="ld-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />
    </main>
  );
}
