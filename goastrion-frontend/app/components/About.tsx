// app/components/About.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "../lib/i18n"; // adjust if your path differs

export default function AboutPage() {
  const { t } = useI18n();
  const tf = (k: string, fb: string) => (t(k) === k ? fb : t(k));

  return (
    <main className="min-h-[70vh]">
      {/* ── Top Hero Image with overlay title/badges ───────────────────── */}
      <section className="relative h-60 md:h-80 w-full overflow-hidden border-b border-white/10">
        <Image
          src="/images/about.png" // swap to /images/hero-girl-shubhdin.jpg if you prefer
          alt={tf("about.imageAlt", "A student exploring career options on GoAstrion")}
          fill
          className="object-cover"
          priority
        />
        {/* gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-black/10 to-transparent" />

        {/* overlay content */}
        <div className="absolute inset-x-0 bottom-4 md:bottom-6 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs">
              <span className="rounded-full bg-cyan-500/20 text-cyan-100 px-3 py-1 font-medium">
                {tf("about.badge.shubhdin", "ShubhDin · Good Day")}
              </span>
              <span className="rounded-full bg-indigo-500/20 text-indigo-100 px-3 py-1 font-medium">
                {tf("about.badge.saturn", "Saturn · Sade Sati")}
              </span>
            </div>
            <h1 className="mt-2 md:mt-3 text-2xl md:text-4xl font-semibold text-white drop-shadow">
              {tf("about.title", "About GoAstrion")}
            </h1>
          </div>
        </div>
      </section>

      {/* ── Spotlight (concise value + CTAs) ───────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pt-8">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-transparent p-5 md:p-6">
          <p className="text-slate-300 max-w-3xl">
            {tf(
              "about.tagline.spotlight",
              "Find calmer, more supportive days—then act. GoAstrion reads your chart and Saturn/Moon context to surface ShubhDin windows for studies, interviews, launches, or simply a more focused day."
            )}
          </p>

          <ul className="mt-4 grid md:grid-cols-3 gap-3 text-sm text-slate-300">
            <li className="rounded-lg bg-black/20 border border-white/10 p-3">
              <b>Why explore now?</b>
              <div className="mt-1 text-slate-400">
                Know your next 1–2 good windows and use them—no guesswork, no fear.
              </div>
            </li>
            <li className="rounded-lg bg-black/20 border border-white/10 p-3">
              <b>Saturn · Sade Sati</b>
              <div className="mt-1 text-slate-400">
                We frame it as structure, not scare: small, repeatable habits that compound.
              </div>
            </li>
            <li className="rounded-lg bg-black/20 border border-white/10 p-3">
              <b>Made practical</b>
              <div className="mt-1 text-slate-400">
                Clear language, Life Wheel focus, optional MD/AD timing—action over anxiety.
              </div>
            </li>
          </ul>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/create"
              className="px-4 py-2 rounded-full bg-cyan-500 text-black font-medium hover:bg-cyan-400"
            >
              {tf("about.cta.checkShubhdin", "✨ Check my ShubhDin")}
            </Link>
            <Link
              href="/faq"
              className="px-4 py-2 rounded-full border border-white/15 text-slate-200 hover:bg-white/5"
            >
              {tf("about.cta.howItWorks", "How it works")}
            </Link>
            <p className="text-[11px] text-slate-400 ml-0 md:ml-2">
              {tf(
                "about.timezone.note",
                "India: choose IST (UTC+05:30). Outside India: convert your birth time to UTC and choose UTC."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ── Main body (tightened copy) ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14 grid md:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {tf("about.subtitle", "Clarity for students and professionals—without the jargon")}
          </h2>

          <p className="mt-3 text-slate-300">
            {tf(
              "about.tagline",
              "GoAstrion helps students and professionals make smarter life choices with clear, practical guidance—powered by Vedic astrology."
            )}
          </p>

          <ul className="mt-6 space-y-2 text-slate-300">
            <li>• {tf("about.points.career", "Career: find your strengths & learning path")}</li>
            <li>• {tf("about.points.finance", "Finance: plan habits and money decisions")}</li>
            <li>• {tf("about.points.marriage", "Marriage: understand compatibility patterns")}</li>
            <li>• {tf("about.points.health", "Health: build sustainable daily routines")}</li>
            <li>• {tf("about.points.education", "Education: pick subjects & skills confidently")}</li>
          </ul>

          <div className="mt-6 flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-full bg-cyan-500 text-black font-medium hover:bg-cyan-400"
            >
              {tf("about.cta.start", "Get Started")}
            </Link>
            <Link
              href="/create"
              className="px-4 py-2 rounded-full border border-white/15 text-slate-200 hover:bg-white/5"
            >
              {tf("about.cta.generate", "Generate My Chart")}
            </Link>
          </div>
        </div>

        {/* optional supporting image block (kept for layout balance; can remove) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <Image
            src="/images/student.png"
            alt={tf("about.imageAlt", "A student exploring career options on GoAstrion")}
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {tf("about.mission.title", "Our Mission")}
          </h3>
          <p className="mt-3 text-slate-300">
            {tf(
              "about.mission.body",
              "We translate complex astrological signals into simple, actionable steps—so you can choose subjects, careers, and habits with clarity, not confusion."
            )}
          </p>
        </div>
      </section>
    </main>
  );
}
