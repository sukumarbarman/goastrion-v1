"use client";
import React, { useEffect, useMemo, useState } from "react";

/* ---------- Types: backend shape ---------- */
type BackendWindow = { start: string; end: string; duration_days?: number };
type BackendDate = { date: string; score?: number; tags?: string[] };

type BackendResult = {
  goal: string;
  headline?: string;
  score?: number;
  confidence?: string;
  dates?: BackendDate[];
  windows?: BackendWindow[];
  explain?: string[];
  cautions?: string[];
  caution_days?: string[];
};

type BackendResponse = {
  query_id: string;
  generated_at: string;   // UTC ISO
  tz?: string;
  horizon_months?: number;
  confidence_overall?: string;
  results?: BackendResult[];
};

type TzId = "IST" | "UTC";

type Props = {
  /** Anchor moment in UTC ISO (use NOW) */
  datetime: string;
  lat: number;
  lon: number;
  tzId?: TzId;                 // default IST
  horizonMonths?: number;      // default 24
  /** If provided, backend may tailor scoring, but we still render ALL goals */
  goal?: string;               // optional hint for backend
};

const TZ_HOURS: Record<TzId, number> = { IST: 5.5, UTC: 0 };

function fmt(d: string) {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return d;
  }
}

/* Small card renderer for a single goal */
function GoalCard({ r }: { r: BackendResult }) {
  const windows = r.windows ?? [];
  const cautions = r.cautions ?? [];
  const cautionDays = r.caution_days ?? [];
  const explain = r.explain ?? [];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-white font-semibold capitalize">
          {r.goal.replace(/_/g, " ")}
        </div>
        {typeof r.score === "number" && (
          <span className="text-xs rounded bg-white/10 px-2 py-0.5 text-white/80">
            Score {r.score}
          </span>
        )}
      </div>
      {r.headline && <div className="text-slate-300 text-sm mb-2">{r.headline}</div>}

      {windows.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 text-sm font-medium text-emerald-300">Best windows</div>
          <ul className="space-y-1">
            {windows.map((w, i) => (
              <li
                key={`w-${i}`}
                className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-sm text-emerald-100"
              >
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="font-medium">{fmt(w.start)} → {fmt(w.end)}</span>
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
            {cautionDays.length > 0 && (
              <li key="cdays">Caution day(s): {cautionDays.join(", ")}</li>
            )}
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

      {windows.length === 0 && cautions.length === 0 && explain.length === 0 && (
        <div className="text-sm text-white/70">No notable windows for this goal.</div>
      )}
    </div>
  );
}

export default function ShubhDinInline({
  datetime,
  lat,
  lon,
  tzId = "IST",
  horizonMonths = 24,
  goal, // optional hint to backend
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

        const res = await fetch("/api/shubhdin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            datetime,
            lat,
            lon,
            tz_offset_hours: tzOffsetHours,
            horizon_months: horizonMonths,
            goal, // backend may tailor scores but will still return multiple goals
          }),
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
  }, [datetime, lat, lon, tzOffsetHours, horizonMonths, goal]);

  const results = useMemo(() => resp?.results ?? [], [resp]);

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">ShubhDin (Good Days)</h2>
        {loading && <span className="text-xs text-white/60">loading…</span>}
      </div>

      {err && <div className="text-sm text-red-300">Error: {err}</div>}

      {!err && resp && (
        <div className="space-y-4">
          {results.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {results.map((r) => (
                <GoalCard key={r.goal} r={r} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-white/80">No notable windows found for the chosen horizon.</div>
          )}

          <div className="pt-2 text-xs text-white/50">
            Generated {resp.generated_at ? new Date(resp.generated_at).toLocaleString() : new Date().toLocaleString()} • TZ: {tzId}
          </div>
        </div>
      )}
    </section>
  );
}
