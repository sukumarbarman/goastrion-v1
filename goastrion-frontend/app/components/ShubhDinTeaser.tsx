// app/components/ShubhDinTeaser.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import Container from "./Container";
import { useI18n } from "../lib/i18n";

export default function ShubhDinTeaser() {
  const { t } = useI18n();
  const tf = (k: string, fb: string) => (t(k) === k ? fb : t(k));

  return (
    <section className="mt-8">
      <Container>
        <div className="grid md:grid-cols-2 gap-8 items-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-transparent p-6">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 border border-cyan-400/40 px-3 py-1 text-cyan-100 text-xs font-medium">
              {tf("home.shubhdin.badge", "ShubhDin · Good Day")}
            </div>

            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-white">
              {tf("home.shubhdin.title", "Find your Shubh Din — feel the timing click")}
            </h2>

            <p className="mt-2 text-slate-300">
              {tf(
                "home.shubhdin.sub",
                "We read your chart and Saturn/Moon context to suggest windows that feel lighter and supportive — for study, interviews, launches, travel, or a calmer day."
              )}
            </p>

            <ul className="mt-3 text-sm text-slate-300 space-y-1">
              <li>• {tf("home.shubhdin.pt1", "Smart windows from your birth details (IST/UTC handled)")}</li>
              <li>• {tf("home.shubhdin.pt2", "Gentle timing notes — action over anxiety")}</li>
              <li>• {tf("home.shubhdin.pt3", "Optional MD/AD context for longer trends")}</li>
            </ul>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/60 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
              >
                ✨ {tf("home.shubhdin.cta", "Check my ShubhDin")}
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-white/20"
              >
                {tf("home.shubhdin.how", "How it works")}
              </Link>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              {tf(
                "home.shubhdin.tz",
                "India: choose IST (UTC+05:30). Outside India: convert your birth time to UTC and choose UTC."
              )}
            </p>
          </div>

          {/* Image */}
          <div className="order-first md:order-none">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <Image
                src="/images/goodday.png"
                alt={tf(
                  "home.shubhdin.alt",
                  "Smiling young woman checking a calendar on her phone, hopeful about a good day"
                )}
                fill
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
