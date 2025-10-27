// app/profile/_components/DailyQuickView.tsx
"use client";

import Link from "next/link";
import { useEffect, useState, type SVGProps } from "react";
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

type BirthPayload = NonNullable<ReturnType<typeof deriveDailyPayloadFromActive>>;

export default function DailyQuickView() {
  const { tOr } = useI18n();

  // undefined => before mount (SSR and first client render are identical)
  const [birth, setBirth] = useState<BirthPayload | null | undefined>(undefined);

  useEffect(() => {
    // Read from client storage only after mount to avoid SSR/CSR mismatch
    const b = deriveDailyPayloadFromActive() || deriveDailyPayloadFromCreate();
    setBirth(b ?? null);
  }, []);

  // Shared, stable header (identical HTML on SSR and first client render)
  const Header = (
    <div className="flex items-center gap-2">
      <span className="text-white font-semibold">
        {tOr("profile.daily.title", "Know Your Day")}
      </span>
      <span className="text-[10px] uppercase tracking-wider rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-slate-300">
        {
          // While hydrating (birth === undefined), render a fixed label so SSR == client-first-render
          birth === undefined
            ? tOr("common.personalized", "Personalized")
            : birth
            ? tOr("common.personalized", "Personalized")
            : tOr("common.new", "New")
        }
      </span>
    </div>
  );

  // Use ONE background style in all states to avoid className diffs during hydration
  const Background = (
    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(600px_200px_at_10%_-10%,rgba(34,211,238,0.18),transparent),radial-gradient(500px_160px_at_90%_120%,rgba(16,185,129,0.14),transparent)]" />
  );

  // Skeleton while hydrating — SSR == client-first-render
  if (birth === undefined) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-5">
        {Background}
        <div className="relative">
          {Header}
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm animate-pulse">
            <div className="h-4 bg-white/10 rounded col-span-2" />
            <div className="h-4 bg-white/10 rounded" />
            <div className="h-4 bg-white/10 rounded w-2/3" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
          </div>
          <div className="mt-4 h-9 w-40 bg-white/10 rounded-full" />
        </div>
      </div>
    );
  }

  // If no saved birth details
  if (!birth) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-5">
        {Background}
        <div className="relative">
          {Header}
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

  // Have details — CTA-only card
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-5">
      {Background}
      <div className="relative">
        {Header}

        <p className="mt-2 text-slate-200 text-sm leading-relaxed">
          <span aria-hidden>✨</span>{" "}
          <span className="opacity-90">
            Unlock your <span className="text-white font-medium">best hours</span>, the
            <span className="text-white font-medium"> go-bold moments</span>, and
            <span className="text-white font-medium"> caution windows</span> for today.
            Tap below for your personal timing map.
          </span>
        </p>

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

        <div className="mt-4 flex flex-wrap gap-2">
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
