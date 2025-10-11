"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "../components/Container";
import AdSlot from "../components/AdSlot";
import { useI18n } from "../lib/i18n";

/** ---------- Load saved Create state ---------- */
type TzId = "IST" | "UTC";
type SavedState = {
  dob?: string; // "YYYY-MM-DD"
  tob?: string; // "HH:MM"
  tzId?: TzId;  // "IST" | "UTC"
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
  const ms =
    Date.UTC(Y, (M ?? 1) - 1, D ?? 1, h ?? 0, m ?? 0) - tzHours * 3_600_000;
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
  return Math.floor((b - a) / 86_400_000) + 1;
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

/** ---------- i18n helpers ---------- */
function replaceVars(str: string, vars?: Record<string, string | number>) {
  if (!vars) return str;
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(new RegExp(`{${k}}`, "g"), String(v)),
    str
  );
}
function useTf() {
  const { t } = useI18n();
  const tf = (k: string, fb: string, vars?: Record<string, string | number>) => {
    const got = t(k, vars);
    return got === k ? replaceVars(fb, vars) : got;
  };
  return { tf };
}

/** ---------- Chips ---------- */
type ChipTone = "green" | "amber" | "red";
function Chip({ tone, children, title }: { tone: ChipTone; children: React.ReactNode; title?: string }) {
  const styles: Record<ChipTone, string> = {
    green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    red:   "bg-rose-500/15 text-rose-300 border-rose-500/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border ${styles[tone]}`}
      title={title}
    >
      {children}
    </span>
  );
}

/** ---------- Expandable cells (localized) ---------- */
function StationsCell({ dates, tf }: { dates: string[]; tf: (k: string, fb: string, vars?: Record<string, string | number>) => string }) {
  const [open, setOpen] = useState(false);
  if (!dates || dates.length === 0) return <span>—</span>;
  const all = dates.map(fmtDate);
  const tip = tf("saturn.sadesati.tip.station.full", "Station day(s): momentum is unstable. Avoid brand-new commitments; review and finalize ongoing work; double-check paperwork.");
  if (dates.length <= 2) return <span title={tip}>{all.join(", ")}</span>;
  const more = dates.length - 2;
  return (
    <div className="relative inline-block" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="underline decoration-dotted underline-offset-2 hover:text-slate-100"
        title={tip}
        onClick={() => setOpen((v) => !v)}
      >
        {all.slice(0, 2).join(", ")}, {tf("saturn.sadesati.more", "+{n} more", { n: more })}
      </button>
      {open && (
        <div
          className="absolute z-20 mt-1 w-max max-w-[420px] rounded-lg border border-white/15 bg-black/90 p-3 text-xs text-slate-200 shadow-lg backdrop-blur"
          role="dialog"
        >
          <div className="mb-1 font-medium text-slate-100">{tf("saturn.sadesati.all_station_dates", "All station dates")}</div>
          <div className="space-y-1">{all.map((d, i) => <div key={i} className="whitespace-nowrap">{d}</div>)}</div>
          <div className="mt-2 text-[11px] text-slate-400">
            {tf("saturn.sadesati.tip.station.short","Tip: Avoid brand-new commitments; finalize ongoing work; double-check paperwork.")}
          </div>
        </div>
      )}
    </div>
  );
}
function RetroCell({ spans, tf }: { spans: RetroSpan[]; tf: (k: string, fb: string, vars?: Record<string, string | number>) => string }) {
  const [open, setOpen] = useState(false);
  if (!spans || spans.length === 0) return <span>—</span>;
  const all = spans.map((s) => `${fmtDate(s.start)} – ${fmtDate(s.end)}`);
  const tip = tf("saturn.sadesati.tip.retro.full", "Retrograde span: great for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.");
  if (spans.length <= 2) return <span title={tip}>{all.join(", ")}</span>;
  const more = spans.length - 2;
  return (
    <div className="relative inline-block" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="underline decoration-dotted underline-offset-2 hover:text-slate-100"
        title={tip}
        onClick={() => setOpen((v) => !v)}
      >
        {all.slice(0, 2).join(", ")}, {tf("saturn.sadesati.more", "+{n} more", { n: more })}
      </button>
      {open && (
        <div
          className="absolute z-20 mt-1 w-max max-w-[520px] rounded-lg border border-white/15 bg-black/90 p-3 text-xs text-slate-200 shadow-lg backdrop-blur"
          role="dialog"
        >
          <div className="mb-1 font-medium text-slate-100">{tf("saturn.sadesati.all_retro_overlaps", "All retro overlaps")}</div>
          <div className="space-y-1">{all.map((t, i) => <div key={i} className="whitespace-nowrap">{t}</div>)}</div>
          <div className="mt-2 text-[11px] text-slate-400">
            {tf("saturn.sadesati.tip.retro.short","Tip: Best for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.")}
          </div>
        </div>
      )}
    </div>
  );
}

