"use client";

import * as React from "react";
import clsx from "clsx";

/** ===== Types aligned with the updated backend ===== */
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

/** ===== Small formatting helpers ===== */
const MON3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const [Y, M, D] = iso.split("-").map(Number);
  if (!Y || !M || !D) return iso;
  return `${String(D).padStart(2, "0")} ${MON3[M - 1]} ${Y}`;
}
function fmtRange(a: string, b: string): string {
  return `${fmtDate(a)} – ${fmtDate(b)}`;
}
function fmtDurationDays(d?: number) {
  return typeof d === "number" && Number.isFinite(d) ? `${d}d` : "—";
}

/** Stations cell (expandable tooltip for +N more) */
function StationsCell({ dates }: { dates: string[] }) {
  const [open, setOpen] = React.useState(false);
  if (!dates || dates.length === 0) return <span>—</span>;
  const all = dates.map(fmtDate);
  if (dates.length <= 2) {
    return (
      <span title="Station day(s): momentum is unstable. Avoid brand-new commitments; review and finalize ongoing work; double-check paperwork.">
        {all.join(", ")}
      </span>
    );
  }
  const rest = dates.length - 2;
  const tip =
    "Station day(s): momentum is unstable. Avoid brand-new commitments; review and finalize ongoing work; double-check paperwork.";
  return (
    <div className="relative inline-block" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="underline decoration-dotted underline-offset-2 hover:text-slate-100"
        title={tip}
        onClick={() => setOpen((v) => !v)}
      >
        {all.slice(0, 2).join(", ")}, +{rest} more
      </button>
      {open && (
        <div
          className="absolute z-20 mt-1 w-max max-w-[420px] rounded-lg border border-white/15 bg-black/90 p-3 text-xs text-slate-200 shadow-lg backdrop-blur"
          role="dialog"
        >
          <div className="mb-1 font-medium text-slate-100">All station dates</div>
          <div className="space-y-1">
            {all.map((d, i) => (
              <div key={i} className="whitespace-nowrap">{d}</div>
            ))}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Tip: Avoid brand-new commitments; finalize ongoing work; double-check paperwork.
          </div>
        </div>
      )}
    </div>
  );
}

/** Retro overlaps (expandable) */
function RetroCell({ spans }: { spans: RetroSpan[] }) {
  const [open, setOpen] = React.useState(false);
  if (!spans || spans.length === 0) return <span>—</span>;
  const tip =
    "Retrograde span: great for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.";
  const all = spans.map((s) => fmtRange(s.start, s.end));
  if (spans.length <= 2) return <span title={tip}>{all.join(", ")}</span>;
  const rest = spans.length - 2;
  return (
    <div className="relative inline-block" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="underline decoration-dotted underline-offset-2 hover:text-slate-100"
        title={tip}
        onClick={() => setOpen((v) => !v)}
      >
        {all.slice(0, 2).join(", ")}, +{rest} more
      </button>
      {open && (
        <div
          className="absolute z-20 mt-1 w-max max-w-[520px] rounded-lg border border-white/15 bg-black/90 p-3 text-xs text-slate-200 shadow-lg backdrop-blur"
          role="dialog"
        >
          <div className="mb-1 font-medium text-slate-100">All retro overlaps</div>
          <div className="space-y-1">
            {all.map((t, i) => (
              <div key={i} className="whitespace-nowrap">{t}</div>
            ))}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Tip: Best for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.
          </div>
        </div>
      )}
    </div>
  );
}

/** Phase pretty label (per spec) */
function phasePretty(phase: SaturnWindow["phase"]) {
  if (phase === "start") return "start — First Dhaiyya";
  if (phase === "peak") return "peak — Second Dhaiyya (on Moon sign)";
  return "end — Third Dhaiyya";
}

/** Severity chip styles */
function chipStyles(sev?: SaturnWindow["severity"]) {
  if (sev === "red")   return "bg-red-500/15 text-red-200 border-red-400/30";
  if (sev === "amber") return "bg-amber-500/15 text-amber-200 border-amber-400/30";
  return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
}

