// goastrion-frontend/app/components/CreateChartClient.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import Container from "./Container";
import ShubhDinInline from "./shubhdin/ShubhDinInline";
import AdSlot from "./AdSlot";

import { useI18n } from "../lib/i18n";
import { dictionaries } from "../lib/locales/dictionaries";
import type { DashaTimeline } from "./dasha/types"; // types only
import { saveBirth } from "@/app/lib/birthStore";
import { useAuth } from "@/app/context/AuthContext";

/* -------------------- Types used locally -------------------- */
type Dictionaries = typeof dictionaries;
type LocaleKey = keyof Dictionaries;
type LocaleDict = Dictionaries[LocaleKey] & {
  zodiac?: string[];
  nakshatras?: string[];
};

type ApiResp = {
  svg: string;
  summary: Record<string, string>;
  meta: Record<string, unknown>;
  error?: string;
};

type TzId = "IST" | "UTC";
type PersistedState = {
  dob: string;
  tob: string;
  tzId: TzId;
  place: string;
  lat: string;
  lon: string;
  svg: string | null;
  summary: Record<string, string> | null;
  vimshottari: DashaTimeline | null;
  savedAt?: string; // ISO
};

/* -------------------- Config -------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

/* -------------------- Persistence -------------------- */
const STORAGE_KEY = "ga_create_state_v1";

