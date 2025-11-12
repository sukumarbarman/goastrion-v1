//goastrion-frontend/app/guides/GuidesClient.tsx
"use client";

import Link from "next/link";
import { useI18n } from "../lib/i18n";
import AdSlot from "../components/AdSlot";
import {GUIDES_TOP_SLOT_ID, GUIDES_MID_SLOT_ID, GUIDES_END_SLOT_ID } from "../constants/ads";


export default function GuidesClient() {
  const { t, tOr } = useI18n(); // ✅ use both t and tOr

  return (
    <main className="min-h-screen">
      {/* ------------------ HERO ------------------ */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-white">
          {tOr("guides.title", "Guides · GoAstrion")}
        </h1>
        <p className="mt-4 text-slate-300 max-w-3xl leading-relaxed">
          {tOr(
            "guides.hero.blurb",
            "Short, practical guides to help you use GoAstrion for better timing in your career, finance, marriage, health, and education — all through the lens of Vedic astrology and modern decision tools."
          )}
        </p>
        <div className="mt-6">
          <Link
            href="/create"
            className="inline-block px-5 py-2 rounded-full bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition"
          >
            {tOr("guides.hero.ctaGenerate", "✨ Generate My Chart")}
          </Link>
        </div>
      </section>
       {/* ------------------ TOP AD ------------------ */}
        <section className="max-w-6xl mx-auto px-4">
          <AdSlot slot={GUIDES_TOP_SLOT_ID} minHeight={250} />
        </section>
       {/* ------------------ HOW IT WORKS ------------------ */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            {tOr("guides.how.title", "How GoAstrion Works")}
          </h2>
          <ol className="mt-5 grid md:grid-cols-3 gap-4 text-slate-300">
            <li className="rounded-xl border border-white/10 p-4 bg-black/10">
              <div className="text-cyan-300 font-semibold">
                {tOr("guides.how.step1.title", "1. Enter Birth Details")}
              </div>
              <p className="mt-1 text-sm leading-relaxed">
                {tOr(
                  "guides.how.step1.desc",
                  "Your date, time, and location let us compute your North-Indian style chart using precise sidereal (Lahiri) calculations."
                )}
              </p>
            </li>
            <li className="rounded-xl border border-white/10 p-4 bg-black/10">
              <div className="text-cyan-300 font-semibold">
                {tOr("guides.how.step2.title", "2. Get Insights")}
              </div>
              <p className="mt-1 text-sm leading-relaxed">
                {tOr(
                  "guides.how.step2.desc",
                  "We highlight key houses, planets, and transits that define your focus areas — whether it’s learning, earning, or relationships."
                )}
              </p>
            </li>
            <li className="rounded-xl border border-white/10 p-4 bg-black/10">
              <div className="text-cyan-300 font-semibold">
                {tOr("guides.how.step3.title", "3. Act with Clarity")}
              </div>
              <p className="mt-1 text-sm leading-relaxed">
                {tOr(
                  "guides.how.step3.desc",
                  "You’ll get simple, actionable steps aligned to your strongest planetary periods — without needing prior astrology knowledge."
                )}
              </p>
            </li>
          </ol>
          <p className="mt-4 text-sm text-slate-400 italic">
            {tOr(
              "guides.how.tip",
              "Think of it like your personal timing dashboard — clear, calm, and customized."
            )}
          </p>
        </div>
      </section>

      {/* ------------------ MID AD ------------------ */}
      <section className="max-w-6xl mx-auto px-4">
        <AdSlot slot={GUIDES_MID_SLOT_ID} minHeight={300} />
      </section>

      {/* ------------------ TOPIC CARDS ------------------ */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold text-white">
          {tOr("guides.topics.title", "Explore Topics")}
        </h2>
        <p className="mt-2 text-slate-300 max-w-3xl">
          {tOr(
            "guides.topics.intro",
            "Each guide below takes you step-by-step through how to use your birth chart for real decisions. These are designed to teach you the 'why' behind every feature in GoAstrion."
          )}
        </p>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <GuideCard
            title={tOr("guides.topics.cards.sadeSati.title", "Sade Sati · 7.5-Year Saturn Cycle")}
            blurb={tOr(
              "guides.topics.cards.sadeSati.blurb",
              "Understand Saturn’s influence on discipline, patience, and purpose. Learn how your Sade Sati phases shape your growth years."
            )}
            href="/guides/sade-sati"
          />
          <GuideCard
            title={tOr("guides.topics.cards.dasha.title", "Vimshottari Dasha")}
            blurb={tOr(
              "guides.topics.cards.dasha.blurb",
              "Explore planetary time periods that define life chapters. Discover how to align decisions with your current Dasha."
            )}
            href="/guides/dasha"
          />
          <GuideCard
            title={tOr("guides.topics.cards.lifeWheel.title", "Life Wheel")}
            blurb={tOr(
              "guides.topics.cards.lifeWheel.blurb",
              "Visualize your life focus areas — career, health, family — based on real-time planetary cycles."
            )}
            href="/guides/life-wheel"
          />
          <GuideCard
            title={tOr("guides.topics.cards.career.title", "Career Astrology")}
            blurb={tOr(
              "guides.topics.cards.career.blurb",
              "See how your chart reveals natural talents, best roles, and skill growth windows for success."
            )}
            href="/guides/career-astrology"
          />
          <GuideCard
            title={tOr("guides.topics.cards.shubhdin.title", "Auspicious Dates · ShubhDin")}
            blurb={tOr(
              "guides.topics.cards.shubhdin.blurb",
              "Plan important launches, interviews, or investments using your personal ShubhDin timeline."
            )}
            href="/guides/shubhdin"
          />
          <GuideCard
            title={tOr("guides.topics.cards.balance.title", "Balancing Modern Life with Astrology")}
            blurb={tOr(
              "guides.topics.cards.balance.blurb",
              "Learn to sync productivity, rest, and health with planetary rhythms for a calmer routine."
            )}
            href="/guides/balance"
          />
        </div>
      </section>

      {/* ------------------ FAQ ------------------ */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold text-white mb-6">
          {tOr("guides.qa.title", "Common Questions")}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <QA q={t("guides.qa.q1.q")} a={t("guides.qa.q1.a")} />
          <QA q={t("guides.qa.q2.q")} a={t("guides.qa.q2.a")} />
          <QA q={t("guides.qa.q3.q")} a={t("guides.qa.q3.a")} />
          <QA q={t("guides.qa.q4.q")} a={t("guides.qa.q4.a")} />
        </div>
      </section>

      {/* ------------------ END AD ------------------ */}
      <section className="max-w-6xl mx-auto px-4">
        <AdSlot slot={GUIDES_END_SLOT_ID} minHeight={280} />
      </section>

      {/* ------------------ CTA ------------------ */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 md:p-8 text-center">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {tOr("guides.cta.title", "Ready to Discover Your Chart?")}
          </h3>
          <p className="mt-2 text-slate-200 max-w-2xl mx-auto">
            {tOr(
              "guides.cta.blurb",
              "Generate your personalized chart and explore timing insights for the next two years — designed for clarity, not confusion."
            )}
          </p>
          <Link
            href="/create"
            className="mt-5 inline-block px-5 py-2 rounded-full bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition"
          >
            {tOr("guides.cta.btn", "✨ Generate My Chart")}
          </Link>
        </div>
      </section>
    </main>
  );
}

// -----------------------------------------
// Components
// -----------------------------------------

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
      <p className="mt-2 text-sm text-slate-300 leading-relaxed">{blurb}</p>
      <div className="mt-3 text-xs text-cyan-300">Open guide →</div>
    </Link>
  );
}

function QA({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 p-5">
      <div className="text-slate-100 font-medium">{q}</div>
      <p className="mt-1 text-sm text-slate-300 leading-relaxed">{a}</p>
    </div>
  );
}
