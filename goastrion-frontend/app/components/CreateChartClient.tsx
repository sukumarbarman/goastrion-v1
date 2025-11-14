// app/components/CreateChartClient.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import Container from "./Container";

import { useI18n } from "../lib/i18n";
import { dictionaries } from "../lib/locales/dictionaries";
import type { DashaTimeline } from "./dasha/types";
import { saveBirth } from "@/app/lib/birthStore";
import SaveChartButton, { type ChartPayload } from "@/app/components/SaveChartButton";

import {
  STORAGE_KEY,
  IANA_BY_TZID,
  localCivilToUtcIso,
  loadCreateState,
  saveCreateState,
  type TzId,
  type PersistedCreateState as PersistedState,
} from "@/app/lib/birthState";

/* -------------------- Types -------------------- */
type Dictionaries = typeof dictionaries;
type LocaleKey = keyof Dictionaries;
type LocaleDict = Dictionaries[LocaleKey] & {
  zodiac?: string[];
  nakshatras?: string[];
  core?: { zodiac?: string[]; nakshatras?: string[] };
};

type ApiResp = {
  svg: string;
  summary: Record<string, string>;
  meta: Record<string, unknown>;
  error?: string;
};

type GeocodeResp = {
  address?: string;
  lat?: number | string;
  lon?: number | string;
  error?: string;
};

function parseJsonSafe<T>(text: string): T | null {
  const t = text.trim();
  if (!t || !(t.startsWith("{") || t.startsWith("["))) return null;
  try {
    return JSON.parse(t) as T;
  } catch {
    return null;
  }
}

type SummaryEntry = { id: string; label: string; value: string };

/** Extend persisted state locally to keep raw values for re-localization */
type RawPersist = {
  summaryRaw?: Record<string, string> | null;
  svgRaw?: string | null;
};
type PersistedWithRaw = PersistedState & RawPersist;

/** Keep persisted `summary` type compatibility (record of label->value) */
type PersistedSummaryType = PersistedState extends { summary: infer S } ? S : unknown;

/* -------------------- Config -------------------- */
// Keep geocode calls relative so nginx forwards to backend.
// Try both legacy and v1 routes, accept the first that returns JSON.
const GEOCODE_PATHS = ["/api/geocode", "/api/v1/geocode"];

/* English baselines */
const EN_ZODIAC = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];
const EN_NAKS = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha",
  "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
  "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"
];

/* -------------------- SVG helpers -------------------- */
function localizeSvgPlanets(svg: string, t: (k: string) => string) {
  if (!svg) return svg;
  const names = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
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
  return svg.replace(pattern, (m) => `>${map[m.slice(1, -1)] || m.slice(1, -1)}<`);
}
function makeSvgResponsive(svg: string) {
  if (!svg) return svg;
  let out = svg.replace(/<svg([^>]*?)\s(width|height)="[^"]*"/gi, "<svg$1");
  if (!/viewBox=/.test(out)) out = out.replace(/<svg([^>]*)>/i, '<svg$1 viewBox="0 0 600 600">');
  return out.replace(
    /<svg([^>]*)>/i,
    '<svg$1 style="max-width:100%;height:auto;display:block" preserveAspectRatio="xMidYMid meet">'
  );
}

