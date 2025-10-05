"use client";

import React, { useEffect, useMemo, useState } from "react";

// tiny replacement for `cn`
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type ShubhDinResponse = {
  query_id: string;
  generated_at: string;
  tz: string;
  horizon_months: number;
  confidence_overall: string;
  results: Array<{
    goal: string;
    headline: string;
    score: number;
    confidence: "low" | "medium" | "high";
    dates?: Array<{ date: string; score: number; tags?: string[] }>;
    windows?: Array<{ start: string; end: string; duration_days: number }>;
    explain?: string[];
    cautions?: string[];
    caution_days?: string[];
  }>;
};

/* ===================== Visual Catalog ===================== */

const GOAL_LABEL: Record<string, string> = {
  promotion: "Promotion",
  job_change: "Job Change",
  startup: "Startup",
  property: "Property / Home",
  marriage: "Marriage",
  business_expand: "Business · Expand",
  business_start: "Business · Start",
  new_relationship: "New Relationship",
};

const GOAL_THEME: Record<
  string,
  {
    grad: string; ring: string;
    textLight: string; textDark: string;
    chipLight: string; chipDark: string;
    icon: React.ReactNode;
  }
> = {
  promotion: {
    grad: "from-amber-300/20 via-orange-300/20 to-rose-300/20",
    ring: "ring-amber-200",
    textLight: "text-amber-900",
    textDark: "text-amber-200",
    chipLight: "bg-amber-50 border-amber-200 text-amber-900",
    chipDark: "bg-amber-400/15 border-amber-300/30 text-amber-100",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 2l2.39 4.84 5.34.78-3.86 3.76.91 5.32L12 14.77 7.22 16.7l.91-5.32L4.27 7.62l5.34-.78L12 2z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
  job_change: {
    grad: "from-sky-300/20 via-cyan-300/20 to-indigo-300/20",
    ring: "ring-sky-200",
    textLight: "text-sky-900",
    textDark: "text-sky-200",
    chipLight: "bg-sky-50 border-sky-200 text-sky-900",
    chipDark: "bg-sky-400/15 border-sky-300/30 text-sky-100",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M10 4h4l2 3h4v11H4V7h4l2-3z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
  startup: {
    grad: "from-emerald-300/20 via-teal-300/20 to-green-300/20",
    ring: "ring-emerald-200",
    textLight: "text-emerald-900",
    textDark: "text-emerald-200",
    chipLight: "bg-emerald-50 border-emerald-200 text-emerald-900",
    chipDark: "bg-emerald-400/15 border-emerald-300/30 text-emerald-100",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 2l4 4-7 7-4 1 1-4 7-7zM3 21l4-1-3-3-1 4z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
  property: {
    grad: "from-fuchsia-300/20 via-pink-300/20 to-rose-300/20",
    ring: "ring-fuchsia-200",
    textLight: "text-fuchsia-900",
    textDark: "text-fuchsia-200",
    chipLight: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900",
    chipDark: "bg-fuchsia-400/15 border-fuchsia-300/30 text-fuchsia-100",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 11l9-7 9 7v9H3v-9zM9 20v-6h6v6" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
  marriage: {
    grad: "from-purple-300/20 via-violet-300/20 to-indigo-300/20",
    ring: "ring-purple-200",
    textLight: "text-purple-900",
    textDark: "text-purple-200",
    chipLight: "bg-purple-50 border-purple-200 text-purple-900",
    chipDark: "bg-purple-400/15 border-purple-300/30 text-purple-100",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M7 8a5 5 0 108 0m-8 0l2-3m6 3l-2-3" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
  business_expand: {
    grad: "from-blue-300/20 via-indigo-300/20 to-slate-300/20",
    ring: "ring-blue-200",
    textLight: "text-blue-900",
    textDark: "text-blue-200",
    chipLight: "bg-blue-50 border-blue-200 text-blue-900",
    chipDark: "bg-blue-400/15 border-blue-300/30 text-blue-100",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 14l4-4 4 4 6-6" stroke="currentColor" strokeWidth="1.5"/><path d="M14 8h6v6" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
  business_start: {
    grad: "from-rose-300/20 via-orange-300/20 to-amber-300/20",
    ring: "ring-rose-200",
    textLight: "text-rose-900",
    textDark: "text-rose-200",
    chipLight: "bg-rose-50 border-rose-200 text-rose-900",
    chipDark: "bg-rose-400/15 border-rose-300/30 text-rose-100",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h6M8 9v6M13 5l6 6-6 6" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
  new_relationship: {
    grad: "from-pink-300/20 via-rose-300/20 to-red-300/20",
    ring: "ring-pink-200",
    textLight: "text-pink-900",
    textDark: "text-pink-200",
    chipLight: "bg-pink-50 border-pink-200 text-pink-900",
    chipDark: "bg-pink-400/15 border-pink-300/30 text-pink-100",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 21s-7-4.35-7-10a4 4 0 018-1 4 4 0 018 1c0 5.65-7 10-7 10z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
};

const UI_FLAGS = {
  showHorizon: true,
  showOverallConfidence: true,
  showBestDateBlock: false,
  showFooter: false,
};

/* ===================== helpers ===================== */

function fmtDate(iso: string) {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}
function cleanExplain(lines?: string[]) {
  if (!lines) return [];
  return lines.map((s) => s.replace(/brand\/UX/gi, "branding & user experience"));
}
function mergeCombustDatesIntoCaution(cautions?: string[], cautionDays?: string[]) {
  if (!cautions || cautions.length === 0) return cautions;
  const cds = (cautionDays || []).map(fmtDate);
  return cautions.map((c) => {
    if (/combust/i.test(c) && cds.length) {
      const preview = cds.slice(0, 10).join(", ");
      const more = cds.length > 10 ? ` (+${cds.length - 10} more)` : "";
      return `${c} — ${preview}${more}`;
    }
    return c;
  });
}

/* ===================== UI bits ===================== */

function ConfidenceBadge({ level }: { level: "low" | "medium" | "high" }) {
  const tone = level === "high" ? "bg-emerald-500" : level === "medium" ? "bg-amber-500" : "bg-rose-500";
  const halo = level === "high" ? "from-emerald-400/40" : level === "medium" ? "from-amber-400/40" : "from-rose-400/40";
  return (
    <div className="relative">
      <span className={cn("absolute -inset-[6px] rounded-full blur-xl bg-gradient-to-r", halo, "to-transparent")} />
      <span className={cn("relative rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shadow", tone)}>{level}</span>
    </div>
  );
}

function GoalHeader({ goal, mode }: { goal: string; mode: "ink" | "light" }) {
  const theme = GOAL_THEME[goal] || GOAL_THEME.startup;
  const label = GOAL_LABEL[goal] || goal;
  const textClass = mode === "ink" ? theme.textDark : theme.textLight;

  return (
    <div className={cn("relative overflow-hidden rounded-xl border px-3 py-2",
      mode === "ink" ? `bg-gradient-to-r ${theme.grad} border-white/10` : `bg-gradient-to-r ${theme.grad} border-white/60`)}>
      <div className={cn("absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl", mode === "ink" ? "bg-white/10" : "bg-white/40")} />
      <div className="flex items-center gap-2">
        <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-full",
          mode === "ink" ? "bg-white/10" : "bg-white/70", textClass)}>
          {theme.icon}
        </span>
        <span className={cn("text-sm font-semibold", textClass)}>{label}</span>
      </div>
    </div>
  );
}

function WindowChip({
  start, end, days, toneLight, toneDark, mode,
}: {
  start: string; end: string; days: number; toneLight: string; toneDark: string; mode: "ink" | "light";
}) {
  const tone = mode === "ink" ? toneDark : toneLight;
  return (
    <div className={cn("rounded-xl border px-3 py-2 text-xs flex flex-col gap-1", tone)}>
      <div className="flex items-center justify-between">
        <span>{fmtDate(start)}</span>
        <span className="font-semibold">{days}d</span>
        <span>{fmtDate(end)}</span>
      </div>
      <div className={cn("relative h-1.5 overflow-hidden rounded-full", mode === "ink" ? "bg-white/10" : "bg-black/10")}>
        <div className={cn("absolute inset-y-0 left-0 w-2/3", mode === "ink" ? "bg-white/30" : "bg-black/20")} />
      </div>
    </div>
  );
}

/* ===================== main ===================== */

export default function ShubhDinResults({ data }: { data: ShubhDinResponse }) {
  // Color mode with persistence
  const [mode, setMode] = useState<"ink" | "light">("ink");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("shubhdin_color_mode") as "ink" | "light" | null) : null;
    if (saved === "ink" || saved === "light") setMode(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("shubhdin_color_mode", mode);
  }, [mode]);

  // Move "Promotion" to the bottom
  const ordered = useMemo(() => {
    const arr = [...data.results];
    arr.sort((a, b) => {
      const aIsPromo = a.goal === "promotion" ? 1 : 0;
      const bIsPromo = b.goal === "promotion" ? 1 : 0;
      if (aIsPromo !== bIsPromo) return aIsPromo - bIsPromo;
      return 0;
    });
    return arr;
  }, [data.results]);

  return (
    <div className={cn("min-h-[70vh] w-full",
      mode === "ink" ? "bg-stone-50 bg-gradient-to-b from-stone-50 to-stone-100"
                     : "bg-gradient-to-b from-slate-50 to-white")}>
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-8">
        {/* page header */}
        <div className={cn("mb-6 rounded-2xl border p-5 shadow-sm",
          mode === "ink" ? "bg-white/60 border-white/40 backdrop-blur" : "bg-gradient-to-r from-slate-50 to-white")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className={cn("text-2xl font-semibold", "text-slate-900")}>ShubhDin — Smart Windows</h1>
              <p className={cn("mt-1 text-sm", mode === "ink" ? "text-slate-800" : "text-slate-700")}>
                Horizon: {data.horizon_months} months · Overall confidence: {data.confidence_overall}
              </p>
            </div>
            {/* mode toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode(mode === "ink" ? "light" : "ink")}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition",
                  mode === "ink"
                    ? "bg-slate-900 text-slate-100 border-slate-700 hover:bg-slate-800"
                    : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                )}
                aria-label="Toggle color mode"
                title="Toggle color mode"
              >
                <span className="relative flex h-4 w-8 items-center rounded-full border transition
                                 border-current/20">
                  <span
                    className={cn(
                      "absolute left-0.5 top-0.5 h-3 w-3 rounded-full transition-transform",
                      mode === "ink" ? "translate-x-4 bg-white" : "translate-x-0 bg-slate-900"
                    )}
                  />
                </span>
                {mode === "ink" ? "Ink" : "Light"}
              </button>
            </div>
          </div>
        </div>

        {/* cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {ordered.map((r, idx) => {
            const theme = GOAL_THEME[r.goal] || GOAL_THEME.startup;
            const explain = cleanExplain(r.explain);
            const mergedCautions = mergeCombustDatesIntoCaution(r.cautions, r.caution_days);
            const windows = r.windows || [];
            const best = r.dates?.[0]; // tags only

            return (
              <article
                key={r.goal + idx}
                className={cn(
                  "group relative overflow-hidden rounded-3xl p-4 md:p-5 transition-all duration-300 ring-1",
                  mode === "ink"
                    ? "bg-slate-900 text-slate-100 border-slate-800 ring-slate-700 shadow-lg hover:-translate-y-[2px] hover:shadow-2xl"
                    : "bg-white text-slate-900 border border-neutral-200 ring-neutral-200 shadow-lg hover:-translate-y-[2px] hover:shadow-xl"
                )}
              >
                {/* glow accents */}
                <div className={cn("pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl",
                  mode === "ink" ? "bg-white/10" : "bg-white/60")} />
                <div className={cn("pointer-events-none absolute -left-24 -bottom-24 h-56 w-56 rounded-full blur-3xl",
                  mode === "ink" ? "bg-white/10" : "bg-white/50")} />

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <GoalHeader goal={r.goal} mode={mode} />
                  </div>
                  <div className="ml-3">
                    <ConfidenceBadge level={r.confidence} />
                  </div>
                </div>

                <p className={cn("mt-3 text-sm", mode === "ink" ? "text-slate-200" : "text-slate-800")}>{r.headline}</p>

                {/* window chips */}
                {windows.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {windows.map((w, i) => (
                      <WindowChip
                        key={i}
                        start={w.start}
                        end={w.end}
                        days={w.duration_days}
                        toneLight={cn("border", theme.chipLight)}
                        toneDark={cn("border", theme.chipDark)}
                        mode={mode}
                      />
                    ))}
                  </div>
                )}

                {/* tags */}
                {best && (best.tags?.length ?? 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {best.tags!.map((t, i) => (
                      <span
                        key={i}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs backdrop-blur-sm",
                          mode === "ink" ? theme.chipDark : theme.chipLight
                        )}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* divider */}
                {(explain.length > 0 || (mergedCautions && mergedCautions.length > 0) || (r.caution_days && r.caution_days.length > 0)) && (
                  <div className={cn("my-4 h-px w-full",
                    mode === "ink" ? "bg-white/10" : "bg-gradient-to-r from-transparent via-slate-200 to-transparent")} />
                )}

                {/* explain */}
                {explain.length > 0 && (
                  <div className="space-y-1.5">
                    <div className={cn("text-sm font-semibold", mode === "ink" ? theme.textDark : theme.textLight)}>
                      Why this matters
                    </div>
                    <ul className={cn("list-disc pl-5 text-sm", mode === "ink" ? "text-slate-200" : "text-slate-800")}>
                      {explain.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* cautions */}
                {(mergedCautions && mergedCautions.length > 0) ||
                (r.caution_days && r.caution_days.length > 0) ? (
                  <div className="mt-3 space-y-1.5">
                    <div className={cn("text-sm font-semibold", mode === "ink" ? theme.textDark : theme.textLight)}>
                      Cautions
                    </div>
                    <ul className={cn("list-disc pl-5 text-sm", mode === "ink" ? "text-slate-200" : "text-slate-800")}>
                      {(mergedCautions || []).map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                    {r.caution_days && r.caution_days.length > 0 && (
                      <div className="pt-1">
                        <div className={cn("text-xs mb-1", mode === "ink" ? "text-slate-300" : "text-slate-600")}>Caution dates</div>
                        <div className="flex flex-wrap gap-1.5">
                          {r.caution_days.slice(0, 20).map((d, i) => (
                            <span
                              key={i}
                              className={cn(
                                "rounded-lg border px-2 py-0.5 text-xs backdrop-blur-sm",
                                mode === "ink" ? theme.chipDark : theme.chipLight
                              )}
                            >
                              {fmtDate(d)}
                            </span>
                          ))}
                          {r.caution_days.length > 20 && (
                            <span className={cn("text-xs", mode === "ink" ? "text-slate-300" : "text-slate-600")}>
                              +{r.caution_days.length - 20} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        {/* footer hidden */}
        {UI_FLAGS.showFooter && (
          <footer className="mt-8 text-xs text-neutral-600">
            Generated: {new Date(data.generated_at).toLocaleString()} — query: {data.query_id}
          </footer>
        )}
      </div>
    </div>
  );
}