/** Good-day hint inline (optional) */
function GoodHint({ ratio, samples }: { ratio?: number; samples?: string[] }) {
  if (typeof ratio !== "number") return null;
  const pct = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
  const tail =
    samples && samples.length
      ? ` · sample clear days: ${samples.map(fmtDate).join(", ")}`
      : "";
  return (
    <span className="text-xs text-slate-400">
      {pct}% clear days{tail}
    </span>
  );
}

/** ===== Main component ===== */
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

  // Memoize windows to satisfy react-hooks exhaustive-deps
  const windows = React.useMemo<SaturnWindow[]>(
    () => (data?.sade_sati?.windows ?? []),
    [data]
  );
  const globalCaution = data?.sade_sati?.caution_days ?? [];

  // Sorted rows
  const rows = React.useMemo(() => {
    const sorted = [...windows].sort((a, b) =>
      a.start < b.start ? -1 : a.start > b.start ? 1 : 0
    );
    return sorted;
  }, [windows]);

  return (
    <div className={clsx("rounded-2xl border border-white/10 bg-black/10 p-4", className)}>
      <div className="mb-3">
        <div className="text-white font-semibold text-lg">Saturn · Sade Sati</div>
        <div className="text-slate-400 text-sm">
          Compact view of your Sade Sati windows with station days & retro overlaps.
        </div>

        <div className="text-xs text-slate-400 mt-2">
          Anchor: <span className="text-slate-200">{anchor}</span>
          {" · "}Start: <span className="text-slate-200">{startDate}</span>
          {" · "}Horizon: <span className="text-slate-200">{horizon}</span>
        </div>

        {/* Global caution summary (stations) */}
        <div className="mt-2 text-xs">
          {globalCaution.length > 0 ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-red-200">
              <span className="font-medium">Caution dates</span>
              <span className="text-red-100/80">
                {globalCaution.slice(0, 3).map(fmtDate).join(", ")}
                {globalCaution.length > 3 ? `, +${globalCaution.length - 3} more` : ""}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-200">
              <span className="font-medium">No station days in view</span>
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
              {/* Note column intentionally removed from UI; still in CSV elsewhere */}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-400">
                  No Sade Sati windows in this horizon.
                </td>
              </tr>
            )}

            {rows.map((w, idx) => {
              const stations = w.stations ?? w.bad_days_station ?? [];
              const retros = (w.retro_overlaps ?? w.bad_spans_retro ?? []) as RetroSpan[];

              const sev = w.severity;
              const chipClass = chipStyles(sev);
              const chipText =
                w.chip ||
                (sev === "green" ? "Clear flow" : sev === "amber" ? "Review/Revise" : "Caution day(s)");

              const hasStations = (stations?.length ?? 0) > 0;
              const hasRetros = (retros?.length ?? 0) > 0;
              const chipTitle =
                hasStations && hasRetros
                  ? "Stations: momentum is unstable—avoid brand-new commitments; finalize ongoing work; double-check paperwork.\nRetro overlap: great for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines."
                  : hasStations
                  ? "Station day(s): momentum is unstable. Avoid brand-new commitments; review and finalize ongoing work; double-check paperwork."
                  : hasRetros
                  ? "Retro overlap: great for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines."
                  : "Clear flow.";

              return (
                <tr key={`${w.phase}-${w.start}-${idx}`} className="border-b border-white/5">
                  {/* Phase + chip */}
                  <td className="py-2 pr-3 text-slate-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{phasePretty(w.phase)}</span>
                      <span
                        className={clsx("inline-flex items-center rounded-full border px-2 py-0.5 text-xs", chipClass)}
                        title={chipTitle}
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
            })}
          </tbody>
        </table>
      </div>

      {/* Footnote copy for users */}
      <div className="mt-3 text-xs text-slate-500 leading-5">
        <div><strong>Stations</strong>: momentum is unstable. Avoid brand-new commitments; review and finalize ongoing work; double-check paperwork.</div>
        <div><strong>Retro overlaps</strong>: great for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.</div>
      </div>
    </div>
  );
}
