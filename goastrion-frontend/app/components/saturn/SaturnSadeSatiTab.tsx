// goastrion-frontend/app/components/saturn/SaturnSadeSatiTab.tsx
"use client";

import * as React from "react";
import clsx from "clsx";

// --- Types ---
type RetroSpan = { start: string; end: string };
type Station = { date: string; type?: "station" };

export type SaturnWindow = {
  start: string;
  end: string;
  phase: "start" | "peak" | "end";
  duration_days?: number;

  moon_sign: string;
  saturn_sign: string;

  stations?: string[];
  retro_overlaps?: RetroSpan[];
  bad_days_station?: string[];
  bad_spans_retro?: RetroSpan[];

  badge?: "clear" | "review" | "caution";
  severity?: "green" | "amber" | "red";
  chip?: string;
  note?: string;

  good_day_ratio?: number;
  good_sample_dates?: string[];
  caution_days?: string[];
};

export type SaturnSadeSati = {
  phase: "none" | "start" | "peak" | "end";
  windows: SaturnWindow[];
  caution_days?: string[];
};

export type SaturnOverviewResponse = {
  query_id?: string;
  generated_at?: string;
  tz?: string;
  anchor?: string;
  start_date?: string;
  horizon_days?: number;
  sade_sati: SaturnSadeSati;
  stations?: Station[];
  retrograde?: RetroSpan[];
};

// --- Helpers ---
const MON3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtDate = (iso: string): string => {
  if (!iso) return "—";
  const [Y, M, D] = iso.split("-").map(Number);
  if (!Y || !M || !D) return iso;
  return `${String(D).padStart(2, "0")} ${MON3[M - 1]} ${Y}`;
};
const fmtRange = (a: string, b: string) => `${fmtDate(a)} – ${fmtDate(b)}`;
const fmtDurationDays = (d?: number) => (typeof d === "number" ? `${d}d` : "—");