function safeLoad(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function safeSave(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

const IANA_BY_TZID: Record<TzId, string> = {
  IST: "Asia/Kolkata",
  UTC: "UTC",
};

/* -------------------- Helpers -------------------- */
function fmtDate(iso: string) {
  if (typeof iso === "string" && iso.length >= 10) return iso.slice(0, 10);
  return iso;
}

function tzHoursToOffset(h: number) {
  const sign = h >= 0 ? "+" : "-";
  const abs = Math.abs(h);
  const hh = Math.floor(abs);
  const mm = Math.round((abs - hh) * 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${sign}${pad(hh)}:${pad(mm)}`;
}

const TZ_HOURS: Record<TzId, number> = { IST: 5.5, UTC: 0.0 };

function localCivilToUtcIso(
  dob: string,
  tob: string,
  tzId: TzId
): { dtIsoUtc: string; tzHours: number } {
  const tzHours = TZ_HOURS[tzId];
  const offset = tzHoursToOffset(tzHours);
  const localTagged = `${dob}T${tob}:00${offset}`;
  const dtIsoUtc = new Date(localTagged).toISOString();
  return { dtIsoUtc, tzHours };
}

/* English baselines for value-localization */
const EN_ZODIAC = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];
const EN_NAKS = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha",
  "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
  "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"
];

function localizeSvgPlanets(svg: string, t: (k: string) => string) {
  if (!svg) return svg;
  const names = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  const pattern = new RegExp(`>(?:${names.join("|")})<`, "g");
  const map: Record<string, string> = {
    Sun: t("planets.sun"),
    Moon: t("planets.moon"),
    Mars: t("planets.mars"),
    Mercury: t("planets.mercury"),
    Jupiter: t("planets.jupiter"),
    Venus: t("planets.venus"),
    Saturn: t("planets.saturn"),
    Rahu: t("planets.rahu"),
    Ketu: t("planets.ketu"),
  };
  return svg.replace(pattern, (m) => {
    const raw = m.slice(1, -1);
    return `>${map[raw] || raw}<`;
  });
}

function makeSvgResponsive(svg: string) {
  if (!svg) return svg;
  let out = svg.replace(/<svg([^>]*?)\s(width|height)="[^"]*"/gi, "<svg$1");
  if (!/viewBox=/.test(out)) {
    out = out.replace(/<svg([^>]*)>/i, '<svg$1 viewBox="0 0 600 600">');
  }
  out = out.replace(
    /<svg([^>]*)>/i,
    '<svg$1 style="max-width:100%;height:auto;display:block" preserveAspectRatio="xMidYMid meet">'
  );
  return out;
}

/* ---- Shared defaults ---- */
const DEFAULT_SHUBHDIN_HORIZON = 24; // months

/* ------------------------------------------------------------------ */
/* -------------------------- Component ------------------------------ */
/* ------------------------------------------------------------------ */
export default function CreateChartClient() {
  const { t, locale } = useI18n();
  const { user } = useAuth(); // ✅ hook valid here

  // Save modal state (if/when you wire it)
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [chartName, setChartName] = useState("");

  const tf = (k: string, fb: string) => (t(k) === k ? fb : t(k));

  /* -------------------- form state -------------------- */
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [tzId, setTzId] = useState<TzId>("IST");
  const [place, setPlace] = useState("");
  const [lat, setLat] = useState("22.5726");
  const [lon, setLon] = useState("88.3639");

  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [summary, setSummary] = useState<Record<string, string> | null>(null);
  const [vimshottari, setVimshottari] = useState<DashaTimeline | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const [placeTyping, setPlaceTyping] = useState("");
  const lastQueryRef = useRef<string | null>(null);
  const nowUtcIso = new Date().toISOString();

  /* -------- Restore on mount -------- */
  useEffect(() => {
    const saved = safeLoad();
    if (saved) {
      setDob(saved.dob || "");
      setTob(saved.tob || "");
      setTzId(saved.tzId || "IST");
      setPlace(saved.place || "");
      setLat(saved.lat || "22.5726");
      setLon(saved.lon || "88.3639");
      setSvg(saved.svg || null);
      setSummary(saved.summary || null);
      setVimshottari(saved.vimshottari || null);
      setSavedAt(saved.savedAt || null);
    }
  }, []);

  /* -------- Debounced background save on changes -------- */
  const saveTimer = useRef<number | null>(null);
  useEffect(() => {
    const payload: PersistedState = {
      dob,
      tob,
      tzId,
      place,
      lat,
      lon,
      svg,
      summary,
      vimshottari,
      savedAt: new Date().toISOString(),
    };
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      if (safeSave(payload)) setSavedAt(payload.savedAt!);
    }, 300);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [dob, tob, tzId, place, lat, lon, svg, summary, vimshottari]);

  /* -------- Save on unload as a fallback -------- */
  useEffect(() => {
    const handler = () => {
      const payload: PersistedState = {
        dob,
        tob,
        tzId,
        place,
        lat,
        lon,
        svg,
        summary,
        vimshottari,
        savedAt: new Date().toISOString(),
      };
      safeSave(payload);
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dob, tob, tzId, place, lat, lon, svg, summary, vimshottari]);

  /* -------- Geocoding -------- */
  const lookupPlace = useCallback(
    async (raw: string) => {
      const query = raw.trim();
      if (!query) return;
      if (lastQueryRef.current === query) return;
      lastQueryRef.current = query;

      setGeoMsg(null);
      setGeoLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/geocode?place=${encodeURIComponent(query)}`
        );
        const data = (await res.json()) as {
          address?: string;
          lat?: number;
          lon?: number;
          error?: string;
        };
        if (!res.ok) throw new Error(data?.error || `Geocode failed (${res.status})`);
        if (typeof data.lat === "number" && typeof data.lon === "number") {
          setLat(String(data.lat));
          setLon(String(data.lon));
        }
        setGeoMsg(data.address || t("create.locationFound"));
      } catch (e) {
        const msg = e instanceof Error ? e.message : t("errors.genericGeocode");
        setGeoMsg(msg);
      } finally {
        setGeoLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    const q = placeTyping.trim();
    if (q.length < 3) return;
    const handle = setTimeout(() => lookupPlace(q), 500);
    return () => clearTimeout(handle);
  }, [placeTyping, lookupPlace]);

  /* -------- Generate -------- */
  async function onGenerate(): Promise<void> {
    setError(null);
    setLoading(true);

    const ctrl = new AbortController();
    try {
      // Basic field checks
      if (!dob || !tob || !lat || !lon) {
        throw new Error(t("create.validation.missingFields"));
      }
      // Date sanity
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
      if (!m) throw new Error(t("create.validation.badDate"));
      const yr = parseInt(m[1], 10);
      if (yr < 1000 || yr > 2099) throw new Error(t("create.validation.badYearRange"));

      // Time sanity
      if (!/^\d{2}:\d{2}$/.test(tob)) {
        throw new Error(t("create.validation.badTime") || "Enter time as HH:MM");
      }

      // Coerce numbers + range-check
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);
      if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
        throw new Error(t("create.validation.badCoords") || "Latitude/Longitude must be numbers");
      }
      if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
        throw new Error(t("create.validation.coordsRange") || "Latitude/Longitude out of range");
      }

      // Build UTC timestamp from local civil + tz
      const { dtIsoUtc, tzHours } = localCivilToUtcIso(dob, tob, tzId);
      if (!dtIsoUtc) throw new Error(t("errors.genericGenerate"));

      // Call API
      const res = await fetch(`${API_BASE}/api/chart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          datetime: dtIsoUtc,
          lat: latNum,
          lon: lonNum,
          tz_offset_hours: tzHours,
        }),
      });

      let data: ApiResp | null = null;
      const text = await res.text();
      try {
        data = text ? (JSON.parse(text) as ApiResp) : null;
      } catch {
        /* non-JSON error */
      }

      if (!res.ok) {
        const errMsg =
          (data?.error) ||
          (text && text.slice(0, 200)) ||
          `HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      // Localize SVG planet names + make responsive
      const localizedSvg = data?.svg
        ? makeSvgResponsive(localizeSvgPlanets(data.svg, t))
        : "";

      // Localize summary labels & values (with locale fallback)
      const locKey = (locale in dictionaries ? locale : "en") as LocaleKey;
      const dict = dictionaries[locKey] as LocaleDict;
      const locZodiac = dict.zodiac;
      const locNaks = dict.nakshatras;

      const labelMap: Record<string, string> = {
        lagna_sign: t("results.lagnaSign"),
        sun_sign: t("results.sunSign"),
        moon_sign: t("results.moonSign"),
        moon_nakshatra: t("results.moonNakshatra"),
        lagna_deg: t("results.lagnaDeg"),
        sun_deg: t("results.sunDeg"),
        moon_deg: t("results.moonDeg"),
      };
      const EN_TO_LOC_SIGN = (val: string) => {
        const idx = EN_ZODIAC.indexOf(val);
        return idx >= 0 && locZodiac?.[idx] ? locZodiac[idx] : val;
      };
      const EN_TO_LOC_NAK = (val: string) => {
        const idx = EN_NAKS.indexOf(val);
        return idx >= 0 && locNaks?.[idx] ? locNaks[idx] : val;
      };

      const rawSummary = (data && data.summary) || null;
      const localizedSummary: Record<string, string> | null = rawSummary
        ? (() => {
            const result: Record<string, string> = {};
            for (const [k, v] of Object.entries(rawSummary)) {
              let vv = v;
              if (k === "lagna_sign" || k === "sun_sign" || k === "moon_sign")
                vv = EN_TO_LOC_SIGN(v);
              if (k === "moon_nakshatra") vv = EN_TO_LOC_NAK(v);
              result[labelMap[k] ?? k] = vv;
            }
            return result;
          })()
        : null;

      setSvg(localizedSvg);
      setSummary(localizedSummary);

      // Vimshottari (guarded)
      const maybe = (data?.meta?.["vimshottari"] ?? null) as DashaTimeline | null;
      const vDash =
        maybe &&
        Array.isArray(maybe?.mahadashas) &&
        (maybe?.mahadashas?.length ?? 0) > 0
          ? maybe
          : null;
      setVimshottari(vDash);

      // Persist birth details for the Daily page
      try {
        saveBirth({
          datetime: dtIsoUtc, // e.g. "1961-08-05T05:24:00.000Z"
          lat: latNum,
          lon: lonNum,
          tz: IANA_BY_TZID[tzId] || "Asia/Kolkata", // IANA TZ for /daily
        });
      } catch {
        /* ignore storage errors */
      }

      // Persist full Create state
      const payload: PersistedState = {
        dob,
        tob,
        tzId,
        place,
        lat,
        lon,
        svg: localizedSvg,
        summary: localizedSummary,
        vimshottari: vDash,
        savedAt: new Date().toISOString(),
      };
      if (safeSave(payload)) setSavedAt(payload.savedAt!);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("errors.genericGenerate");
      setError(msg);
    } finally {
      setLoading(false);
      ctrl.abort();
    }
  }

  function onReset() {
    setDob("");
    setTob("");
    setTzId("IST");
    setPlace("");
    setLat("22.5726");
    setLon("88.3639");
    setSvg(null);
    setSummary(null);
    setVimshottari(null);
    setError(null);
    setGeoMsg(null);
    lastQueryRef.current = null;
    setPlaceTyping("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSavedAt(null);
  }

  function loadLastSaved() {
    const saved = safeLoad();
    if (!saved) return;
    setDob(saved.dob || "");
    setTob(saved.tob || "");
    setTzId(saved.tzId || "IST");
    setPlace(saved.place || "");
    setLat(saved.lat || "22.5726");
    setLon(saved.lon || "88.3639");
    setSvg(saved.svg || null);
    setSummary(saved.summary || null);
    setVimshottari(saved.vimshottari || null);
    setSavedAt(saved.savedAt || null);
  }

  function clearSavedChartOnly() {
    const trimmed: PersistedState = {
      dob,
      tob,
      tzId,
      place,
      lat,
      lon,
      svg: null,
      summary: null,
      vimshottari: null,
      savedAt: new Date().toISOString(),
    };
    if (safeSave(trimmed)) setSavedAt(trimmed.savedAt!);
    setSvg(null);
    setSummary(null);
    setVimshottari(null);
  }

  /* -------------------- UI -------------------- */
  const birthUtcIso =
    dob && tob ? localCivilToUtcIso(dob, tob, tzId).dtIsoUtc : "";

  return (
    <Container>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
          {t("create.title")}
        </h2>
        <p className="mt-2 text-sm md:text-base text-slate-400 max-w-2xl">
          {t("create.note")}
        </p>
      </div>

      <div className="bg-[#141A2A] rounded-2xl p-6 pb-8 border border-white/5 overflow-visible">
        {/* Form */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">{t("create.dob")}</label>
            <input
              type="date"
              className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-slate-200"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">{t("create.tob")}</label>
            <input
              type="time"
              className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-slate-200"
              value={tob}
              onChange={(e) => setTob(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">{t("create.timezone")}</label>
            <select
              className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-slate-200"
              value={tzId}
              onChange={(e) => setTzId(e.target.value as TzId)}
            >
              <option value="IST">{t("timezones.ist")}</option>
              <option value="UTC">{t("timezones.utc")}</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-1">{t("create.place")}</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-slate-200"
                placeholder={t("create.placePlaceholder")}
                value={place}
                onChange={(e) => {
                  const v = e.target.value;
                  setPlace(v);
                  setPlaceTyping(v);
                  setGeoMsg(null);
                }}
                onBlur={(e) => lookupPlace(e.target.value)}
              />
              <button
                type="button"
                onClick={() => lookupPlace(place)}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 hover:border-white/20"
                disabled={geoLoading}
              >
                {geoLoading ? t("create.finding") : t("create.find")}
              </button>
            </div>
            {geoMsg && <div className="mt-1 text-xs text-slate-400">{geoMsg}</div>}
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">{t("create.lat")}</label>
            <input
              type="text"
              className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-slate-200"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="e.g., 22.5726"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">{t("create.lon")}</label>
            <input
              type="text"
              className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-slate-200"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              placeholder="e.g., 88.3639"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={onGenerate}
            disabled={loading}
            className="rounded-full bg-cyan-500 px-5 py-2.5 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-60 shrink-0"
          >
            {loading ? t("create.generating") : t("create.generate")}
          </button>
          <button
            onClick={onReset}
            className="rounded-full border border-white/10 px-5 py-2.5 text-slate-200 hover:border-white/20 shrink-0"
          >
            {t("create.reset")}
          </button>
          <button
            type="button"
            onClick={loadLastSaved}
            className="rounded-full border border-white/10 px-5 py-2.5 text-slate-200 hover:border-white/20 shrink-0"
            title="Load last saved chart & inputs"
          >
            Load last saved
          </button>
          <button
            type="button"
            onClick={clearSavedChartOnly}
            className="rounded-full border border-white/10 px-5 py-2.5 text-slate-200 hover:border-white/20 shrink-0"
            title="Remove saved chart (keep inputs)"
          >
            Clear saved chart
          </button>

          {savedAt && (
            <span className="basis-full text-xs text-slate-400">
              Last saved: {new Date(savedAt).toLocaleString()}
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {(svg || summary) && (
          <>
            <div className="grid md:grid-cols-2 gap-6 mt-6 overflow-visible min-w-0">
              {/* SVG card */}
              <div className="rounded-2xl border border-white/10 bg-black/10 p-3 min-w-0 overflow-visible">
                <div className="mx-auto w-full max-w-[min(92vw,520px)]">
                  <div className="w-full" dangerouslySetInnerHTML={{ __html: svg || "" }} />
                </div>
              </div>

              {/* Summary card */}
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-200 min-w-0 overflow-visible">
                <div className="text-white font-semibold mb-2">{t("results.title")}</div>
                <ul className="space-y-1">
                  {summary &&
                    Object.entries(summary).map(([label, val]) => (
                      <li
                        key={label}
                        className="grid grid-cols-[1fr_auto] items-start gap-3 border-b border-white/5 py-1"
                      >
                        <span className="text-slate-400 break-words">{label}</span>
                        <span className="text-slate-200 text-right break-words">{val}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* CTA: Open Vimshottari in same tab */}
            {vimshottari && (
              <div className="mt-4">
                <Link
                  href="/vimshottari"
                  className="inline-flex items-center rounded-full bg-indigo-500 px-4 py-2 text-slate-950 font-semibold hover:bg-indigo-400"
                  aria-label={tf("dasha.open", "Open Dasha Timeline")}
                >
                  {tf("dasha.open", "Open Dasha Timeline")}
                </Link>
              </div>
            )}

            <div className="mt-2">
              <Link
                href="/daily"
                className="inline-flex items-center rounded-full bg-cyan-500 px-4 py-2 text-slate-950 font-semibold hover:bg-cyan-400"
                aria-label="Open Daily Timing"
                title="Open Daily Timing"
              >
                Open Daily Timing
              </Link>
            </div>

            {/* Ad: results mid-placement */}
            <div className="mt-6">
              <AdSlot slot="4741871653" minHeight={300} />
            </div>

            {/*
            {dob && tob && lat && lon && (
              <div className="mt-6">
                <ShubhDinInline
                  datetime={nowUtcIso}
                  lat={parseFloat(lat)}
                  lon={parseFloat(lon)}
                  tzId={tzId}
                  horizonMonths={DEFAULT_SHUBHDIN_HORIZON}
                />
              </div>
            )}
            *}

            {/* NOTE: Inline DashaSection intentionally disabled for mobile */}
            {/* If you re-enable, wrap responsibly for overflow */}

            {/* Ad: end-of-page */}
            <div className="mt-6">
              <AdSlot slot="4741871653" minHeight={280} />
            </div>
          </>
        )}
      </div>

      {/* Deep Links */}
      <div className="mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Life Wheel */}
          <Link
            href="/domains"
            className="group rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 via-emerald-500/10 to-transparent p-5 hover:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
            aria-label={tf("cta.domains.btn", "Open Life Wheel")}
          >
            <div className="text-2xl">✨</div>
            <div className="mt-2 text-white font-semibold text-lg">
              {tf("cta.domains.title", "Life Wheel (Domains)")}
            </div>
            <p className="mt-1 text-slate-300 text-sm">
              {tf(
                "cta.domains.desc",
                "See strengths across Career, Finance, Health, Relationships and more—at a glance."
              )}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-cyan-100 font-medium">
              {tf("cta.domains.btn", "Open Life Wheel")} <span className="animate-pulse">↗</span>
            </div>
          </Link>

          {/* Skills */}
          <Link
            href="/skills"
            className="group rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent p-5 hover:border-emerald-300/60 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
            aria-label={tf("cta.skills.btn", "See Skills")}
          >
            <div className="text-2xl">🚀</div>
            <div className="mt-2 text-white font-semibold text-lg">
              {tf("cta.skills.title", "Top Skills")}
            </div>
            <p className="mt-1 text-slate-300 text-sm">
              {tf(
                "cta.skills.desc",
                "Discover your standout abilities and how to use them for jobs, business or growth."
              )}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-emerald-100 font-medium">
              {tf("cta.skills.btn", "See Skills")} <span className="animate-pulse">↗</span>
            </div>
          </Link>

          {/* Saturn */}
          <Link
            href="/saturn"
            className="group rounded-2xl border border-indigo-400/40 bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-transparent p-5 hover:border-indigo-300/60 focus:outline-none focus:ring-2 focus:ring-indigo-300/60"
            aria-label={tf("cta.saturn.btn", "Open Saturn")}
          >
            <div className="text-2xl">🪐</div>
            <div className="mt-2 text-white font-semibold text-lg">
              {tf("cta.saturn.title", "Saturn Phases")}
            </div>
            <p className="mt-1 text-slate-300 text-sm">
              {tf(
                "cta.saturn.desc.short",
                "Track Sade Sati, transits and caution days to plan moves wisely."
              )}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-indigo-100 font-medium">
              {tf("cta.saturn.btn", "Open Saturn")} <span className="animate-pulse">↗</span>
            </div>
          </Link>
        </div>
      </div>
    </Container>
  );
} // ← single closing brace only
