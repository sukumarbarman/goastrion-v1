"use client";

import React, { useEffect, useMemo, useState } from "react";

/* ---------- Backend shapes ---------- */
type BackendWindow = { start: string; end: string; duration_days?: number };
type BackendDate = { date: string; score?: number; tags?: string[] };

type BackendResult = {
  goal: string;                 // e.g., "job_change"
  headline?: string;            // e.g., "Best windows: ..."
  confidence?: string;          // e.g., "medium"
  windows?: BackendWindow[];    // spans
  dates?: BackendDate[];        // for tag highlights
  explain?: string[];           // "Why this matters"
  cautions?: string[];          // textual cautions
  caution_days?: string[];      // YYYY-MM-DD
};

type BackendResponse = {
  query_id: string;
  generated_at: string;         // UTC ISO
  tz?: string;
  horizon_months?: number;
  confidence_overall?: string;  // overall confidence
  results?: BackendResult[];
};

/* ---------- Props ---------- */
type TzId = "IST" | "UTC";
type DisplayMode = "all" | "single";
type Variant = "smart" | "cards";

type Props = {
  datetime: string;
  lat: number;
  lon: number;
  tzId?: TzId;
  horizonMonths?: number;
  goal?: string;
  displayMode?: DisplayMode;
  variant?: Variant;
};

const TZ_HOURS: Record<TzId, number> = { IST: 5.5, UTC: 0 };

/* ---------- Utils ---------- */
function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return d;
  }
}

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1));
}

function prettyGoalRaw(g?: string) {
  return (g ?? "").replace(/_/g, " ").trim();
}

function prettyGoal(g?: string) {
  const raw = prettyGoalRaw(g).toLowerCase();
  const map: Record<string, string> = {
    "job change": "Job Change",
    promotion: "Promotion",
    "business start": "Business Start",
    "business expand": "Business Expand",
    startup: "Startup",
    property: "Property / Home",
    marriage: "Marriage",
    "new relationship": "New Relationship",
  };
  return map[raw] || toTitleCase(prettyGoalRaw(g));
}