function StationsCell({ dates }: { dates: string[] }) {
  const [open, setOpen] = React.useState(false);
  if (!dates || dates.length === 0) return <span>—</span>;
  const all = dates.map(fmtDate);
  if (dates.length <= 2) return <span title="Station day(s): momentum unstable.">{all.join(", ")}</span>;
  const rest = dates.length - 2;
  return (
    <div className="relative inline-block" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="underline decoration-dotted underline-offset-2 hover:text-slate-100"
        title="Station day(s): momentum unstable."
        onClick={() => setOpen((v) => !v)}
      >
        {all.slice(0, 2).join(", ")}, +{rest} more
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-max rounded-lg border border-white/15 bg-black/90 p-3 text-xs text-slate-200 shadow-lg">
          <div className="mb-1 font-medium text-slate-100">All station dates</div>
          {all.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function RetroCell({ spans }: { spans: RetroSpan[] }) {
  const [open, setOpen] = React.useState(false);
  if (!spans || spans.length === 0) return <span>—</span>;
  const all = spans.map((s) => fmtRange(s.start, s.end));
  if (spans.length <= 2) return <span>{all.join(", ")}</span>;
  const rest = spans.length - 2;
  return (
    <div className="relative inline-block" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="underline decoration-dotted underline-offset-2 hover:text-slate-100"
        onClick={() => setOpen((v) => !v)}
      >
        {all.slice(0, 2).join(", ")}, +{rest} more
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-max rounded-lg border border-white/15 bg-black/90 p-3 text-xs text-slate-200 shadow-lg">
          <div className="mb-1 font-medium text-slate-100">All retro overlaps</div>
          {all.map((r, i) => (
            <div key={i}>{r}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function phasePretty(phase: SaturnWindow["phase"]) {
  if (phase === "start") return "Start — First Dhaiyya";
  if (phase === "peak") return "Peak — Second Dhaiyya (on Moon sign)";
  return "End — Third Dhaiyya";
}
function chipStyles(sev?: SaturnWindow["severity"]) {
  if (sev === "red") return "bg-red-500/15 text-red-200 border-red-400/30";
  if (sev === "amber") return "bg-amber-500/15 text-amber-200 border-amber-400/30";
  return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
}
function GoodHint({ ratio, samples }: { ratio?: number; samples?: string[] }) {
  if (typeof ratio !== "number") return null;
  const pct = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
  const tail = samples && samples.length ? ` · clear: ${samples.map(fmtDate).join(", ")}` : "";
  return (
    <span className="text-xs text-slate-400">
      {pct}% clear days{tail}
    </span>
  );
}

/** ===== Main Saturn Component ===== */
export default function SaturnSadeSatiTab({
  data,
  className,
}: {
  data: SaturnOverviewResponse;
  className?: string;
}) {
  const anchor = data?.anchor ?? "—";
  const startDate = data?.start_date ? fmtDate(data.start_date) : "—";
  const horizon =
    typeof data?.horizon_days === "number"
      ? `${Math.round((data.horizon_days || 0) / 365.25)} yrs`
      : "—";

  const windows = React.useMemo(() => data?.sade_sati?.windows ?? [], [data]);
  const globalCaution = data?.sade_sati?.caution_days ?? [];

  const rows = React.useMemo(() => {
    const sorted = [...windows].sort((a, b) => (a.start < b.start ? -1 : 1));
    return sorted;
  }, [windows]);

  return (
    <div className={clsx("rounded-2xl border border-white/10 bg-black/10 p-4", className)}>
      <div className="mb-3">
        <div className="text-white font-semibold text-lg">Saturn · Sade Sati</div>
        <div className="text-slate-400 text-sm">
          Compact view of Sade Sati windows with stations & retro overlaps.
        </div>

        <div className="text-xs text-slate-400 mt-2">
          Anchor: <span className="text-slate-200">{anchor}</span> · Start:{" "}
          <span className="text-slate-200">{startDate}</span> · Horizon:{" "}
          <span className="text-slate-200">{horizon}</span>
        </div>

        <div className="mt-2 text-xs">
          {globalCaution.length > 0 ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-red-200">
              <span className="font-medium">Caution dates</span>
              <span>{globalCaution.slice(0, 3).map(fmtDate).join(", ")}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-200">
              <span className="font-medium">No caution dates in view</span>
            </div>
          )}
        </div>
      </div>


      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-white/10">
              <th className="text-left py-2 pr-3">Phase</th>
              <th className="text-left py-2 pr-3">Start</th>
              <th className="text-left py-2 pr-3">End</th>
              <th className="text-left py-2 pr-3">Duration</th>
              <th className="text-left py-2 pr-3">Moon Sign</th>
              <th className="text-left py-2 pr-3">Saturn Sign</th>
              <th className="text-left py-2 pr-3">Stations</th>
              <th className="text-left py-2 pr-3">Retro overlaps</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-400">
                  No Sade Sati windows in this horizon.
                </td>
              </tr>
            ) : (
              rows.map((w, idx) => {
                const stations = w.stations ?? w.bad_days_station ?? [];
                const retros = (w.retro_overlaps ?? w.bad_spans_retro ?? []) as RetroSpan[];
                const sev = w.severity;
                const chipClass = chipStyles(sev);
                const chipText =
                  w.chip ||
                  (sev === "green" ? "Clear" : sev === "amber" ? "Review" : "Caution");

                return (
                  <tr key={`${w.phase}-${idx}`} className="border-b border-white/5">
                    <td className="py-2 pr-3 text-slate-200">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{phasePretty(w.phase)}</span>
                        <span
                          className={clsx("inline-flex items-center rounded-full border px-2 py-0.5 text-xs", chipClass)}
                        >
                          {chipText}
                        </span>
                        <GoodHint ratio={w.good_day_ratio} samples={w.good_sample_dates} />
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-slate-300">{fmtDate(w.start)}</td>
                    <td className="py-2 pr-3 text-slate-300">{fmtDate(w.end)}</td>
                    <td className="py-2 pr-3 text-slate-400">{fmtDurationDays(w.duration_days)}</td>
                    <td className="py-2 pr-3 text-slate-200">{w.moon_sign || "—"}</td>
                    <td className="py-2 pr-3 text-slate-200">{w.saturn_sign || "—"}</td>
                    <td className="py-2 pr-3 text-slate-200">
                      <StationsCell dates={stations} />
                    </td>
                    <td className="py-2 pr-3 text-slate-200">
                      <RetroCell spans={retros} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom footnote */}
      <div className="mt-3 text-xs text-slate-500 leading-5">
        <div><strong>Stations:</strong> momentum unstable; avoid new starts, focus on completion.</div>
        <div><strong>Retro overlaps:</strong> good for review, fix, renegotiate. Expect rework.</div>
      </div>

    </div>
  );
}