/* -------------------- i18n helpers -------------------- */
function resolveLocaleKey(raw: string): LocaleKey {
  const keys = Object.keys(dictionaries) as LocaleKey[];
  if ((keys as string[]).includes(raw)) return raw as LocaleKey;
  const base = raw.split(/[-_]/)[0];
  return (keys.find((k) => k === base) || "en") as LocaleKey;
}
function normalizeArray(a: unknown, expectedLen?: number): string[] | undefined {
  if (Array.isArray(a)) return expectedLen && a.length !== expectedLen ? undefined : (a as string[]);
  if (a && typeof a === "object") {
    const vals = Object.values(a as Record<string, unknown>).filter((v): v is string => typeof v === "string");
    return !expectedLen || vals.length === expectedLen ? vals : undefined;
  }
  return undefined;
}
function getLocaleArrays(locale: string) {
  const locKey = resolveLocaleKey(locale);
  const dict = dictionaries[locKey] as LocaleDict;
  const zodiac = normalizeArray(dict.zodiac, 12) ?? normalizeArray(dict.core?.zodiac, 12) ?? EN_ZODIAC;
  const naks = normalizeArray(dict.nakshatras, 27) ?? normalizeArray(dict.core?.nakshatras, 27) ?? EN_NAKS;
  return { zodiac, naks };
}
function normalizeName(s: unknown) {
  return String(s).toLowerCase().replace(/\s*\(.*?\)\s*/g, "").replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
}
function findIndexInsensitive(val: string, base: string[]) {
  const needle = normalizeName(val);
  return base.findIndex((s) => normalizeName(s) === needle);
}
function degToIdx(deg: string) {
  const n = parseFloat(String(deg).replace(/[^\d.\-]/g, ""));
  if (!Number.isFinite(n)) return -1;
  return Math.floor((((n % 360) + 360) % 360) / 30);
}
function formatDegMod30(val: string): string {
  const num = parseFloat(String(val).replace(/[^\d.\-]/g, ""));
  if (!Number.isFinite(num)) return val;
  const norm = ((num % 360) + 360) % 360;
  const rem = norm % 30;
  return `${rem.toFixed(2)}°`;
}

function mapSignName(val: string, locale: string) {
  const { zodiac } = getLocaleArrays(locale);
  const n = Number(val);
  if (Number.isInteger(n) && n >= 0 && n <= 11) return zodiac[n];
  const idx = findIndexInsensitive(val, EN_ZODIAC);
  return idx >= 0 ? zodiac[idx] : val;
}
function mapNakName(val: string, locale: string) {
  const { naks } = getLocaleArrays(locale);
  const idx = findIndexInsensitive(val, EN_NAKS);
  return idx >= 0 ? naks[idx] : val;
}
const KEY_ALIASES: Record<string, string[]> = {
  lagna_sign: ["lagna_sign", "asc_sign", "ascendant_sign", "rising_sign"],
  sun_sign:   ["sun_sign", "sun_sign_name", "sun_rashi"],
  moon_sign:  ["moon_sign", "moon_sign_name", "moon_rashi"],
  moon_nakshatra: ["moon_nakshatra", "moon_nak", "chandra_nakshatra"],
  lagna_deg:  ["lagna_deg", "asc_deg", "ascendant_deg", "rising_deg", "lagna_degree"],
  sun_deg:    ["sun_deg", "sun_degree"],
  moon_deg:   ["moon_deg", "moon_degree"],
};
function getByAlias(obj: Record<string, string>, canon: keyof typeof KEY_ALIASES) {
  for (const k of KEY_ALIASES[canon]) if (k in obj && typeof obj[k] === "string") return obj[k]!;
  return undefined;
}
function buildSummaryEntries(raw: Record<string, string>, locale: string, t: (k: string) => string): SummaryEntry[] {
  const { zodiac } = getLocaleArrays(locale);
  const labelMap: Record<string, string> = {
    lagna_sign: t("results.lagnaSign"),
    sun_sign: t("results.sunSign"),
    moon_sign: t("results.moonSign"),
    moon_nakshatra: t("results.moonNakshatra"),
    lagna_deg: t("results.lagnaDeg"),
    sun_deg: t("results.sunDeg"),
    moon_deg: t("results.moonDeg"),
  };

  const lagnaSignRaw = getByAlias(raw, "lagna_sign");
  const sunSignRaw   = getByAlias(raw, "sun_sign");
  const moonSignRaw  = getByAlias(raw, "moon_sign");
  const lagnaDegRaw  = getByAlias(raw, "lagna_deg");
  const sunDegRaw    = getByAlias(raw, "sun_deg");
  const moonDegRaw   = getByAlias(raw, "moon_deg");
  const moonNakRaw   = getByAlias(raw, "moon_nakshatra");

  const entries: SummaryEntry[] = [];
  const signTriples: Array<{ id: "lagna_sign" | "sun_sign" | "moon_sign"; label: string; name?: string; deg?: string; }> = [
    { id: "lagna_sign", label: labelMap.lagna_sign, name: lagnaSignRaw, deg: lagnaDegRaw },
    { id: "sun_sign",   label: labelMap.sun_sign,   name: sunSignRaw,   deg: sunDegRaw   },
    { id: "moon_sign",  label: labelMap.moon_sign,  name: moonSignRaw,  deg: moonDegRaw  },
  ];

  for (const s of signTriples) {
    let value = s.name ? mapSignName(s.name, locale) : "";
    if (!value || value === s.name) {
      const idx = s.deg ? degToIdx(s.deg) : -1;
      if (idx >= 0) value = (zodiac[idx] ?? s.name ?? "");
    }
    if (value) entries.push({ id: s.id, label: s.label, value });
  }

  if (moonNakRaw) entries.push({ id: "moon_nakshatra", label: labelMap.moon_nakshatra, value: mapNakName(moonNakRaw, locale) });
  if (lagnaDegRaw) entries.push({ id: "lagna_deg", label: labelMap.lagna_deg, value: formatDegMod30(lagnaDegRaw) });
  if (sunDegRaw)   entries.push({ id: "sun_deg",   label: labelMap.sun_deg,   value: formatDegMod30(sunDegRaw)   });
  if (moonDegRaw)  entries.push({ id: "moon_deg",  label: labelMap.moon_deg,  value: formatDegMod30(moonDegRaw)  });

  return entries;
}

