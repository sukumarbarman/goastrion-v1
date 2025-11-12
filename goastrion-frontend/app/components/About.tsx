"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "../lib/i18n";
import AdSlot from "./AdSlot";
import { ABOUT_MID_SLOT_ID, ABOUT_END_SLOT_ID } from "../constants/ads";

export default function AboutPage() {
  const { t } = useI18n();
  const tf = (k: string, fb = "") => (t(k) === k ? fb : t(k));

  return (
    <main className="min-h-screen bg-[#0B1020] text-slate-200">
      {/* ------------------ HERO ------------------ */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <Image
          src="/images/about.png"
          alt={tf("about.imageAlt", "Student exploring astrology on GoAstrion")}
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2 text-[10px] md:text-xs mb-2">
              <span className="rounded-full bg-cyan-500/20 text-cyan-100 px-3 py-1 font-medium">
                {tf("about.badge.shubhdin", "ShubhDin · Good Day")}
              </span>
              <span className="rounded-full bg-indigo-500/20 text-indigo-100 px-3 py-1 font-medium">
                {tf("about.badge.saturn", "Saturn · Sade Sati")}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow">
              {tf("about.title", "About GoAstrion")}
            </h1>
            <p className="mt-4 max-w-2xl text-slate-300 text-sm md:text-base leading-relaxed">
              {tf(
                "about.tagline.spotlight",
                "GoAstrion blends the timeless accuracy of Vedic astrology with modern technology to help you plan smarter — for your studies, career, finances, and peace of mind."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------ MISSION & STORY ------------------ */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="rounded-2xl bg-black/30 border border-white/10 p-6 md:p-10 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            {tf("about.mission.title", "Our Story & Mission")}
          </h2>

          <p className="text-slate-300 leading-relaxed max-w-4xl">
            {tf("about.mission.body")}
          </p>

          <p className="mt-4 text-slate-300 leading-relaxed max-w-4xl">
            {tf("about.mission.extra")}
          </p>

          <p className="mt-4 text-slate-300 leading-relaxed max-w-4xl">
            {tf("about.mission.body2")}
          </p>

          <p className="mt-4 text-slate-400 text-sm max-w-3xl">
            {tf("about.mission.note")}
          </p>
        </div>

        {/* Mid-page Ad */}
        <div className="mt-8">
          <AdSlot slot={ABOUT_MID_SLOT_ID} minHeight={300} />
        </div>
      </section>

      {/* ------------------ APPROACH SECTION ------------------ */}
      <section className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
            {tf("about.subtitle", "How We Blend Astrology & Technology")}
          </h2>
          <p className="text-slate-300 leading-relaxed">
            {tf("about.tagline.main")}
          </p>

          <ul className="mt-6 space-y-2 text-slate-300 text-sm">
            <li>• {tf("about.points.career")}</li>
            <li>• {tf("about.points.finance")}</li>
            <li>• {tf("about.points.marriage")}</li>
            <li>• {tf("about.points.health")}</li>
            <li>• {tf("about.points.education")}</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/create"
              className="px-4 py-2 rounded-full bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition-colors"
            >
              {tf("about.cta.generate", "Generate My Chart")}
            </Link>
            <Link
              href="/guides"
              className="px-4 py-2 rounded-full border border-white/15 text-slate-200 hover:bg-white/5 transition-colors"
            >
              {tf("about.mission.cta", "Explore Guides")}
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl">
          <Image
            src="/images/student.png"
            alt={tf("about.imageAlt", "A student exploring career options on GoAstrion")}
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* ------------------ WHY SECTION ------------------ */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-semibold text-white text-center mb-8">
          {tf("about.why.title", "Why GoAstrion Matters")}
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-transparent p-5 border border-white/10">
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">
              {tf("about.list.why.title")}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {tf("about.list.why.body")}
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-transparent p-5 border border-white/10">
            <h3 className="text-lg font-semibold text-indigo-300 mb-2">
              {tf("about.list.saturn.title")}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {tf("about.list.saturn.body")}
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-rose-500/10 to-transparent p-5 border border-white/10">
            <h3 className="text-lg font-semibold text-rose-300 mb-2">
              {tf("about.list.practical.title")}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {tf("about.list.practical.body")}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------ CTA ------------------ */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="rounded-2xl bg-black/25 border border-white/10 p-8 md:p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
            {tf("about.closing.title", "Empower Your Timing with GoAstrion")}
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6">
            {tf("about.closing.body")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/create"
              className="px-5 py-2 rounded-full bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition-colors"
            >
              {tf("about.closing.ctaGenerate")}
            </Link>
            <Link
              href="/guides"
              className="px-5 py-2 rounded-full border border-white/15 text-slate-200 hover:bg-white/5 transition-colors"
            >
              {tf("about.closing.ctaGuides")}
            </Link>
          </div>
        </div>

        {/* Bottom Ad */}
        <div className="mt-8">
          <AdSlot slot={ABOUT_END_SLOT_ID} minHeight={280} />
        </div>
      </section>
    </main>
  );
}
