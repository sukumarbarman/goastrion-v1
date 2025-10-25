// goastrion-frontend/app/trade/TradeTab.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Calendar,
  Download,
  Share2,
  Clock,
  Filter,
  ChevronRight,
  Loader2,
} from "lucide-react";

/**
 * /trade — single-page UI (English-only)
 * Endpoints (same-origin by default):
 *   GET /api/trading/intraday-top/?asset=:id&date=YYYY-MM-DD
 *   GET /api/trading/sectors/?date=YYYY-MM-DD
 *   GET /api/trading/week/?asset=:id&start=YYYY-MM-DD   (returns best_day)
 *   GET /api/trading/day-summary/?date=YYYY-MM-DD&scope=all|indices|sectors|commodities|crypto&limit=5
 * If your backend is on a different origin, set NEXT_PUBLIC_API_BASE.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";
const IST = "Asia/Kolkata";

/* ----------------------------- Asset catalogs ----------------------------- */

const INDEX_ASSETS = [
  { id: "NIFTY_50", label: "NIFTY 50" },
  { id: "BANKNIFTY", label: "BANKNIFTY" },
];
const SECTOR_ASSETS = [
  { id: "NIFTY_BANK", label: "NIFTY BANK" },
  { id: "NIFTY_IT", label: "NIFTY IT" },
  { id: "NIFTY_METAL", label: "NIFTY METAL" },
  { id: "NIFTY_ENERGY", label: "NIFTY ENERGY" },
  { id: "NIFTY_FMCG", label: "NIFTY FMCG" },
  { id: "NIFTY_PHARMA", label: "NIFTY PHARMA" },
  { id: "NIFTY_REALTY", label: "NIFTY REALTY" },
  { id: "NIFTY_PSU_BANK", label: "NIFTY PSU BANK" },
  { id: "NIFTY_PVT_BANK", label: "NIFTY PRIVATE BANK" },
];
const COMMODITY_ASSETS = [
  { id: "MCX_CRUDE", label: "Crude Oil" },
  { id: "MCX_NATGAS", label: "Natural Gas" },
  { id: "MCX_GOLD", label: "Gold" },
  { id: "MCX_SILVER", label: "Silver" },
  { id: "BTC_USD", label: "Bitcoin" },
];

const ALL_ASSETS = [...INDEX_ASSETS, ...SECTOR_ASSETS, ...COMMODITY_ASSETS];
const SECTOR_IDS = new Set(SECTOR_ASSETS.map((a) => a.id));
const labelFor = (id: string) => ALL_ASSETS.find((a) => a.id === id)?.label ?? id;

/* --------------------------------- Types --------------------------------- */

type WindowT = {
  start: string;
  end: string;
  label: string;
  confidence: number;
  volatility: "low" | "med" | "high" | string;
  reasons: string[];
  caution: boolean;
  peak_score?: number;
};

type IntradayTopResponse = {
  asset: string;
  tz: string;
  session: { start: string; end: string };
  windows: WindowT[];
  engine_version: string;
};

type SectorsResponse = {
  date: string;
  tz: string;
  sectors: { asset: string; up: WindowT[]; down: WindowT[] }[];
};

type WeekResponse = {
  asset: string;
  tz: string;
  best_day?: {
    date: string;
    score: number;
    window: WindowT;
  } | null;
  days: { date: string; windows: WindowT[] }[];
};

type DaySummaryItem = {
  asset: string;
  score: number;
  start: string;
  end: string;
  label: string;
  confidence: number;
  volatility: string;
  reasons: string[];
  caution: boolean;
  peak_score?: number;
};
type DaySummaryResponse = {
  date: string;
  tz: string;
  scope: string;
  top_asset: DaySummaryItem | null;
  ranked: DaySummaryItem[];
};

// CSV row typing to avoid `any`
type CSVRow = Record<string, string | number | boolean | null | undefined>;

/* --------------------------- Utilities (client) --------------------------- */