/** ---------- Phase label ---------- */
function phasePretty(phase: SadeSatiWindow["phase"], tf: (k: string, fb: string) => string) {
  if (phase === "start") return tf("saturn.sadesati.phase.start", "start — First Dhaiyya");
  if (phase === "peak")  return tf("saturn.sadesati.phase.peak", "peak — Second Dhaiyya (on Moon sign)");
  return tf("saturn.sadesati.phase.end", "end — Third Dhaiyya");
}

/** ---------- Page ---------- */
export default function SaturnPage() {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<SaturnOverviewResp | null>(null);
  const [mode, setMode] = useState<"preview" | "full">("preview");
  const { tf } = useTf();

  async function fetchSaturn(params: { horizonYears: number; anchor: "today" | "birth" }) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error(tf("saturn.sadesati.error.create_first", "Please create your birth chart first (Create tab)."));
    const st = JSON.parse(raw) as SavedState;
    if (!st.dob || !st.tob || !st.tzId || !st.lat || !st.lon) {
      throw new Error(tf("saturn.sadesati.error.missing_birth", "Missing birth details. Please re-generate your chart."));
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
          anchor: params.anchor,
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
        setErr(e instanceof Error ? e.message : tf("saturn.sadesati.error.fetch", "Failed to fetch Saturn overview."));
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
      setErr(e instanceof Error ? e.message : tf("saturn.sadesati.error.fetch", "Failed to fetch Saturn overview."));
    } finally {
      setLoading(false);
    }
  }

  // CSV export
  function toCsvRow(vals: (string | number)[]) {
    return vals.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
  }
  function downloadCsv() {
    const wins = (resp?.sade_sati?.windows ?? []).sort((a, b) => (a.start < b.start ? -1 : 1));
    const rows = [
      toCsvRow([tf("saturn.sadesati.col.phase","Phase"), tf("saturn.sadesati.col.start","Start"), tf("saturn.sadesati.col.end","End"), tf("saturn.sadesati.col.duration","Duration(d)"), tf("saturn.sadesati.col.moon_sign","Moon Sign"), tf("saturn.sadesati.col.saturn_sign","Saturn Sign"), tf("saturn.sadesati.col.stations","Stations"), tf("saturn.sadesati.col.retros","Retro overlaps"), "Note"]),
      ...wins.map((w) =>
        toCsvRow([
          w.phase, w.start, w.end, w.duration_days ?? "",
          w.moon_sign ?? "", w.saturn_sign ?? "",
          (w.stations ?? []).join(" | "),
          (w.retro_overlaps ?? []).map((s) => `${s.start}–${s.end}`).join(" | "),
          w.note ?? "",
        ])
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sade_sati_windows_${mode}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const rows = useMemo(() => {
    if (!resp?.sade_sati?.windows) return [];
    const sorted = [...resp.sade_sati.windows].sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
    return sorted.map((w) => {
      const duration = typeof w.duration_days === "number" ? `${w.duration_days}d` : `${daysDiffInclusive(w.start, w.end)}d`;
      const stations = w.stations ?? w.caution_days ?? [];
      const retros = w.retro_overlaps ?? [];
      const derivedSeverity: ChipTone = (stations?.length ?? 0) > 0 ? "red" : (retros?.length ?? 0) > 0 ? "amber" : "green";
      const severity: ChipTone = (w.severity as ChipTone) ?? derivedSeverity;
      const chip = w.chip ?? (severity === "green" ? tf("saturn.sadesati.chip.clear", "Clear flow") : severity === "amber" ? tf("saturn.sadesati.chip.review", "Review/Revise") : tf("saturn.sadesati.chip.caution", "Caution day(s)"));
      const hasStations = (stations?.length ?? 0) > 0;
      const hasRetros = (retros?.length ?? 0) > 0;
      const chipTitle =
        hasStations && hasRetros
          ? tf("saturn.sadesati.tip.combo", "Stations: momentum is unstable—avoid brand-new commitments; finalize ongoing work; double-check paperwork.\nRetro overlap: great for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.")
          : hasStations
          ? tf("saturn.sadesati.tip.station.full", "Station day(s): momentum is unstable. Avoid brand-new commitments; review and finalize ongoing work; double-check paperwork.")
          : hasRetros
          ? tf("saturn.sadesati.tip.retro.full", "Retro overlap: great for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.")
          : tf("saturn.sadesati.tip.clear", "Clear flow.");

      return {
        key: `${w.start}-${w.end}-${w.phase}`,
        phaseLabel: phasePretty(w.phase, tf),
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
  }, [resp, tf]);

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
              <td key={j} className="py-2 px-3">
                <div className="h-4 w-28 bg-white/10 rounded" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }

  return (
    <Container>
      {/* Title + helper text */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          {tf("saturn.sadesati.title", "Saturn · Sade Sati")}
        </h1>
        <p className="text-slate-400">
          {mode === "preview"
            ? tf("saturn.sadesati.fast_preview", "Fast preview (20 yrs from today). Load full history when ready.")
            : tf("saturn.sadesati.full_view_helper", "Full history (~100 yrs from birth).")}
        </p>
      </div>

      {/* About (inline) */}
      <div className="mb-5 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5 h-5 w-5 rounded-full border border-cyan-400/40 bg-cyan-500/15" aria-hidden />
          <div>
            <div className="text-slate-100 font-semibold">
              {tf("saturn.sadesati.about.title", "What is Sade Sati?")}
            </div>
            <p className="text-slate-300 text-sm mt-1">
              {tf("saturn.sadesati.about.blurb",
                "Sade Sati is a ~7½-year period when Saturn transits around your Moon sign: the sign before it, the sign itself, and the sign after it. It is often experienced in three phases—start, peak, and end—each with a different flavor of lessons, responsibilities, and pressure. Use this view to see the spans and critical dates at a glance."
              )}
            </p>
            <div className="mt-2">
              <div className="text-slate-200 text-sm font-medium">
                {tf("saturn.sadesati.about.termsTitle", "Key terms")}
              </div>
              <ul className="mt-1 space-y-1.5 text-xs text-slate-300">
                <li><span className="font-medium">{tf("saturn.sadesati.phase.start", "start — First Dhaiyya")}</span>
                  <span className="ml-2">{tf("saturn.sadesati.about.terms.start","Saturn in the sign before your Moon sign—sets the stage; more preparation and groundwork.")}</span></li>
                <li><span className="font-medium">{tf("saturn.sadesati.phase.peak", "peak — Second Dhaiyya (on Moon sign)")}</span>
                  <span className="ml-2">{tf("saturn.sadesati.about.terms.peak","Saturn over your Moon sign—core lessons, higher pressure, and restructuring.")}</span></li>
                <li><span className="font-medium">{tf("saturn.sadesati.phase.end", "end — Third Dhaiyya")}</span>
                  <span className="ml-2">{tf("saturn.sadesati.about.terms.end","Saturn in the sign after your Moon sign—consolidation and stabilization.")}</span></li>
                <li><span className="font-medium">{tf("saturn.sadesati.foot.station.label","Stations")}</span>
                  <span className="ml-2">{tf("saturn.sadesati.about.terms.station","Saturn appears to pause (turning retrograde/direct). Momentum can be unstable—avoid brand-new commitments; finalize ongoing work.")}</span></li>
                <li><span className="font-medium">{tf("saturn.sadesati.foot.retro.label","Retro overlaps")}</span>
                  <span className="ml-2">{tf("saturn.sadesati.about.terms.retro","Best for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.")}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {err && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 px-3 py-2 text-sm mb-4">
          {err}
        </div>
      )}

      {/* Mode switch */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400">{tf("saturn.sadesati.view", "View")}:</span>
        <button
          onClick={async () => {
            if (mode === "preview") return;
            setMode("preview");
            try {
              setErr(null); setLoading(true);
              const j = await fetchSaturn({ horizonYears: 20, anchor: "today" });
              setResp(j);
            } catch (e) {
              setErr(e instanceof Error ? e.message : tf("saturn.sadesati.error.fetch", "Failed to fetch Saturn overview."));
            } finally {
              setLoading(false);
            }
          }}
          className={[
            "rounded-full px-3 py-1 border",
            mode === "preview"
              ? "border-white/40 bg-white/10 text-white"
              : "border-white/15 bg-white/5 text-slate-300 hover:border-white/25",
          ].join(" ")}
          title={tf("saturn.sadesati.view.preview.tip", "Preview range from today")}
        >
          {tf("saturn.sadesati.view.preview", "Preview: 20 yrs from today")}
        </button>

        <button
          onClick={loadFull}
          className={[
            "rounded-full px-3 py-1 border",
            mode === "full"
              ? "border-white/40 bg-white/10 text-white"
              : "border-white/15 bg-white/5 text-slate-300 hover:border-white/25",
          ].join(" ")}
          title={tf("saturn.sadesati.view.full.tip", "Full history from birth")}
        >
          {tf("saturn.sadesati.view.full", "Show full (100 yrs from birth)")}
        </button>

        <button
          onClick={downloadCsv}
          className="ml-auto rounded-full px-3 py-1 border border-white/20 bg-white/5 text-slate-200 hover:border-white/40"
          title={tf("saturn.sadesati.export.tip", "Export visible rows to CSV")}
        >
          {tf("saturn.sadesati.export", "Export CSV")}
        </button>
      </div>

      {/* Ad: below the main controls (good viewability) */}
      <div className="mb-6">
        <AdSlot slot="6781603832" minHeight={300} />
      </div>

      {resp && (
        <div className="mb-3 text-sm text-slate-400">
          {tf("saturn.sadesati.meta.anchor","Anchor")}: <span className="text-slate-200">{resp.anchor}</span> · {tf("saturn.sadesati.meta.start","Start")}:{" "}
          <span className="text-slate-200">{fmtDate(resp.start_date)}</span>
          {horizonYears ? <> · {tf("saturn.sadesati.meta.horizon","Horizon")}: <span className="text-slate-200">{horizonYears} {tf("saturn.sadesati.years","yrs")}</span></> : null}
        </div>
      )}

      {/* Global caution banner */}
      {resp && (
        <div className="mb-4">
          {globalCaution.length > 0 ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-rose-200 text-xs">
              <span className="font-medium">{tf("saturn.sadesati.caution_dates", "Caution dates")}</span>
              <span className="text-rose-100/80">
                {globalCaution.slice(0, 3).map(fmtDate).join(", ")}
                {globalCaution.length > 3 ? `, ${tf("saturn.sadesati.more", "+{n} more", { n: globalCaution.length - 3 })}` : ""}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-200 text-xs">
              <span className="font-medium">{tf("saturn.sadesati.no_station_in_view", "No station days in view")}</span>
            </div>
          )}
        </div>
      )}

      <div className="overflow-auto rounded-2xl border border-white/10">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="bg-white/5 text-slate-300 sticky top-0 z-10">
            <tr>
              <th className="text-left py-2 px-3" title={tf("saturn.sadesati.tip.col.phase","Phase of Sade Sati window and overall flow chip.")}>{tf("saturn.sadesati.col.phase","Phase")}</th>
              <th className="text-left py-2 px-3" title={tf("saturn.sadesati.tip.col.start","Start date of the window.")}>{tf("saturn.sadesati.col.start","Start")}</th>
              <th className="text-left py-2 px-3" title={tf("saturn.sadesati.tip.col.end","End date of the window.")}>{tf("saturn.sadesati.col.end","End")}</th>
              <th className="text-left py-2 px-3" title={tf("saturn.sadesati.tip.col.duration","Total span (in days) for this window.")}>{tf("saturn.sadesati.col.duration","Duration")}</th>
              <th className="text-left py-2 px-3" title={tf("saturn.sadesati.tip.col.moon_sign","Your natal Moon sign relevant to this window.")}>{tf("saturn.sadesati.col.moon_sign","Moon Sign")}</th>
              <th className="text-left py-2 px-3" title={tf("saturn.sadesati.tip.col.saturn_sign","Sign where Saturn is transiting during this window.")}>{tf("saturn.sadesati.col.saturn_sign","Saturn Sign")}</th>
              <th className="text-left py-2 px-3" title={tf("saturn.sadesati.tip.col.stations","Dates when Saturn is stationary (turning retrograde/direct).")}>{tf("saturn.sadesati.col.stations","Stations")}</th>
              <th className="text-left py-2 px-3" title={tf("saturn.sadesati.tip.col.retros","Periods overlapping Saturn retrograde.")}>{tf("saturn.sadesati.col.retros","Retro overlaps")}</th>
            </tr>
          </thead>

          {loading && !resp ? (
            <SkeletonRows />
          ) : rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={8} className="py-6 px-3 text-center text-slate-400">
                  {tf("saturn.sadesati.empty","No Sade Sati windows in the selected horizon.")}
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
                  <td className="py-2 px-3"><StationsCell dates={r.stations} tf={tf} /></td>
                  <td className="py-2 px-3"><RetroCell spans={r.retros} tf={tf} /></td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Ad: end-of-page placement */}
      <div className="mt-6">
        <AdSlot slot="7610743428" minHeight={280} />
      </div>

      {/* Footnotes */}
      <div className="mt-3 text-xs text-slate-500 leading-5">
        <div><strong>{tf("saturn.sadesati.foot.station.label","Stations")}</strong>: {tf("saturn.sadesati.foot.station.text","Momentum is unstable. Avoid brand-new commitments; review and finalize ongoing work; double-check paperwork.")}</div>
        <div><strong>{tf("saturn.sadesati.foot.retro.label","Retro overlaps")}</strong>: {tf("saturn.sadesati.foot.retro.text","Great for reviews, fixes, and renegotiations. Expect rework—add buffer to timelines.")}</div>
      </div>
    </Container>
  );
}
