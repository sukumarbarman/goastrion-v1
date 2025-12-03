// goastrion-frontend/app/components/ShubhDinTeaser.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import Container from "./Container";
import { useI18n } from "../lib/i18n";

export default function ShubhDinTeaser() {
  const { t } = useI18n();
  const tf = (k: string, fb: string) => (t(k) === k ? fb : t(k));

  return (
    <section className="mt-12" aria-labelledby="shubhdin-title">
      <Container>
        <div
          className="
            relative grid md:grid-cols-2 gap-10 items-center
            rounded-2xl border border-white/10
            bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-transparent
            p-6 md:p-8
            shadow-[0_0_40px_-10px_rgba(0,200,255,0.15)]
          "
        >
          {/* Glow edge */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none border border-cyan-400/10" />

          {/* TEXT SECTION */}
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 border border-cyan-400/40 px-3 py-1 text-cyan-100 text-xs font-medium shadow-sm">
              {tf("home.shubhdin.badge", "Next 2 yrs")}
            </div>

            <h2
              id="shubhdin-title"
              className="mt-3 text-2xl md:text-3xl font-semibold text-white leading-snug"
            >
              {tf("home.shubhdin.title", "Pick the Right Month, Not Just a Date")}
            </h2>

            <p className="mt-3 text-slate-300 leading-relaxed">
              {tf(
                "home.shubhdin.sub",
                "Data-backed Vedic windows for commitments—marriage, job change, home purchase."
              )}
            </p>

            {/* Bullet Points */}
            <ul className="mt-4 text-sm text-slate-300 space-y-2">
              {[
                tf(
                  "home.shubhdin.pt1",
                  "Smart windows from your birth details (IST/UTC handled)"
                ),
                tf(
                  "home.shubhdin.pt2",
                  "Saturn/Moon context with gentle, actionable timing notes"
                ),
                tf(
                  "home.shubhdin.pt3",
                  "Extend with Vimshottari MD/AD for trend alignment"
                ),
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(0,200,255,0.7)]"></span>
                  {point}
                </li>
              ))}
            </ul>

            {/* Buttons */}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/create"
                prefetch
                aria-label={tf("home.shubhdin.cta", "Plan next 2 yrs")}
                className="
                  inline-flex items-center gap-2 rounded-full
                  border border-cyan-400/60
                  bg-cyan-500/15
                  px-4 py-2 text-sm font-medium text-cyan-100
                  hover:bg-cyan-500/25
                  shadow-[0_0_20px_-8px_rgba(0,200,255,0.5)]
                  focus:outline-none focus:ring-2 focus:ring-cyan-400/60
                  transition-all
                "
              >
                ✨ {tf("home.shubhdin.cta", "Plan next 2 yrs")}
              </Link>

              <Link
                href="/shubhdin"
                className="
                  inline-flex items-center gap-2 rounded-full
                  border border-white/10 px-4 py-2 text-sm
                  text-slate-200
                  hover:border-white/20
                  transition
                "
                aria-label={tf("home.shubhdin.learn", "Learn more")}
              >
                {tf("home.shubhdin.learn", "Learn more")}
              </Link>

              <Link
                href="/faq"
                className="
                  inline-flex items-center gap-2 rounded-full
                  border border-white/10 px-4 py-2 text-sm
                  text-slate-200 hover:border-white/20
                "
                aria-label={tf("home.shubhdin.how", "How it works")}
              >
                {tf("home.shubhdin.how", "How it works")}
              </Link>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              {tf(
                "home.shubhdin.tz",
                "India: choose IST (UTC+05:30). Outside India: convert your birth time to UTC and choose UTC."
              )}
            </p>
          </div>

          {/* IMAGE SECTION */}
          <div className="order-first md:order-none relative">
            <div
              className="
                relative aspect-[4/3] w-full overflow-hidden
                rounded-2xl border border-white/10 bg-black/20
                shadow-[0_0_30px_-12px_rgba(255,255,255,0.15)]
              "
            >
            <Image
              src="/images/goodday.png"
              alt={tf(
                "home.shubhdin.alt",
                "Smiling young woman checking a calendar on her phone, hopeful about a good day"
              )}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />

            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