const todayISO = () => new Date().toISOString().slice(0, 10);
const cls = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ");
const toPct = (hhmm: string, session: { start: string; end: string }) => {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const s = toMin(session.start);
  const e = toMin(session.end);
  const x = Math.min(Math.max(toMin(hhmm), s), e);
  return ((x - s) / (e - s)) * 100;
};
const csvEscape = (s: string) => (/[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s);
const downloadCSV = (filename: string, rows: CSVRow[]) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(csvEscape).join(",")].concat(
    rows.map((r) => headers.map((h) => csvEscape(String(r[h]))).join(","))
  );
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};

type Filters = { upOnly: boolean; downOnly: boolean; highVol: boolean; excludeRahu: boolean };
const parseFilters = (q: URLSearchParams): Filters => {
  const s = q.get("filters") || "";
  return {
    upOnly: s.includes("up"),
    downOnly: s.includes("down"),
    highVol: s.includes("highvol"),
    excludeRahu: s.includes("xrahu"),
  };
};
const encodeFilters = (f: Filters) => {
  const xs: string[] = [];
  if (f.upOnly) xs.push("up");
  if (f.downOnly) xs.push("down");
  if (f.highVol) xs.push("highvol");
  if (f.excludeRahu) xs.push("xrahu");
  return xs.join(",");
};
const applyFilters = (w: WindowT[], f: Filters) => {
  let y = w.slice();
  if (f.upOnly) y = y.filter((x) => /Up$/.test(x.label));
  if (f.downOnly) y = y.filter((x) => /Down$/.test(x.label));
  if (f.highVol) y = y.filter((x) => (x.volatility || "") === "high");
  if (f.excludeRahu) y = y.filter((x) => !x.reasons.includes("RAHU_KAAL"));
  return y;
};

// Scope helper for Day Summary
const assetScopeFor = (id: string): "indices" | "sectors" | "commodities" | "crypto" | "all" => {
  if (id.startsWith("MCX_")) return "commodities";
  if (id === "BTC_USD" || id.endsWith("_USD") || id.endsWith("_USDT")) return "crypto";
  if (id === "NIFTY_50" || id === "BANKNIFTY") return "indices";
  if (id.startsWith("NIFTY_")) return "sectors";
  return "all";
};

