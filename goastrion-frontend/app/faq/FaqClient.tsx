// app/faq/FaqClient.tsx
"use client";

import Script from "next/script";
import Link from "next/link";
import { useI18n } from "../lib/i18n";

type FaqItem = { q: string; a: string };

export default function FaqClient() {
  const { t, get } = useI18n();

  const heading      = t("faqPage.heading");
  const introPrefix  = t("faqPage.introPrefix");
  const introMiddle  = t("faqPage.introMiddle");
  const introAnd     = t("faqPage.introAnd");
  const linkCreate   = t("faqPage.linkCreate");
  const linkLifeWheel= t("faqPage.linkLifeWheel");
  const linkSkills   = t("faqPage.linkSkills");

  const rawItems = get("faqPage.items");
  const items: FaqItem[] = Array.isArray(rawItems) ? (rawItems as FaqItem[]) : [];

  const FAQ_LD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  } as const;

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold">{heading}</h1>

      <p className="mt-3 opacity-90">
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

      <div className="mt-8 space-y-4 text-slate-200/90">
        {items.map((it, idx) => (
          <details key={idx} className="rounded-xl bg-white/5 p-4">
            <summary className="cursor-pointer font-medium">{it.q}</summary>
            <p className="mt-2">{it.a}</p>
          </details>
        ))}
      </div>

      <Script
        id="ld-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />
    </main>
  );
}
