"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "../components/Container";

/** ---------- Load saved Create state ---------- */
type TzId = "IST" | "UTC";
type SavedState = {
  dob?: string;   // "YYYY-MM-DD"
  tob?: string;   // "HH:MM"
  tzId?: TzId;    // "IST" | "UTC"
  lat?: string;
  lon?: string;
};
const STORAGE_KEY = "ga_create_state_v1";
const SNAPSHOT_KEY = "ga_saturn_overview_snapshot_v1";

/** ---------- Timezone helpers (Safari-safe) ---------- */
const TZ_HOURS: Record<TzId, number> = { IST: 5.5, UTC: 0.0 };
function localCivilToUtcIso(dob: string, tob: string, tzId: TzId) {
  const [Y, M, D] = dob.split("-").map(Number);
  const [h, m] = tob.split(":").map(Number);
  const tzHours = TZ_HOURS[tzId] ?? 0;
  const ms = Date.UTC(Y, (M ?? 1) - 1, D ?? 1, (h ?? 0), (m ?? 0)) - tzHours * 3600_000;
  const iso = new Date(ms).toISOString();
  if (!iso || Number.isNaN(ms)) throw new Error("Bad datetime");
  return { dtIsoUtc: iso, tz: tzId === "IST" ? "Asia/Kolkata" : "UTC" };
}

/** ---------- Small display helpers ---------- */
const MON3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(iso: string) {
  if (!iso) return "—";
  const [Y, M, D] = iso.split("-").map(Number);
  if (!Y || !M || !D) return iso;
  return `${String(D).padStart(2, "0")} ${MON3[(M || 1) - 1]} ${Y}`;
}
function daysDiffInclusive(aISO: string, bISO: string) {
  if (!aISO || !bISO) return 0;
  const a = new Date(aISO + "T00:00:00Z").getTime();
  const b = new Date(bISO + "T00:00:00Z").getTime();
  return Math.floor((b - a) / 86400000) + 1;
}

/** ---------- Backend types ---------- */
type RetroSpan = { start: string; end: string };
type SadeSatiWindow = {
  start: string; end: string; phase: "start" | "peak" | "end";
  moon_sign?: string; saturn_sign?: string;
  stations?: string[]; retro_overlaps?: RetroSpan[]; caution_days?: string[];
  duration_days?: number; good_day_ratio?: number; good_sample_dates?: string[];
  badge?: "clear" | "review" | "caution"; severity?: "green" | "amber" | "red"; chip?: string; note?: string;
};
type SaturnOverviewResp = {
  anchor: string; start_date: string; horizon_days: number;
  sade_sati: { phase: "none" | "start" | "peak" | "end"; windows: SadeSatiWindow[]; caution_days?: string[]; };
  stations?: { date: string; type?: "station" }[]; retrograde?: RetroSpan[]; error?: string;
};

/** ---------- Chips ---------- */
type ChipTone = "green" | "amber" | "red";
function Chip({ tone, children, title }: { tone: ChipTone; children: React.ReactNode; title?: string }) {
  const styles: Record<ChipTone, string> = {
    green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    red:   "bg-rose-500/15 text-rose-300 border-rose-500/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border ${styles[tone]}`} title={title}>
      {children}
    </span>
  );
}

/** ---------- Expandable cells ---------- */
function StationsCell({ dates }: { dates: string[] }) {
  const [open, setOpen] = useState(false);
  if (!dates || dates.length === 0) return <span>—</span>;
  const all = dates.map(fmtDate);
  if (dates.length <= 2) {
    return (
      <span title="Station day(s): momentum is unstable. Avoid brand-new commitments; review and finalize ongoing work; double-check paperwork.">
        {all.join(", ")}
      </span>
    );
  }
  const more = dates.length - 2;
  return (
    <div className="relative inline-block" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="underline decoration-dotted underline-offset-2 hover:text-slate-100"
        title="Station day(s): momentum is unstable. Avoid brand-new commitments; review and finalize ongoing work; double-check paperwork."
        onClick={() => setOpen(v => !v)}
      >
        {all.slice(0, 2).join(", ")}, +{more} more
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-max max-w-[420px] rounded-lg border border-white/15 bg-black/90 p-3 text-xs text-slate-200 shadow-lg backdrop-blur" role="dialog">
          <div className="mb-1 font-medium text-slate-100">All station dates</div>
          <div className="space-y-1">{all.map((d, i) => <div key={i} className="whitespace-nowrap">{d}</div>)}</div>
          <div className="mt-2 text-[11px] text-slate-400">Tip: Avoid brand-new commitments; finalize ongoing work; double-check paperwork.</div>
        </div>
      )}
    </div>
  );
}
function RetroCell({ spans }: { spans: RetroSpan[] }) {
  const [open, setOpen] = useState(false);
  if (!spans || spans.length === 0) return <span>—</span>;
  const all = spans.map(s => `${fmtDate(s.start)} – ${fmtDate(s.end)}`);
  const tip = "Retrograde span: great for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.";
  if (spans.length <= 2) return <span title={tip}>{all.join(", ")}</span>;
  const more = spans.length - 2;
  return (
    <div className="relative inline-block" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="underline decoration-dotted underline-offset-2 hover:text-slate-100"
        title={tip}
        onClick={() => setOpen(v => !v)}
      >
        {all.slice(0, 2).join(", ")}, +{more} more
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-max max-w-[520px] rounded-lg border border-white/15 bg-black/90 p-3 text-xs text-slate-200 shadow-lg backdrop-blur" role="dialog">
          <div className="mb-1 font-medium text-slate-100">All retro overlaps</div>
          <div className="space-y-1">{all.map((t, i) => <div key={i} className="whitespace-nowrap">{t}</div>)}</div>
          <div className="mt-2 text-[11px] text-slate-400">Tip: Best for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.</div>
        </div>
      )}
    </div>
  );
}