function useQueryState() {
  const q = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const [asset, setAsset] = useState(q.get("asset") || "NIFTY_50");
  const [date, setDate] = useState(q.get("date") || todayISO());
  const [section, setSection] = useState(q.get("section") || "intraday");
  const [filters, setFilters] = useState<Filters>(parseFilters(q));

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    params.set("asset", asset);
    params.set("date", date);
    params.set("section", section);
    const f = encodeFilters(filters);
    if (f) params.set("filters", f);
    else params.delete("filters");
    const next = `${location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", next);
  }, [asset, date, section, filters]);

  return { asset, setAsset, date, setDate, section, setSection, filters, setFilters };
}

function useFetch<T>(url: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!url) return;
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fetch(url, { signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then((j: T) => setData(j))
      .catch((e: unknown) => {
        // Ignore aborts; otherwise surface a readable error
        // DOMException check keeps TS happy in browser envs
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Unknown error");
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, error } as const;
}

/* -------------------------------- UI Bits -------------------------------- */

const Chip: React.FC<{
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ active, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={cls(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition",
      active
        ? "bg-cyan-500 text-slate-900 border-cyan-400 hover:bg-cyan-400"
        : "bg-black/30 text-slate-200 border-white/10 hover:bg-white/5"
    )}
  >
    {icon}
    {children}
  </button>
);
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cls("rounded-2xl border border-white/10 shadow-sm p-4 bg-[#0F142A] text-slate-200", className)}>
    {children}
  </div>
);
const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-3">
    <h2 className="text-xl font-semibold tracking-tight text-slate-100">{title}</h2>
    {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
  </div>
);

/* --------------------------------- Page ---------------------------------- */

export default function TradeTab() {
  const { asset, setAsset, date, setDate, section, setSection, filters, setFilters } = useQueryState();

  // API URLs
  const intradayURL = useMemo(
    () => `${API_BASE}/api/trading/intraday-top/?asset=${encodeURIComponent(asset)}&date=${encodeURIComponent(date)}`,
    [asset, date]
  );
  const sectorsURL = useMemo(() => `${API_BASE}/api/trading/sectors/?date=${encodeURIComponent(date)}`, [date]);
  const weekURL = useMemo(
    () => `${API_BASE}/api/trading/week/?asset=${encodeURIComponent(asset)}&start=${encodeURIComponent(date)}`,
    [asset, date]
  );

  // Fetches
  const { data: intraday, loading: loadingIntra, error: errorIntra } = useFetch<IntradayTopResponse>(intradayURL, [intradayURL]);
  const { data: sectors, loading: loadingSectors, error: errorSectors } = useFetch<SectorsResponse>(sectorsURL, [sectorsURL]);
  const { data: week, loading: loadingWeek, error: errorWeek } = useFetch<WeekResponse>(weekURL, [weekURL]);

  // Commodities/BTC panel
  const [cmbAsset, setCmbAsset] = useState<string>(COMMODITY_ASSETS[0].id);
  const cmbURL = useMemo(
    () => `${API_BASE}/api/trading/intraday-top/?asset=${encodeURIComponent(cmbAsset)}&date=${encodeURIComponent(date)}`,
    [cmbAsset, date]
  );
  const { data: cmb, loading: loadingCmb } = useFetch<IntradayTopResponse>(cmbURL, [cmbURL]);

  // Sectors filtering (if a sector is selected in Asset, show only that by default)
  const [showAllSectors, setShowAllSectors] = useState(false);
  const isSectorChosen = useMemo(() => SECTOR_IDS.has(asset), [asset]);
  useEffect(() => {
    if (isSectorChosen) setShowAllSectors(false);
  }, [isSectorChosen]);
  const visibleSectors = useMemo(() => {
    const list = sectors?.sectors ?? [];
    if (!isSectorChosen || showAllSectors) return list;
    return list.filter((s) => s.asset === asset);
  }, [sectors, isSectorChosen, showAllSectors, asset]);

  // Intraday filtered (show at most 2)
  const filteredIntraWindows = (intraday?.windows || [])
    .filter((w) => applyFilters([w], filters).length)
    .slice(0, 2);

  // Copy/export
  const copySummary = async () => {
    const lines: string[] = [];
    lines.push(`Asset: ${asset}`);
    lines.push(`Date: ${date}`);
    (filteredIntraWindows || []).forEach((w, i) => {
      lines.push(
        `#${i + 1} ${w.label} ${w.start}-${w.end} (Conf ${w.confidence}, Vol ${w.volatility}) Reasons: ${w.reasons.join(", ")}` +
          (w.caution ? " [Caution]" : "")
      );
    });
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch {
      /* ignore clipboard errors */
    }
  };

  const exportIntraCSV = () => {
    const rows: CSVRow[] = (intraday?.windows || []).map((w) => ({
      asset: intraday?.asset,
      date,
      start: w.start,
      end: w.end,
      label: w.label,
      confidence: w.confidence,
      volatility: w.volatility,
      reasons: w.reasons.join(";"),
      caution: w.caution,
      peak_score: w.peak_score,
    }));
    downloadCSV(`intraday_${asset}_${date}.csv`, rows);
  };
  const exportSectorsCSV = () => {
    const rows: CSVRow[] = [];
    for (const s of visibleSectors || []) {
      const push = (dir: "up" | "down", w: WindowT) =>
        rows.push({
          date: sectors?.date,
          asset: s.asset,
          direction: dir,
          start: w.start,
          end: w.end,
          label: w.label,
          confidence: w.confidence,
          volatility: w.volatility,
          reasons: w.reasons.join(";"),
          caution: w.caution,
        });
      s.up.forEach((w) => push("up", w));
      s.down.forEach((w) => push("down", w));
    }
    downloadCSV(`sectors_${date}${isSectorChosen && !showAllSectors ? `_${asset}` : ""}.csv`, rows);
  };
  const exportWeekCSV = () => {
    const rows: CSVRow[] = [];
    for (const d of week?.days || []) {
      for (const w of d.windows) {
        rows.push({
          asset: week?.asset,
          date: d.date,
          start: w.start,
          end: w.end,
          label: w.label,
          confidence: w.confidence,
          volatility: w.volatility,
          reasons: w.reasons.join(";"),
          caution: w.caution,
        });
      }
    }
    downloadCSV(`week_${asset}_${date}.csv`, rows);
  };

  // --------------------------- Day Summary (tab) ---------------------------
  const [daySummary, setDaySummary] = useState<DaySummaryResponse | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // scope selector (auto uses asset)
  const [summaryScope, setSummaryScope] = useState<"auto" | "all" | "indices" | "sectors" | "commodities" | "crypto">("auto");
  const computedScope = summaryScope === "auto" ? assetScopeFor(asset) : summaryScope;

  const fetchDaySummary = async () => {
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const r = await fetch(
        `${API_BASE}/api/trading/day-summary/?date=${encodeURIComponent(date)}&scope=${computedScope}&limit=5`
      );
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      const j: DaySummaryResponse = await r.json();
      setDaySummary(j);
    } catch (e: unknown) {
      setSummaryError(e instanceof Error ? e.message : "Failed to load summary");
    } finally {
      setLoadingSummary(false);
    }
  };

  // Auto-refresh when switching to the Summary tab or changing date/scope
  useEffect(() => {
    if (section === "summary") void fetchDaySummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, date, computedScope]);

  return (
    <div className="min-h-screen">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-40 backdrop-blur bg-black/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-col md:flex-row md:items-center gap-3">
          {/* Asset */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">Asset</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="rounded-xl border border-white/10 px-3 py-2 bg-black/30 text-slate-100 hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            >
              <optgroup label="Index">
                {INDEX_ASSETS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Sector (for Week/Intraday choose Index)">
                {SECTOR_ASSETS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Commodities & BTC (use panel below)">
                {COMMODITY_ASSETS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">Date</label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border border-white/10 px-3 py-2 bg-black/30 text-slate-100 hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm text-slate-400 hidden md:inline-flex items-center gap-1">
              <Filter className="w-4 h-4" />
              Filters
            </span>
            <Chip
              active={filters.upOnly}
              onClick={() =>
                setFilters({
                  ...filters,
                  upOnly: !filters.upOnly,
                  downOnly: filters.downOnly && !filters.upOnly ? false : filters.downOnly,
                })
              }
              icon={<ArrowUp className="w-4 h-4" />}
            >
              Up only
            </Chip>
            <Chip
              active={filters.downOnly}
              onClick={() =>
                setFilters({
                  ...filters,
                  downOnly: !filters.downOnly,
                  upOnly: filters.upOnly && !filters.downOnly ? false : filters.upOnly,
                })
              }
              icon={<ArrowDown className="w-4 h-4" />}
            >
              Down only
            </Chip>
            <Chip active={filters.highVol} onClick={() => setFilters({ ...filters, highVol: !filters.highVol })}>
              High-Vol
            </Chip>
            <Chip active={filters.excludeRahu} onClick={() => setFilters({ ...filters, excludeRahu: !filters.excludeRahu })}>
              Exclude Rahu
            </Chip>
          </div>

          {/* Session label & actions */}
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-400">
              Exchange: {intraday?.asset?.startsWith("MCX") ? "MCX" : intraday?.asset === "BTC_USD" ? "CRYPTO" : "NSE"} ({IST})
              {intraday?.session && <> • Session: {intraday.session.start}–{intraday.session.end}</>}
            </div>
            <button className="inline-flex items-center gap-2 text-sm px-3 py-2 border border-white/10 rounded-xl hover:bg-white/5" onClick={copySummary}>
              <Share2 className="w-4 h-4" />
              Copy
            </button>
            <button className="inline-flex items-center gap-2 text-sm px-3 py-2 border border-white/10 rounded-xl hover:bg-white/5" onClick={exportIntraCSV}>
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>

        {/* Section chips (added 'summary') */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-3 -mt-1 flex gap-2">
          {(["intraday", "sectors", "week", "summary", "cmbtc"] as const).map((sec) => (
            <Chip key={sec} active={section === sec} onClick={() => setSection(sec)}>
              {sec === "cmbtc" ? "Commodities & BTC" : sec === "summary" ? "Day Summary" : sec[0].toUpperCase() + sec.slice(1)}
            </Chip>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-8">
        {/* Intraday */}
        {section === "intraday" && (
          <section>
            <SectionTitle title="Intraday (Big-Move)" subtitle="Up to 2 strongest windows within session" />
            {loadingIntra && (
              <Card>
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              </Card>
            )}
            {errorIntra && (
              <Card>
                <div className="text-rose-300">{errorIntra}</div>
              </Card>
            )}
            {intraday && (
              <>
                <Card className="overflow-hidden">
                  <div className="text-xs text-slate-400 mb-2">
                    Timeline {intraday.session.start}–{intraday.session.end} (IST)
                  </div>
                  <div className="relative h-3 rounded-full bg-white/10">
                    {applyFilters(intraday.windows, filters).map((w, i) => {
                      const left = toPct(w.start, intraday.session);
                      const right = 100 - toPct(w.end, intraday.session);
                      const color = /Up$/.test(w.label)
                        ? "bg-emerald-400"
                        : /Down$/.test(w.label)
                        ? "bg-rose-400"
                        : "bg-slate-400";
                      return (
                        <div key={i} className="absolute h-3 rounded-full opacity-90" style={{ left: `${left}%`, right: `${right}%` }}>
                          <div className={cls("h-full w-full", color)} />
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {filteredIntraWindows.length === 0 && (
                    <Card className="md:col-span-2">
                      <div className="text-slate-400 text-sm">No Big-Move window detected for current filters.</div>
                    </Card>
                  )}
                  {filteredIntraWindows.map((w, i) => (
                    <Card key={i}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/Up$/.test(w.label) ? (
                            <ArrowUp className="w-5 h-5 text-emerald-400" />
                          ) : /Down$/.test(w.label) ? (
                            <ArrowDown className="w-5 h-5 text-rose-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-300" />
                          )}
                          <h3 className="font-semibold text-slate-100">{w.label}</h3>
                        </div>
                        <div className="text-sm text-slate-300 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {w.start}–{w.end}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-slate-300 flex flex-wrap items-center gap-3">
                        <span className="px-2 py-1 rounded-md bg-white/10">Confidence {w.confidence}</span>
                        <span className="px-2 py-1 rounded-md bg-white/10">Volatility {w.volatility}</span>
                        {w.caution && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/15 text-amber-300">
                            <AlertTriangle className="w-4 h-4" />
                            Caution
                          </span>
                        )}
                      </div>
                      {w.reasons?.length > 0 && <div className="mt-3 text-xs text-slate-400">Reasons: {w.reasons.join(", ")}</div>}
                    </Card>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* Sectors */}
        {section === "sectors" && (
          <section>
            <div className="flex items-start justify-between">
              <SectionTitle
                title={isSectorChosen && !showAllSectors ? `Sectors — ${labelFor(asset)}` : `Sectors (${date})`}
                subtitle="Top Up/Down windows per sector"
              />
              <div className="flex items-center gap-2">
                <Chip active={showAllSectors} onClick={() => setShowAllSectors((v) => !v)}>
                  {showAllSectors ? "Showing All" : "All Sectors"}
                </Chip>
                <button
                  onClick={exportSectorsCSV}
                  className="inline-flex items-center gap-2 text-sm px-3 py-2 border border-white/10 rounded-xl hover:bg-white/5"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
              </div>
            </div>
            {loadingSectors && (
              <Card>
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              </Card>
            )}
            {errorSectors && (
              <Card>
                <div className="text-rose-300">{errorSectors}</div>
              </Card>
            )}
            {sectors && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleSectors.map((s) => (
                  <Card key={s.asset}>
                    <div className="font-medium text-slate-100">{s.asset}</div>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Up</div>
                        {applyFilters(s.up, filters)
                          .slice(0, 3)
                          .map((w, i) => (
                            <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-emerald-500/10">
                              <span className="inline-flex items-center gap-1">
                                <ArrowUp className="w-4 h-4 text-emerald-400" />
                                {w.start}–{w.end}
                              </span>
                              <span className="text-slate-300">Conf {w.confidence}</span>
                            </div>
                          ))}
                        {applyFilters(s.up, filters).length === 0 && <div className="text-xs text-slate-500">—</div>}
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Down</div>
                        {applyFilters(s.down, filters)
                          .slice(0, 3)
                          .map((w, i) => (
                            <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-rose-500/10">
                              <span className="inline-flex items-center gap-1">
                                <ArrowDown className="w-4 h-4 text-rose-400" />
                                {w.start}–{w.end}
                              </span>
                              <span className="text-slate-300">Conf {w.confidence}</span>
                            </div>
                          ))}
                        {applyFilters(s.down, filters).length === 0 && <div className="text-xs text-slate-500">—</div>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Week */}
        {section === "week" && (
          <section>
            <div className="flex items-start justify-between">
              <SectionTitle title={`Week View (${asset})`} subtitle="Shows up to 2 windows per trading day" />
              <div className="flex items-center gap-2">
                <button
                  onClick={exportWeekCSV}
                  className="inline-flex items-center gap-2 text-sm px-3 py-2 border border-white/10 rounded-xl hover:bg-white/5"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
              </div>
            </div>

            {/* Best day (server-provided) */}
            {week?.best_day && (
              <Card className="mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Best day for sizeable move</div>
                    <div className="text-base font-medium text-slate-100">{week.best_day.date}</div>
                  </div>
                  <div className="text-sm text-slate-300">
                    {week.best_day.window?.label} • {week.best_day.window?.start}–{week.best_day.window?.end}
                    <span className="ml-2">Conf {week.best_day.window?.confidence}</span>
                    <span className="ml-2">Score {week.best_day.score}</span>
                  </div>
                </div>
              </Card>
            )}

            {loadingWeek && (
              <Card>
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              </Card>
            )}
            {errorWeek && (
              <Card>
                <div className="text-rose-300">{errorWeek}</div>
              </Card>
            )}
            {week && (
              <Card>
                <div className="divide-y divide-white/10">
                  {week.days.map((d) => (
                    <div key={d.date} className="py-3 flex items-center gap-3 flex-wrap">
                      <div className="w-28 shrink-0 text-sm font-medium text-slate-200">{d.date}</div>
                      <div className="flex flex-wrap gap-2">
                        {applyFilters(d.windows, filters)
                          .slice(0, 2)
                          .map((w, i) => (
                            <span
                              key={i}
                              className={cls(
                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border",
                                /Up$/.test(w.label)
                                  ? "bg-emerald-500/10 border-emerald-400/30"
                                  : /Down$/.test(w.label)
                                  ? "bg-rose-500/10 border-rose-400/30"
                                  : "bg-white/5 border-white/10"
                              )}
                            >
                              {/Up$/.test(w.label) ? (
                                <ArrowUp className="w-4 h-4 text-emerald-400" />
                              ) : /Down$/.test(w.label) ? (
                                <ArrowDown className="w-4 h-4 text-rose-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                              )}
                              {w.start}–{w.end} · Conf {w.confidence}
                            </span>
                          ))}
                        {applyFilters(d.windows, filters).length === 0 && (
                          <span className="text-xs text-slate-500">— no big move —</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </section>
        )}

        {/* Day Summary */}
        {section === "summary" && (
          <section>
            <div className="flex items-start justify-between">
              <SectionTitle title="Day Summary" subtitle="Most important assets for the selected date" />
              <div className="flex items-center gap-2">
                <select
                  value={summaryScope}
                  onChange={(e) =>
                    setSummaryScope(e.target.value as "auto" | "all" | "indices" | "sectors" | "commodities" | "crypto")
                  }
                  className="rounded-xl border border-white/10 px-3 py-2 bg-black/30 text-slate-100 hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="auto">Scope: Auto ({assetScopeFor(asset)})</option>
                  <option value="all">Scope: All</option>
                  <option value="indices">Scope: Indices</option>
                  <option value="sectors">Scope: Sectors</option>
                  <option value="commodities">Scope: Commodities</option>
                  <option value="crypto">Scope: Crypto</option>
                </select>
                <button
                  onClick={fetchDaySummary}
                  className="inline-flex items-center gap-2 text-sm px-3 py-2 border border-white/10 rounded-xl hover:bg-white/5"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loadingSummary && (
              <Card>
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading day summary…
                </div>
              </Card>
            )}
            {summaryError && (
              <Card>
                <div className="text-rose-300">{summaryError}</div>
              </Card>
            )}
            {daySummary && (
              <Card>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm text-slate-400">For date</div>
                    <div className="text-base font-medium text-slate-100">
                      {daySummary.date} (scope: {daySummary.scope})
                    </div>
                  </div>
                </div>

                {daySummary.top_asset ? (
                  <>
                    <div className="text-sm mb-3">
                      <span className="text-slate-400">Most important asset today: </span>
                      <span className="font-semibold">{daySummary.top_asset.asset}</span>
                      <span className="ml-2 text-slate-400">
                        ({daySummary.top_asset.label}, {daySummary.top_asset.start}–{daySummary.top_asset.end}, Conf{" "}
                        {daySummary.top_asset.confidence}, Score {daySummary.top_asset.score})
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {daySummary.ranked.map((r, i) => (
                        <div key={i} className="text-sm p-3 rounded-xl border border-white/10 bg-white/5">
                          <div className="font-medium text-slate-100">{r.asset}</div>
                          <div className="text-slate-300">
                            {r.label} • {r.start}–{r.end}
                          </div>
                          <div className="text-slate-400">
                            Conf {r.confidence} • Score {r.score} • Vol {r.volatility}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-400">No strong signals for this date.</div>
                )}
              </Card>
            )}
          </section>
        )}

        {/* Commodities & BTC */}
        {section === "cmbtc" && (
          <section>
            <SectionTitle title="Commodities & BTC" subtitle="Same intraday windows logic, 24×7 for BTC" />
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMODITY_ASSETS.map((a) => (
                <Chip key={a.id} active={cmbAsset === a.id} onClick={() => setCmbAsset(a.id)}>
                  {a.label}
                </Chip>
              ))}
            </div>
            {loadingCmb && (
              <Card>
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              </Card>
            )}
            {cmb && (
              <>
                <Card>
                  <div className="text-sm text-slate-300 mb-2">
                    Session: {cmb.session.start}–{cmb.session.end} (IST)
                  </div>
                  <div className="relative h-3 rounded-full bg-white/10">
                    {applyFilters(cmb.windows, filters).map((w, i) => {
                      const left = toPct(w.start, cmb.session);
                      const right = 100 - toPct(w.end, cmb.session);
                      const color = /Up$/.test(w.label)
                        ? "bg-emerald-400"
                        : /Down$/.test(w.label)
                        ? "bg-rose-400"
                        : "bg-slate-400";
                      return (
                        <div key={i} className="absolute h-3 rounded-full opacity-90" style={{ left: `${left}%`, right: `${right}%` }}>
                          <div className={cls("h-full w-full", color)} />
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {applyFilters(cmb.windows, filters)
                    .slice(0, 2)
                    .map((w, i) => (
                      <Card key={i}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/Up$/.test(w.label) ? (
                              <ArrowUp className="w-5 h-5 text-emerald-400" />
                            ) : /Down$/.test(w.label) ? (
                              <ArrowDown className="w-5 h-5 text-rose-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-slate-300" />
                            )}
                            <h3 className="font-semibold text-slate-100">{w.label}</h3>
                          </div>
                          <div className="text-sm text-slate-300 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {w.start}–{w.end}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-slate-300 flex flex-wrap items-center gap-3">
                          <span className="px-2 py-1 rounded-md bg-white/10">Confidence {w.confidence}</span>
                          <span className="px-2 py-1 rounded-md bg-white/10">Volatility {w.volatility}</span>
                          {w.caution && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/15 text-amber-300">
                              <AlertTriangle className="w-4 h-4" />
                              Caution
                            </span>
                          )}
                        </div>
                        {w.reasons?.length > 0 && <div className="mt-3 text-xs text-slate-400">Reasons: {w.reasons.join(", ")}</div>}
                      </Card>
                    ))}
                </div>
              </>
            )}
          </section>
        )}

        <p className="text-xs text-slate-500">
          Indicative timing windows based on predefined rules (Hora/Abhijit/Rahu etc.). Not investment advice. Times shown in IST.
        </p>
      </div>
    </div>
  );
}