/* ---------- Simple card (variant="cards") ---------- */
function GoalCard({ r }: { r: BackendResult }) {
  const windows = r.windows ?? [];
  const cautions = r.cautions ?? [];
  const cautionDays = r.caution_days ?? [];
  const explain = r.explain ?? [];

  const dupHeadline =
    typeof r.headline === "string" && /^best windows:/i.test(r.headline.trim());
  const showHeadline = !!r.headline && !dupHeadline && windows.length === 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-white font-semibold">{prettyGoal(r.goal)}</div>
      </div>

      {showHeadline && <div className="text-slate-300 text-sm mb-2">{r.headline}</div>}

      {windows.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 text-sm font-medium text-emerald-300">Best windows</div>
          <ul className="space-y-1">
            {windows.map((w, i) => (
              <li
                key={`w-${i}`}
                className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-sm text-emerald-100"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{fmtDate(w.start)} → {fmtDate(w.end)}</span>
                  {typeof w.duration_days === "number" && (
                    <span className="text-emerald-300/80">({w.duration_days}d)</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(cautions.length > 0 || cautionDays.length > 0) && (
        <div className="mb-3">
          <div className="mb-1 text-sm font-medium text-amber-300">Caution</div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-amber-100">
            {cautions.map((c, i) => <li key={`c-${i}`}>{c}</li>)}
            {cautionDays.length > 0 && <li key="cdays">Caution day(s): {cautionDays.join(", ")}</li>}
          </ul>
        </div>
      )}

      {explain.length > 0 && (
        <div>
          <div className="mb-1 text-sm font-medium text-slate-300">Why these days?</div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-200">
            {explain.map((s, i) => <li key={`e-${i}`}>{s}</li>)}
          </ul>
        </div>
      )}

      {windows.length === 0 && cautions.length === 0 && explain.length === 0 && !r.headline && (
        <div className="text-sm text-white/70">No notable windows for this goal.</div>
      )}
    </div>
  );
}

/* ---------- Smart Windows block (variant="smart") ---------- */
function SmartGoalBlock({ r }: { r: BackendResult }) {
  const windows = r.windows ?? [];
  const tags = (r.dates?.[0]?.tags ?? []).slice(0, 6);
  const cautions = r.cautions ?? [];
  const cautionDays = r.caution_days ?? [];
  const explain = r.explain ?? [];

  // Hide the headline if it's just repeating the windows summary
  const headlineLooksLikeWindows =
    typeof r.headline === "string" && /^best windows:/i.test(r.headline.trim());
  const showHeadline = !!r.headline && !headlineLooksLikeWindows && windows.length === 0;

  // Collapse long caution date lists
  const MAX_CAUTION_DAYS = 10;
  const extraDays = Math.max(0, cautionDays.length - MAX_CAUTION_DAYS);
  const shownCautionDays = extraDays > 0 ? cautionDays.slice(0, MAX_CAUTION_DAYS) : cautionDays;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="text-white text-base md:text-lg font-semibold">
            {prettyGoal(r.goal)}
          </div>
          {r.confidence && (
            <span className="text-xs rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-slate-200">
              {r.confidence}
            </span>
          )}
        </div>
      </div>

      {/* Headline (only if not duplicate) */}
      {showHeadline && (
        <div className="text-slate-300 text-sm mt-1">{r.headline}</div>
      )}

      {/* Windows */}
      {windows.length > 0 && (
        <div className="mt-3">
          <div className="text-sm font-medium text-emerald-300 mb-1">Best windows</div>
          <div className="grid gap-2 md:grid-cols-2">
            {windows.map((w, i) => (
              <div
                key={`w-${i}`}
                className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm text-emerald-100">
                  <span className="font-medium">{fmtDate(w.start)}</span>
                  {typeof w.duration_days === "number" && (
                    <span className="px-2 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/20">
                      {w.duration_days}d
                    </span>
                  )}
                  <span className="font-medium">{fmtDate(w.end)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <span
              key={`tag-${i}`}
              className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-slate-200"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Why this matters */}
      {explain.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-slate-300">Why this matters</div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-200 mt-1">
            {explain.map((s, i) => <li key={`e-${i}`}>{s}</li>)}
          </ul>
        </div>
      )}

      {/* Cautions */}
      {(cautions.length > 0 || shownCautionDays.length > 0) && (
        <div className="mt-3">
          <div className="text-sm font-medium text-amber-300">Cautions</div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-amber-100 mt-1">
            {cautions.map((c, i) => <li key={`c-${i}`}>{c}</li>)}
            {shownCautionDays.length > 0 && (
              <li key="cdays">
                Caution dates: {shownCautionDays.join(", ")}
                {extraDays > 0 && <span> (+{extraDays} more)</span>}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------- Component ---------- */
export default function ShubhDinInline({
  datetime,
  lat,
  lon,
  tzId = "IST",
  horizonMonths = 24,
  goal,
  displayMode = "all",
  variant = "cards",
}: Props) {
  const [resp, setResp] = useState<BackendResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const tzOffsetHours = TZ_HOURS[tzId];

  useEffect(() => {
    let abort = false;

    async function run() {
      if (!datetime || !Number.isFinite(lat) || !Number.isFinite(lon)) return;
      try {
        setLoading(true);
        setErr(null);

        const payload: Record<string, unknown> = {
          datetime,
          lat,
          lon,
          tz_offset_hours: tzOffsetHours,
          horizon_months: horizonMonths,
        };
        if (displayMode === "single" && goal) {
          payload.goal = goal;
        }

        const res = await fetch("/api/shubhdin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as BackendResponse;
        if (!abort) setResp(json);
      } catch (e: unknown) {
        if (!abort) setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!abort) setLoading(false);
      }
    }

    run();
    return () => { abort = true; };
  }, [datetime, lat, lon, tzOffsetHours, horizonMonths, displayMode, goal]);

  const allResults = useMemo(() => resp?.results ?? [], [resp]);

  const results =
    displayMode === "single"
      ? (goal ? allResults.filter(r => r.goal === goal) : allResults.slice(0, 1))
      : allResults;

  const headerTitle =
    variant === "smart"
      ? "ShubhDin — Smart Windows"
      : displayMode === "single"
      ? `ShubhDin (Good Days) — ${prettyGoal(goal) || "selected"}`
      : "ShubhDin (Good Days)";

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="mb-2">
        <h2 className="text-lg md:text-xl font-semibold text-white">{headerTitle}</h2>
        {variant === "smart" && (
          <div className="text-xs md:text-sm text-slate-300 mt-1">
            Horizon: {resp?.horizon_months ?? horizonMonths} months · Overall confidence: {resp?.confidence_overall ?? "—"}
          </div>
        )}
      </div>

      {loading && <div className="text-xs text-white/60 mb-2">loading…</div>}
      {err && <div className="text-sm text-red-300">Error: {err}</div>}

      {!err && resp && (
        <>
          {results.length > 0 ? (
            variant === "smart" ? (
              <div className="space-y-4">
                {results.map((r) => <SmartGoalBlock key={r.goal} r={r} />)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {results.map((r) => <GoalCard key={r.goal} r={r} />)}
              </div>
            )
          ) : (
            <div className="text-sm text-white/80">No notable windows found for the chosen horizon.</div>
          )}

          <div className="pt-3 text-xs text-white/50">
            Generated {resp.generated_at ? new Date(resp.generated_at).toLocaleString() : new Date().toLocaleString()} • TZ: {tzId}
          </div>
        </>
      )}
    </section>
  );
}