/** ---------- Phase label ---------- */
function phasePretty(phase: SadeSatiWindow["phase"]) {
  if (phase === "start") return "start — First Dhaiyya";
  if (phase === "peak") return "peak — Second Dhaiyya (on Moon sign)";
  return "end — Third Dhaiyya";
}

/** ---------- Page ---------- */
export default function SaturnPage() {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<SaturnOverviewResp | null>(null);
 // const [snapshot, setSnapshot] = useState<SaturnOverviewResp | null>(null);

  // Which dataset are we showing?
  // "preview" = 20 yrs from today (fast), "full" = 100 yrs from birth.
  const [mode, setMode] = useState<"preview" | "full">("preview");



  // Helpers
  async function fetchSaturn(params: { horizonYears: number; anchor: "today" | "birth" }) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("Please create your birth chart first (Create tab).");
    const st = JSON.parse(raw) as SavedState;
    if (!st.dob || !st.tob || !st.tzId || !st.lat || !st.lon) {
      throw new Error("Missing birth details. Please re-generate your chart.");
    }
    const { dtIsoUtc, tz } = localCivilToUtcIso(st.dob, st.tob, st.tzId as TzId);

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 30_000);

    try {
      const r = await fetch("/api/saturn/overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          datetime: dtIsoUtc,
          lat: Number(st.lat),
          lon: Number(st.lon),
          tz,
          anchor: params.anchor,           // "today" or "birth"
          horizon_years: params.horizonYears,
          include: { sade_sati: true, stations: true, retro: true },
          max_windows: 12,
        }),
      });
      const j = (await r.json()) as SaturnOverviewResp;
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      try { localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(j)); } catch {}
      return j;
    } finally {
      clearTimeout(timeout);
    }
  }

  // Initial fast preview: 20 yrs from today
  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const j = await fetchSaturn({ horizonYears: 20, anchor: "today" });
        setResp(j);
        setMode("preview");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to fetch Saturn overview.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function loadFull() {
    try {
      setErr(null);
      setLoading(true);
      setMode("full");
      const j = await fetchSaturn({ horizonYears: 100, anchor: "birth" });
      setResp(j);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to fetch Saturn overview.");
    } finally {
      setLoading(false);
    }
  }

  // CSV export (keeps Note even if not shown)
  function toCsvRow(vals: (string|number)[]) {
    return vals.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",");
  }
  function downloadCsv() {
    const wins = (resp?.sade_sati?.windows ?? []).sort((a,b)=>a.start<b.start?-1:1);
    const rows = [
      toCsvRow(["Phase","Start","End","Duration(d)","Moon Sign","Saturn Sign","Stations","Retro overlaps","Note"]),
      ...wins.map(w => toCsvRow([
        w.phase, w.start, w.end, w.duration_days ?? "",
        w.moon_sign ?? "", w.saturn_sign ?? "",
        (w.stations ?? []).join(" | "),
        (w.retro_overlaps ?? []).map(s=>`${s.start}–${s.end}`).join(" | "),
        w.note ?? ""
      ])),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sade_sati_windows_${mode}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const rows = useMemo(() => {
    if (!resp?.sade_sati?.windows) return [];
    const sorted = [...resp.sade_sati.windows].sort((a, b) =>
      a.start < b.start ? -1 : a.start > b.start ? 1 : 0
    );
    return sorted.map((w) => {
      const duration =
        typeof w.duration_days === "number" ? `${w.duration_days}d` : `${daysDiffInclusive(w.start, w.end)}d`;
      const stations = w.stations ?? w.caution_days ?? [];
      const retros = w.retro_overlaps ?? [];
      const derivedSeverity: ChipTone =
        (stations?.length ?? 0) > 0 ? "red" : (retros?.length ?? 0) > 0 ? "amber" : "green";
      const severity: ChipTone = (w.severity as ChipTone) ?? derivedSeverity;
      const chip = w.chip
        ?? (severity === "green" ? "Clear flow" : severity === "amber" ? "Review/Revise" : "Caution day(s)");
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

      return {
        key: `${w.start}-${w.end}-${w.phase}`,
        phaseLabel: phasePretty(w.phase),
        start: fmtDate(w.start),
        end: fmtDate(w.end),
        duration,
        moonSign: w.moon_sign || "—",
        saturnSign: w.saturn_sign || "—",
        stations: stations ?? [],
        retros: retros ?? [],
        severity,
        chip,
        chipTitle,
      };
    });
  }, [resp]);

  const globalCaution = resp?.sade_sati?.caution_days ?? [];
  const horizonYears = useMemo(() => {
    const d = resp?.horizon_days ?? 0;
    if (!d) return null;
    return Math.round(d / 365.25);
  }, [resp]);

  /** simple skeleton rows */
  function SkeletonRows() {
    return (
      <tbody>
        {Array.from({ length: 4 }).map((_, i) => (
          <tr key={i} className="border-t border-white/10 animate-pulse">
            {Array.from({ length: 8 }).map((__, j) => (
              <td key={j} className="py-2 px-3"><div className="h-4 w-28 bg-white/10 rounded" /></td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Saturn · Sade Sati</h1>
        <p className="text-slate-400">Fast preview (20 yrs from today). Load full history when ready.</p>
      </div>

      {err && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 px-3 py-2 text-sm mb-4">
          {err}
        </div>
      )}

      {/* Mode switch */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400">View:</span>
        <button
          onClick={async () => {
            if (mode === "preview") return;
            setMode("preview");
            try {
              setErr(null); setLoading(true);
              const j = await fetchSaturn({ horizonYears: 20, anchor: "today" });
              setResp(j);
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Failed to fetch Saturn overview.");
            } finally {
              setLoading(false);
            }
          }}
          className={[
            "rounded-full px-3 py-1 border",
            mode === "preview" ? "border-white/40 bg-white/10 text-white" : "border-white/15 bg-white/5 text-slate-300 hover:border-white/25",
          ].join(" ")}
          title="Show a quick 20-year preview starting today"
        >
          Preview: 20 yrs from today
        </button>

        <button
          onClick={loadFull}
          className={[
            "rounded-full px-3 py-1 border",
            mode === "full" ? "border-white/40 bg-white/10 text-white" : "border-white/15 bg-white/5 text-slate-300 hover:border-white/25",
          ].join(" ")}
          title="Compute full 100-year range from birth (slower)"
        >
          Show full (100 yrs from birth)
        </button>

        <button
          onClick={downloadCsv}
          className="ml-auto rounded-full px-3 py-1 border border-white/20 bg-white/5 text-slate-200 hover:border-white/40"
          title="Export the table as CSV"
        >
          Export CSV
        </button>
      </div>

      {resp && (
        <div className="mb-3 text-sm text-slate-400">
          Anchor: <span className="text-slate-200">{resp.anchor}</span> · Start:{" "}
          <span className="text-slate-200">{fmtDate(resp.start_date)}</span>
          {horizonYears ? <> · Horizon: <span className="text-slate-200">{horizonYears} yrs</span></> : null}
        </div>
      )}

      {/* Global caution banner */}
      {resp && (
        <div className="mb-4">
          {globalCaution.length > 0 ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-rose-200 text-xs">
              <span className="font-medium">Caution dates</span>
              <span className="text-rose-100/80">
                {globalCaution.slice(0, 3).map(fmtDate).join(", ")}
                {globalCaution.length > 3 ? `, +${globalCaution.length - 3} more` : ""}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-200 text-xs">
              <span className="font-medium">No station days in view</span>
            </div>
          )}
        </div>
      )}

      <div className="overflow-auto rounded-2xl border border-white/10">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="bg-white/5 text-slate-300 sticky top-0 z-10">
            <tr>
              <th className="text-left py-2 px-3">Phase</th>
              <th className="text-left py-2 px-3">Start</th>
              <th className="text-left py-2 px-3">End</th>
              <th className="text-left py-2 px-3">Duration</th>
              <th className="text-left py-2 px-3">Moon Sign</th>
              <th className="text-left py-2 px-3">Saturn Sign</th>
              <th className="text-left py-2 px-3">Stations</th>
              <th className="text-left py-2 px-3">Retro overlaps</th>
            </tr>
          </thead>

        {loading && !resp ? (
          <SkeletonRows />
        ) : rows.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={8} className="py-6 px-3 text-center text-slate-400">
                No Sade Sati windows in the selected horizon.
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-white/10">
                <td className="py-2 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-100">{r.phaseLabel}</span>
                    <Chip tone={r.severity} title={r.chipTitle}>{r.chip}</Chip>
                  </div>
                </td>
                <td className="py-2 px-3">{r.start}</td>
                <td className="py-2 px-3">{r.end}</td>
                <td className="py-2 px-3">{r.duration}</td>
                <td className="py-2 px-3">{r.moonSign}</td>
                <td className="py-2 px-3">{r.saturnSign}</td>
                <td className="py-2 px-3"><StationsCell dates={r.stations} /></td>
                <td className="py-2 px-3"><RetroCell spans={r.retros} /></td>
              </tr>
            ))}
          </tbody>
        )}
        </table>
      </div>

      {/* Footnotes */}
      <div className="mt-3 text-xs text-slate-500 leading-5">
        <div><strong>Stations</strong>: momentum is unstable. Avoid brand-new commitments; review and finalize ongoing work; double-check paperwork.</div>
        <div><strong>Retro overlaps</strong>: great for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.</div>
      </div>
    </Container>
  );
}
