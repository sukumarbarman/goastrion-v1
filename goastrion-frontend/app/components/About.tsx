"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "../lib/i18n"; // adjust to "../../lib/i18n" if your folder differs

export default function AboutPage() {
  const { t } = useI18n();
  const tf = (k: string, fb: string) => {
    const v = t(k);
    return v === k ? fb : v;
  };

  return (
    <main className="min-h-[70vh]">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            {tf("about.title", "About GoAstrion")}
          </h1>
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
              className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-medium hover:bg-cyan-400"
            >
              {tf("about.cta.start", "Get Started")}
            </Link>
            <Link
              href="/create"
              className="px-4 py-2 rounded-lg border border-white/15 text-slate-200 hover:bg-white/5"
            >
              {tf("about.cta.generate", "Generate My Chart")}
            </Link>
          </div>
        </div>

        {/* Image: girl using GoAstrion */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <Image
            src="/images/about.png"
            alt={tf("about.imageAlt", "A student exploring career options on GoAstrion")}
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Short mission */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            {tf("about.mission.title", "Our Mission")}
          </h2>
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
