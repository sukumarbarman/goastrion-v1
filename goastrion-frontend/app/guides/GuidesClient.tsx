// app/guides/GuidesClient.tsx
"use client";

import Link from "next/link";
import { useI18n } from "../lib/i18n";
import AdSlot from "../components/AdSlot"; // ⬅️ NEW

export default function GuidesClient() {
  const { t } = useI18n();

  return (
    <main className="min-h-[70vh]">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <h1 className="text-3xl md:text-4xl font-semibold text-white">
          {t("guides.title")}
        </h1>
        <p className="mt-3 text-slate-300 max-w-2xl">
          {t("guides.hero.blurb")}
        </p>
        <div className="mt-6">
          <Link
            href="/create"
            className="inline-block px-4 py-2 rounded-lg bg-cyan-500 text-black font-medium hover:bg-cyan-400"
          >
            {t("guides.hero.ctaGenerate")}
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            {t("guides.how.title")}
          </h2>
          <ol className="mt-4 grid md:grid-cols-3 gap-4 text-slate-300">
            <li className="rounded-xl border border-white/10 p-4 bg-black/10">
              <div className="text-cyan-300 font-semibold">
                {t("guides.how.step1.title")}
              </div>
              <p className="mt-1 text-sm">{t("guides.how.step1.desc")}</p>
            </li>
            <li className="rounded-xl border border-white/10 p-4 bg-black/10">
              <div className="text-cyan-300 font-semibold">
                {t("guides.how.step2.title")}
              </div>
              <p className="mt-1 text-sm">{t("guides.how.step2.desc")}</p>
            </li>
            <li className="rounded-xl border border-white/10 p-4 bg-black/10">
              <div className="text-cyan-300 font-semibold">
                {t("guides.how.step3.title")}
              </div>
              <p className="mt-1 text-sm">{t("guides.how.step3.desc")}</p>
            </li>
          </ol>
        </div>
      </section>

      {/* Topic cards */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <h3 className="text-lg md:text-xl font-semibold text-white">
          {t("guides.topics.title")}
        </h3>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GuideCard
            title={t("guides.topics.cards.career.title")}
            blurb={t("guides.topics.cards.career.blurb")}
            href="/create"
          />
          <GuideCard
            title={t("guides.topics.cards.finance.title")}
            blurb={t("guides.topics.cards.finance.blurb")}
            href="/create"
          />
          <GuideCard
            title={t("guides.topics.cards.marriage.title")}
            blurb={t("guides.topics.cards.marriage.blurb")}
            href="/create"
          />
          <GuideCard
            title={t("guides.topics.cards.health.title")}
            blurb={t("guides.topics.cards.health.blurb")}
            href="/create"
          />
        </div>

        {/* Ad: mid placement (after topics) */}
        <div className="mt-6">
          {/* Replace GUIDES_MID_SLOT_ID with your numeric slot id */}
          <AdSlot slot="2330813816" minHeight={300} />
        </div>
      </section>

      {/* Quick Q&A */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-4">
          <QA q={t("guides.qa.q1.q")} a={t("guides.qa.q1.a")} />
          <QA q={t("guides.qa.q2.q")} a={t("guides.qa.q2.a")} />
          <QA q={t("guides.qa.q3.q")} a={t("guides.qa.q3.a")} />
          <QA q={t("guides.qa.q4.q")} a={t("guides.qa.q4.a")} />
        </div>
      </section>

      {/* Ad: end-of-page (above CTA) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="mt-2">
          {/* Replace GUIDES_END_SLOT_ID with your numeric slot id */}
          <AdSlot slot="9391563109" minHeight={280} />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 md:p-8 text-center">
          <h4 className="text-xl md:text-2xl font-semibold text-white">
            {t("guides.cta.title")}
          </h4>
          <p className="mt-2 text-slate-200">{t("guides.cta.blurb")}</p>
          <Link
            href="/create"
            className="mt-4 inline-block px-4 py-2 rounded-lg bg-cyan-500 text-black font-medium hover:bg-cyan-400"
          >
            {t("guides.cta.btn")}
          </Link>
        </div>
      </section>
    </main>
  );
}

function GuideCard({
  title,
  blurb,
  href,
}: {
  title: string;
  blurb: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-white/10 bg-black/20 p-5 hover:border-cyan-500/40 transition"
    >
      <div className="text-white font-semibold">{title}</div>
      <p className="mt-2 text-sm text-slate-300">{blurb}</p>
      <div className="mt-3 text-xs text-cyan-300">Open guide →</div>
    </Link>
  );
}

function QA({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 p-5">
      <div className="text-slate-100 font-medium">{q}</div>
      <p className="mt-1 text-sm text-slate-300">{a}</p>
    </div>
  );
}
