// app/profile/_components/DailyQuickView.tsx
"use client";

import Link from "next/link";
import { useMemo, type SVGProps } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/app/lib/i18n";
import { deriveDailyPayloadFromActive } from "@/app/lib/chartStore";
import { deriveDailyPayloadFromCreate } from "@/app/lib/birthState";
import { log } from "@/app/lib/history";

/* ---------- Minimal inline icons (no extra dependency) ---------- */
function ClickIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 12l6 6m-6-6v8m0-8l-2.5 2.5M7 3l1.5 3M3 7l3 1.5M17 3l-1.5 3M21 7l-3 1.5" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9.5 10.5L12 12" />
    </svg>
  );
}

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

export default function DailyQuickView() {
  const { tOr } = useI18n();

  // Decide whether to show the CTA card or the “add birth” prompt.
  const birth = useMemo(
    () => deriveDailyPayloadFromActive() || deriveDailyPayloadFromCreate(),
    []
  );

  if (!birth) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-5">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-cyan-500/10 via-emerald-400/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">
              {tOr("profile.daily.title", "Know Your Day")}
            </span>
            <span className="text-[10px] uppercase tracking-wider rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-slate-300">
              {tOr("common.new", "New")}
            </span>
          </div>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            {tOr("profile.daily.empty", "Add birth details to see your Daily.")}
          </p>
          <div className="mt-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-slate-950 font-semibold hover:bg-cyan-400"
            >
              {tOr("profile.account.actions.editBirth", "Add birth details")}
              <span aria-hidden>↗</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // CTA-only card (no preview data here)
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-5">
      {/* Soft gradient glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(600px_200px_at_10%_-10%,rgba(34,211,238,0.18),transparent),radial-gradient(500px_160px_at_90%_120%,rgba(16,185,129,0.14),transparent)]" />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">{"Know Your Day"}</span>
          <span className="text-[10px] uppercase tracking-wider rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-slate-300">
            {tOr("common.personalized", "Personalized")}
          </span>
        </div>

        {/* Punchy copy */}
        <p className="mt-2 text-slate-200 text-sm leading-relaxed">
          <span aria-hidden>✨</span>{" "}
          <span className="opacity-90">
            Unlock your <span className="text-white font-medium">best hours</span>, the
            <span className="text-white font-medium"> go-bold moments</span>, and
            <span className="text-white font-medium"> caution windows</span> for today.
            Tap below for your personal timing map.
          </span>
        </p>

        {/* Micro benefits (chips) */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-emerald-500/15 border border-emerald-400/40 px-3 py-1">
            ✅ {tOr("daily.best", "Best hours")}
          </span>
          <span className="rounded-full bg-cyan-500/15 border border-cyan-400/40 px-3 py-1">
            ⚡ {tOr("daily.goBold", "Go-bold moments")}
          </span>
          <span className="rounded-full bg-rose-500/15 border border-rose-400/40 px-3 py-1">
            ⚠️ {tOr("daily.caution", "Caution windows")}
          </span>
        </div>

        {/* CTAs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {/* Primary: animated click cue */}
          <Link
            href="/daily"
            onClick={() =>
              log({
                type: "daily.opened",
                title: tOr("history.dailyOpened", "Opened Daily (from profile)"),
                meta: { source: "profile-cta", when: "today" },
              })
            }
            className="group inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-slate-950 font-semibold hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
          >
            {tOr("profile.daily.cta.open", "Know Your Day")}
            <motion.span
              aria-hidden
              className="inline-flex"
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{ x: [0, 2, 0], y: [0, -1, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <ClickIcon className="h-4 w-4" />
            </motion.span>
          </Link>

          {/* Secondary: subtle arrow nudge on hover */}
          <Link
            href="/daily?date=tomorrow"
            onClick={() =>
              log({
                type: "daily.opened",
                title: tOr("history.dailyOpened", "Opened Daily (from profile)"),
                meta: { source: "profile-cta", when: "tomorrow" },
              })
            }
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-slate-200 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            {tOr("profile.daily.cta.tomorrow", "Plan tomorrow")}
            <ArrowRightIcon aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