/* Fallback: convert a label→value record to entries (no re-localization) */
function entriesFromLabelRecord(rec: Record<string, string>): SummaryEntry[] {
  return Object.entries(rec).map(([label, value]) => ({ id: label, label, value }));
}

/* -------------------- Component -------------------- */
export default function CreateChartClient() {
  const { t, tOr, get, locale } = useI18n();
  function getArray(key: string): string[] {
      const raw = get(key);
      return Array.isArray(raw) ? (raw as string[]) : [];
    }

  const [chartName, setChartName] = useState("");
  // raw (server) data kept for re-localization
  const [rawSvg, setRawSvg] = useState<string | null>(null);
  const [rawSummary, setRawSummary] = useState<Record<string, string> | null>(null);

  // derived (localized) display
  const [svg, setSvg] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryEntry[] | null>(null);

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

  const [vimshottari, setVimshottari] = useState<DashaTimeline | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedOK, setSavedOK] = useState(false);
  const saveTimerRef = useRef<number | null>(null);

  const [placeTyping, setPlaceTyping] = useState("");
  const lastQueryRef = useRef<string | null>(null);

  /* -------- Restore on mount -------- */
  useEffect(() => {
    const savedBase = loadCreateState();
    if (!savedBase) return;
    const saved = savedBase as PersistedWithRaw;

    setChartName(saved.name || "");
    setDob(saved.dob || "");
    setTob(saved.tob || "");
    setTzId(saved.tzId || "IST");
    setPlace(saved.place || "");
    setLat(saved.lat || "22.5726");
    setLon(saved.lon || "88.3639");

    const sRaw = saved.summaryRaw;
    const vRaw = saved.svgRaw;

    if (sRaw) {
      setRawSummary(sRaw);
      setSummary(buildSummaryEntries(sRaw, locale, t));
    } else if (saved.summary && typeof saved.summary === "object" && !Array.isArray(saved.summary)) {
      const rec = saved.summary as Record<string, string>;
      setRawSummary(null);
      setSummary(entriesFromLabelRecord(rec));
    } else {
      setRawSummary(null);
      setSummary(null);
    }

    if (vRaw) {
      setRawSvg(vRaw);
      setSvg(makeSvgResponsive(localizeSvgPlanets(vRaw, t)));
    } else if (typeof saved.svg === "string") {
      setRawSvg(null);
      setSvg(saved.svg);
    } else {
      setRawSvg(null);
      setSvg(null);
    }

    setVimshottari((saved.vimshottari as DashaTimeline | null) || null);
    setSavedAt(saved.savedAt || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------- Re-localize when language changes -------- */
  useEffect(() => {
    if (rawSvg) setSvg(makeSvgResponsive(localizeSvgPlanets(rawSvg, t)));
    if (rawSummary) setSummary(buildSummaryEntries(rawSummary, locale, t));
  }, [locale, t, rawSvg, rawSummary]);

  /* -------- Debounced background save on changes -------- */
  const saveTimer = useRef<number | null>(null);
  useEffect(() => {
    const summaryRecord: Record<string, string> | null =
      summary ? Object.fromEntries(summary.map((e) => [e.label, e.value])) : null;

    const payload: PersistedWithRaw = {
      name: chartName,
      dob,
      tob,
      tzId,
      place,
      lat,
      lon,
      svg,
      summary: summaryRecord as PersistedSummaryType,
      vimshottari,
      savedAt: new Date().toISOString(),
      summaryRaw: rawSummary ?? null,
      svgRaw: rawSvg ?? null,
    };

    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      if (saveCreateState(payload)) setSavedAt(payload.savedAt!);
    }, 300);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
  }, [chartName, dob, tob, tzId, place, lat, lon, svg, summary, vimshottari, rawSummary, rawSvg]);

  /* -------- Save on unload as a fallback -------- */
  useEffect(() => {
    const handler = () => {
      const summaryRecord: Record<string, string> | null =
        summary ? Object.fromEntries(summary.map((e) => [e.label, e.value])) : null;

      const payload: PersistedWithRaw = {
        name: chartName, dob, tob, tzId, place, lat, lon,
        svg, summary: summaryRecord as PersistedSummaryType, vimshottari,
        savedAt: new Date().toISOString(),
        summaryRaw: rawSummary ?? null,
        svgRaw: rawSvg ?? null,
      };
      saveCreateState(payload);
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [chartName, dob, tob, tzId, place, lat, lon, svg, summary, vimshottari, rawSummary, rawSvg]);

  /* -------- Geocoding (robust, JSON-safe) -------- */
  const lookupPlace = useCallback(async (raw: string) => {
    const query = raw.trim();
    if (!query) return;
    if (lastQueryRef.current === query) return;
    lastQueryRef.current = query;

    setGeoMsg(null);
    setGeoLoading(true);
    try {
      for (const base of GEOCODE_PATHS) {
        try {
          const url = `${base}?place=${encodeURIComponent(query)}`;
          const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
          const text = await res.text();

          // Parse JSON safely; if it looks like HTML or plain-text, handle below
          const data = parseJsonSafe<GeocodeResp>(text);

          if (!data) {
            // HTML page (e.g., 404 or a redirect landing) or plain text error
            if (/^\s*</.test(text)) {
              if (res.status === 404) throw new Error("not-found");
              throw new Error(`HTML_${res.status || "ERR"}`);
            }
            throw new Error(text.slice(0, 160));
          }

          if (!res.ok) {
            const msg = (typeof data.error === "string" && data.error) || `HTTP ${res.status}`;
            throw new Error(msg);
          }

          const latNum = typeof data.lat === "string" ? parseFloat(data.lat) : data.lat;
          const lonNum = typeof data.lon === "string" ? parseFloat(data.lon) : data.lon;

          if (typeof latNum === "number" && Number.isFinite(latNum) && typeof lonNum === "number" && Number.isFinite(lonNum)) {
            setLat(String(latNum));
            setLon(String(lonNum));
            setGeoMsg(data.address || tOr("create.locationFound", "Location found."));
            setGeoLoading(false);
            return; // success
          } else {
            throw new Error("invalid-coords");
          }
        } catch {
          // try next path
        }
      }

      // If both endpoints failed:
      const hint = tOr("errors.genericGeocode", "Could not find that place.");
      const suffix = query.toLowerCase().includes("durgapur")
        ? " Try “Durgapur, West Bengal” or add country."
        : " Try adding state and country.";
      setGeoMsg(`${hint}${suffix}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : tOr("errors.genericGeocode", "Could not find that place.");
      // Hide noisy internal markers
      const friendly =
        msg === "not-found" || msg.startsWith("HTML_") || msg === "invalid-coords"
          ? tOr("errors.genericGeocode", "Could not find that place.")
          : msg;
      setGeoMsg(friendly);
    } finally {
      setGeoLoading(false);
    }
  }, [tOr]);

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
      if (!dob || !tob || !lat || !lon) throw new Error(tOr("create.validation.missingFields", "Please enter date, time, latitude and longitude."));
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
      if (!m) throw new Error(tOr("create.validation.badDate", "Date must be YYYY-MM-DD."));
      const yr = parseInt(m[1], 10);
      if (yr < 1000 || yr > 2099) throw new Error(tOr("create.validation.badYearRange", "Year must be between 1000 and 2099."));
      if (!/^\d{2}:\d{2}$/.test(tob)) throw new Error(tOr("create.validation.badTime", "Enter time as HH:MM"));

      const latNum = parseFloat(lat); const lonNum = parseFloat(lon);
      if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) throw new Error(tOr("create.validation.badCoords", "Latitude/Longitude must be numbers"));
      if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) throw new Error(tOr("create.validation.coordsRange", "Latitude/Longitude out of range"));

      const { dtIsoUtc, tzHours } = localCivilToUtcIso(dob, tob, tzId);
      if (!dtIsoUtc) throw new Error(tOr("errors.genericGenerate", "Failed to generate chart."));

      const res = await fetch(`/api/chart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({ datetime: dtIsoUtc, lat: latNum, lon: lonNum, tz_offset_hours: tzHours }),
      });

      let data: ApiResp | null = null;
      const text = await res.text();
      try { data = text ? (JSON.parse(text) as ApiResp) : null; } catch {}

      if (!res.ok) {
        const errMsg = data?.error || (text && text.slice(0, 200)) || `HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      // keep raw, derive localized
      const serverSvg = data?.svg || "";
      const serverSummary = (data && data.summary) || {};

      setRawSvg(serverSvg);
      setRawSummary(serverSummary);

      setSvg(serverSvg ? makeSvgResponsive(localizeSvgPlanets(serverSvg, t)) : "");
      setSummary(buildSummaryEntries(serverSummary, locale, t));

      // Vimshottari
      const vRaw = (data?.meta?.["vimshottari"] ?? null) as unknown;
      const vDash: DashaTimeline | null =
        typeof vRaw === "object" &&
        vRaw !== null &&
        "mahadashas" in (vRaw as Record<string, unknown>) &&
        Array.isArray((vRaw as { mahadashas: unknown[] }).mahadashas) &&
        (vRaw as { mahadashas: unknown[] }).mahadashas.length > 0
          ? (vRaw as DashaTimeline)
          : null;
      setVimshottari(vDash);

      // Persist Daily page seed
      try {
        saveBirth({ datetime: dtIsoUtc, lat: latNum, lon: lonNum, tz: IANA_BY_TZID[tzId] || "Asia/Kolkata" });
      } catch {}
    } catch (e) {
      const msg = e instanceof Error ? e.message : tOr("errors.genericGenerate", "Failed to generate chart.");
      setError(msg);
    } finally {
      setLoading(false);
      ctrl.abort();
    }
  }

  function onReset() {
    setChartName(""); setDob(""); setTob(""); setTzId("IST"); setPlace("");
    setLat("22.5726"); setLon("88.3639");
    setRawSvg(null); setRawSummary(null);
    setSvg(null); setSummary(null); setVimshottari(null);
    setError(null); setGeoMsg(null); lastQueryRef.current = null; setPlaceTyping("");
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setSavedAt(null);
  }

  function loadLastSaved() {
    const savedBase = loadCreateState();
    if (!savedBase) return;
    const saved = savedBase as PersistedWithRaw;

    setChartName(saved.name || ""); setDob(saved.dob || ""); setTob(saved.tob || "");
    setTzId(saved.tzId || "IST"); setPlace(saved.place || ""); setLat(saved.lat || "22.5726"); setLon(saved.lon || "88.3639");

    const sRaw = saved.summaryRaw;
    const vRaw = saved.svgRaw;

    if (sRaw) {
      setRawSummary(sRaw);
      setSummary(buildSummaryEntries(sRaw, locale, t));
    } else if (saved.summary && typeof saved.summary === "object" && !Array.isArray(saved.summary)) {
      const rec = saved.summary as Record<string, string>;
      setRawSummary(null);
      setSummary(entriesFromLabelRecord(rec));
    } else {
      setRawSummary(null);
      setSummary(null);
    }

    if (vRaw) {
      setRawSvg(vRaw);
      setSvg(makeSvgResponsive(localizeSvgPlanets(vRaw, t)));
    } else if (typeof saved.svg === "string") {
      setRawSvg(null);
      setSvg(saved.svg);
    } else {
      setRawSvg(null);
      setSvg(null);
    }

    setVimshottari((saved.vimshottari as DashaTimeline | null) || null);
    setSavedAt(saved.savedAt || null);
  }

  function clearSavedChartOnly() {
    const trimmed: PersistedWithRaw = {
      name: chartName,
      dob,
      tob,
      tzId,
      place,
      lat,
      lon,
      svg: null,
      summary: null as PersistedSummaryType,
      vimshottari: null,
      savedAt: new Date().toISOString(),
      summaryRaw: null,
      svgRaw: null,
    };
    if (saveCreateState(trimmed)) setSavedAt(trimmed.savedAt!);
    setRawSvg(null); setRawSummary(null); setSvg(null); setSummary(null);
  }

  const birthUtcIso =
    dob && tob ? localCivilToUtcIso(dob, tob, tzId).dtIsoUtc : "";

  const backendChartPayload: ChartPayload | null =
    dob && tob && lat && lon
      ? {
          name: chartName || undefined,
          birth_datetime: birthUtcIso,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          timezone: IANA_BY_TZID[tzId] || "Asia/Kolkata",
          place: place || undefined,
        }
      : null;

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


    {/* -------------------- CREATE PAGE EXPLANATION -------------------- */}
    <section className="mt-4 mb-6 p-5 rounded-2xl bg-white/5 border border-white/10 text-slate-200">
      <h2 className="text-xl font-semibold text-white mb-3">
        {t("createPage.whatIsTitle")}
      </h2>
      <p className="text-sm leading-relaxed text-slate-300">
        {t("createPage.whatIsBody")}
      </p>

      <h3 className="mt-4 font-semibold text-white text-lg">
        {t("createPage.howUseTitle")}
      </h3>
      <p className="text-sm leading-relaxed text-slate-300 mt-1">
        {t("createPage.howUseBody")}
      </p>

        <h3 className="mt-4 font-semibold text-white text-lg">
          {t("createPage.benefitsTitle")}
        </h3>

        <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-slate-300">
          {(() => {
            const raw = get("createPage.benefitsList");
            const list = Array.isArray(raw) ? (raw as string[]) : [];
            return list.map((item, i) => <li key={i}>{item}</li>);
          })()}
        </ul>


    </section>







      <div className="bg-[#141A2A] rounded-2xl p-6 pb-8 border border-white/5 overflow-visible">
        {/* Form */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-1">{tOr("profile.birth.name.label", "Name (optional)")}</label>
            <input
              type="text"
              className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-slate-200"
              placeholder={tOr("profile.birth.name.ph", "e.g., Self, Ananya, Father")}
              value={chartName}
              onChange={(e) => setChartName(e.target.value)}
            />
          </div>

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
              placeholder={tOr("create.latPh", "e.g., 22.5726")}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">{t("create.lon")}</label>
            <input
              type="text"
              className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-slate-200"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              placeholder={tOr("create.lonPh", "e.g., 88.3639")}
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
            title={tOr("create.loadLastSavedTitle", "Load last saved chart & inputs")}
          >
            {tOr("create.loadLastSaved", "Load last saved")}
          </button>
          <button
            type="button"
            onClick={clearSavedChartOnly}
            className="rounded-full border border-white/10 px-5 py-2.5 text-slate-200 hover:border-white/20 shrink-0"
            title={tOr("create.clearSavedChartTitle", "Remove saved chart (keep inputs)")}
          >
            {tOr("create.clearSavedChart", "Clear saved chart")}
          </button>

          {savedAt && (
            <span className="basis-full text-xs text-slate-400">
              {tOr("create.lastSavedPrefix", "Last saved: ")} {new Date(savedAt).toLocaleString()}
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
                  {summary?.map(({ id, label, value }) => (
                    <li
                      key={id}
                      className="grid grid-cols-[1fr_auto] items-start gap-3 border-b border-white/5 py-1"
                    >
                      <span className="text-slate-400 break-words">{label}</span>
                      <span className="text-slate-200 text-right break-words">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Save to backend — RIGHT AFTER the chart render */}
            <div className="mt-1 space-y-1">
              {backendChartPayload && !savedOK && (
                <div
                  className="relative inline-block"
                  onClickCapture={(e) => {
                    if (isSaving || savedOK) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    setIsSaving(true);
                    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
                    // Fail-safe: auto-unlock if backend never calls onSaved
                    saveTimerRef.current = window.setTimeout(() => setIsSaving(false), 8000);
                  }}
                >
                  <SaveChartButton
                    chart={backendChartPayload}
                    label={tOr("create.saveCta", "Save to account")}
                    onSaved={() => {
                      setSavedOK(true);
                      setIsSaving(false);
                      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
                    }}
                  />
                  {isSaving && !savedOK && <div className="absolute inset-0" aria-hidden="true" />}
                </div>
              )}

              {savedOK && (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-sm text-emerald-200">
                  <span>✓</span>
                  <span>{tOr("create.saved", "Saved")}</span>
                </div>
              )}

              <p className="text-xs text-slate-400">
                {tOr("create.saveTip", "Tip: If you want to avoid entering your details again, save this chart to your account.")}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Deep Links */}
      <div className="mt-0">
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/daily"
            className="group rounded-2xl border border-sky-400/40 bg-gradient-to-br from-sky-500/20 via-cyan-500/10 to-transparent p-5 hover:border-sky-300/60 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
            aria-label={tOr("cards.daily.cta", "Know Today")}
          >
            <div className="text-2xl">📅</div>
            <div className="mt-2 text-white font-semibold text-lg">
              {tOr("cards.daily.title", "Know Today")}
            </div>
            <p className="mt-1 text-slate-300 text-sm">
              {tOr("cards.daily.desc", "Make the most of today: see your supportive time windows, recommended actions and cautions, plus your focus mantra.")}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-sky-100 font-medium">
              {tOr("cards.daily.cta", "Know Today")} <span className="animate-pulse">↗</span>
            </div>
          </Link>

          <Link
            href="/shubhdin"
            className="group rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-transparent p-5 hover:border-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
            aria-label={tOr("cards.shubhdin.cta", "Plan Good Days (ShubhDin)")}
          >
            <div className="text-2xl">🗓️✨</div>
            <div className="mt-2 text-white font-semibold text-lg">
              {tOr("cards.shubhdin.title", "Next 2 yrs")}
            </div>
            <p className="mt-1 text-slate-300 text-sm">
              {tOr("cards.shubhdin.desc", "Plan job changes, marriage, relationships, and starting or expanding a business.")}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-amber-100 font-medium">
              {tOr("cards.shubhdin.cta", "Plan Next 2 yrs")} <span className="animate-pulse">↗</span>
            </div>
          </Link>

          <Link
            href="/life-wheel"
            className="group rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 via-emerald-500/10 to-transparent p-5 hover:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
            aria-label={tOr("cards.life.cta", "Open Life Wheel")}
          >
            <div className="text-2xl">✨</div>
            <div className="mt-2 text-white font-semibold text-lg">
              {tOr("cards.life.title", "Life Wheel (Domains)")}
            </div>
            <p className="mt-1 text-slate-300 text-sm">
              {tOr("cards.life.desc", "See strengths across Career, Finance, Health, Relationships and more—at a glance.")}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-cyan-100 font-medium">
              {tOr("cards.life.cta", "Open Life Wheel")} <span className="animate-pulse">↗</span>
            </div>
          </Link>

          <Link
            href="/skills"
            className="group rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent p-5 hover:border-emerald-300/60 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
            aria-label={tOr("cards.skills.cta", "See Skills")}
          >
            <div className="text-2xl">🚀</div>
            <div className="mt-2 text-white font-semibold text-lg">
              {tOr("cards.skills.title", "Top Skills")}
            </div>
            <p className="mt-1 text-slate-300 text-sm">
              {tOr("cards.skills.desc", "Discover your standout abilities and how to use them for jobs, business or growth.")}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-emerald-100 font-medium">
              {tOr("cards.skills.cta", "See Skills")} <span className="animate-pulse">↗</span>
            </div>
          </Link>

          <Link
            href="/saturn"
            className="group rounded-2xl border border-indigo-400/40 bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-transparent p-5 hover:border-indigo-300/60 focus:outline-none focus:ring-2 focus:ring-indigo-300/60"
            aria-label={tOr("cards.saturn.cta", "Open Saturn")}
          >
            <div className="text-2xl">🪐</div>
            <div className="mt-2 text-white font-semibold text-lg">
              {tOr("cards.saturn.title", "Saturn Phases")}
            </div>
            <p className="mt-1 text-slate-300 text-sm">
              {tOr("cards.saturn.desc", "Track Sade Sati, transits and caution days to plan moves wisely.")}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-indigo-100 font-medium">
              {tOr("cards.saturn.cta", "Open Saturn")} <span className="animate-pulse">↗</span>
            </div>
          </Link>

          <Link
            href="/vimshottari"
            className="group rounded-2xl border border-violet-400/40 bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-transparent p-5 hover:border-violet-300/60 focus:outline-none focus:ring-2 focus:ring-violet-300/60"
            aria-label={tOr("vimshottari.openCta", "Open Vimshottari Timeline")}
          >
            <div className="text-2xl">⏳</div>
            <div className="mt-2 text-white font-semibold text-lg">
              {tOr("vimshottari.cardTitle", "Vimshottari  Timeline")}
            </div>
            <p className="mt-1 text-slate-300 text-sm">
              {tOr("vimshottari.cardDesc", "See your Vimshottari sequence and key periods.")}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-violet-100 font-medium">
              {tOr("vimshottari.openCta", "Open Vimshottari Timeline")} <span className="animate-pulse">↗</span>
            </div>
          </Link>
        </div>
      </div>

    </Container>
  );
}
