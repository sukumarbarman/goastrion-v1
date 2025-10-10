// app/faq/FaqClient.tsx
"use client";

import Script from "next/script";
import Link from "next/link";
import { useI18n } from "../lib/i18n";
import AdSlot from "../components/AdSlot";

type FaqItem = { q: string; a: string };

export default function FaqClient() {
  const { t, get } = useI18n();

  const heading       = t("faqPage.heading");
  const introPrefix   = t("faqPage.introPrefix");
  const introMiddle   = t("faqPage.introMiddle");
  const introAnd      = t("faqPage.introAnd");
  const linkCreate    = t("faqPage.linkCreate");
  const linkLifeWheel = t("faqPage.linkLifeWheel");
  const linkSkills    = t("faqPage.linkSkills");

  // Featured FAQs (ShubhDin + Saturn) – shown first
  const featured: FaqItem[] = [
    {
      q: "What is ShubhDin (auspicious day)?",
      a: "ShubhDin is a supportive time window suggested from your birth details and current Saturn/Moon context. Use it for focused study, interviews, launches, travel planning, or simply a calmer day to move important tasks forward.",
    },
    {
      q: "How does GoAstrion pick ShubhDin windows?",
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

  // i18n-driven FAQ items (kept after the featured ones)
  const rawItems = get("faqPage.items");
  const i18nItems: FaqItem[] = Array.isArray(rawItems) ? (rawItems as FaqItem[]) : [];

  // All items (for JSON-LD)
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

      {/* Featured (ShubhDin + Saturn) */}
      <div className="mt-8 space-y-4 text-slate-200/90">
        {featured.map((it, idx) => (
          <details key={`feat-${idx}`} className="rounded-xl bg-white/5 p-4">
            <summary className="cursor-pointer font-medium">{it.q}</summary>
            <p className="mt-2">{it.a}</p>
          </details>
        ))}
      </div>

      {/* Ad: mid placement (after featured block) */}
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

      {/* Ad: end-of-page placement */}
      <div className="mt-8">

        <AdSlot slot="1952056782" minHeight={280} />
      </div>

      {/* JSON-LD for all questions */}
      <Script
        id="ld-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />
    </main>
  );
}
