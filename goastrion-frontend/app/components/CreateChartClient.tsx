//component/CreateChartClient.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Container from "./Container";
import { useI18n } from "../lib/i18n";
import { dictionaries } from "../lib/locales/dictionaries";
import Link from "next/link";
import ShubhDinInline from "./shubhdin/ShubhDinInline"; // ⬅️ ShubhDin
import AdSlot from "./AdSlot";

// ---- locale dictionary helper types (for strict typing, no `any`) ----
type Dictionaries = typeof dictionaries;
type LocaleKey = keyof Dictionaries; // "en" | "hi" | "bn" | ...
type LocaleDict = Dictionaries[LocaleKey] & {
  zodiac?: string[];
  nakshatras?: string[];
};

type Period = { lord: string; start: string; end: string; years: number };
type DashaTimeline = {
  mahadashas: Period[];
  antardashas: Record<string, Period[]>;
};

type ApiResp = {
  svg: string;
  summary: Record<string, string>;
  meta: Record<string, unknown>;
  error?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

/* -------------------- Persistence -------------------- */
const STORAGE_KEY = "ga_create_state_v1";
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

/* -------------------- Helpers -------------------- */
function fmtDate(iso: string) {
  if (typeof iso === "string" && iso.length >= 10) return iso.slice(0, 10);
  return iso;
}
function fmtYearsAsYM(y: number) {
  const totalMonths = Math.round(y * 12);
  const yy = Math.floor(totalMonths / 12);
  const mm = totalMonths % 12;
  const parts: string[] = [];
  if (yy > 0) parts.push(`${yy} y`);
  if (mm > 0 || yy === 0) parts.push(`${mm} m`);
  return parts.join(" ");
}
function keyFor(md: Period) {
  return `${md.lord}@${md.start}`;
}
function findCurrentPrevNextMD(mds: Period[], refDate = new Date()) {
  const now = refDate.getTime();
  let cur = -1;
  for (let i = 0; i < mds.length; i++) {
    const s = new Date(mds[i].start).getTime();
    const e = new Date(mds[i].end).getTime();
    if (now >= s && now < e) {
      cur = i;
      break;
    }
  }
  const prev = cur > 0 ? cur - 1 : -1;
  const next = cur >= 0 && cur + 1 < mds.length ? cur + 1 : -1;
  return { prev, cur, next };
}

/* Timezone helpers */
const TZ_HOURS: Record<TzId, number> = { IST: 5.5, UTC: 0.0 };
function tzHoursToOffset(h: number) {
  const sign = h >= 0 ? "+" : "-";
  const abs = Math.abs(h);
  const hh = Math.floor(abs);
  const mm = Math.round((abs - hh) * 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${sign}${pad(hh)}:${pad(mm)}`;
}
function localCivilToUtcIso(dob: string, tob: string, tzId: TzId): { dtIsoUtc: string; tzHours: number } {
  const tzHours = TZ_HOURS[tzId];
  const offset = tzHoursToOffset(tzHours);
  const localTagged = `${dob}T${tob}:00${offset}`;
  const dtIsoUtc = new Date(localTagged).toISOString();
  return { dtIsoUtc, tzHours };
}

/* i18n helpers */
function planetLabel(eng: string, t: (k: string) => string) {
  const key = eng.toLowerCase();
  const map: Record<string, string> = {
    sun: t("planets.sun"),
    moon: t("planets.moon"),
    mars: t("planets.mars"),
    mercury: t("planets.mercury"),
    jupiter: t("planets.jupiter"),
    venus: t("planets.venus"),
    saturn: t("planets.saturn"),
    rahu: t("planets.rahu"),
    ketu: t("planets.ketu"),
  };
  return map[key] || eng;
}
function localizeSvgPlanets(svg: string, t: (k: string) => string) {
  const names = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  const pattern = new RegExp(`>(?:${names.join("|")})<`, "g");
  return svg.replace(pattern, (m) => {
    const raw = m.slice(1, -1);
    const localized = planetLabel(raw, t);
    return `>${localized}<`;
  });
}

/** Force the incoming SVG to scale on mobile */
function makeSvgResponsive(svg: string) {
  if (!svg) return svg;
  // remove width/height on the <svg> tag
  let out = svg.replace(/<svg([^>]*?)\s(width|height)="[^"]*"/gi, "<svg$1");
  // ensure viewBox (fallback only if missing)
  if (!/viewBox=/.test(out)) {
    out = out.replace(/<svg([^>]*)>/i, '<svg$1 viewBox="0 0 600 600">');
  }
  // ensure scalable styling + aspect ratio
  out = out.replace(
    /<svg([^>]*)>/i,
    '<svg$1 style="max-width:100%;height:auto;display:block" preserveAspectRatio="xMidYMid meet">'
  );
  return out;
}

/* English baselines for value-localization */
const EN_ZODIAC = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];
const EN_NAKS = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha",
  "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
  "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"
];

/* ---- Shared defaults so tab & results never drift ---- */
const DEFAULT_SHUBHDIN_HORIZON = 24;   // months
const DEFAULT_SHUBHDIN_GOAL = "general";

export default function CreateChartClient() {
  const { t, locale } = useI18n();
  // small “translate with fallback” helper
  const tf = (k: string, fb: string) => (t(k) === k ? fb : t(k));

  /* form state */
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [tzId, setTzId] = useState<TzId>("IST");
  const [place, setPlace] = useState("");
  const [lat, setLat] = useState("22.5726");
  const [lon, setLon] = useState("88.3639");

  /* ui state */
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [summary, setSummary] = useState<Record<string, string> | null>(null);
  const [vimshottari, setVimshottari] = useState<DashaTimeline | null>(null);

  /* persistence status */
  const [savedAt, setSavedAt] = useState<string | null>(null);

  /* geocode debounce */
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
      dob, tob, tzId, place, lat, lon, svg, summary, vimshottari, savedAt: new Date().toISOString(),
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
        dob, tob, tzId, place, lat, lon, svg, summary, vimshottari, savedAt: new Date().toISOString(),
      };
      safeSave(payload);
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dob, tob, tzId, place, lat, lon, svg, summary, vimshottari]);

  /* -------- Geocoding -------- */
  const lookupPlace = useCallback(async (raw: string) => {
    const query = raw.trim();
    if (!query) return;
    if (lastQueryRef.current === query) return;
    lastQueryRef.current = query;

    setGeoMsg(null);
    setGeoLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/geocode?place=${encodeURIComponent(query)}`);
      const data = (await res.json()) as { address?: string; lat?: number; lon?: number; error?: string };
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
  }, [t]);

  useEffect(() => {
    const q = placeTyping.trim();
    if (q.length < 3) return;
    const handle = setTimeout(() => lookupPlace(q), 500);
    return () => clearTimeout(handle);
  }, [placeTyping, lookupPlace]);

  /* -------- Generate -------- */
  async function onGenerate() {
    setError(null);
    setLoading(true);

    try {
      if (!dob || !tob || !lat || !lon) {
        throw new Error(t("create.validation.missingFields"));
      }
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
      if (!m) throw new Error(t("create.validation.badDate"));
      const yr = parseInt(m[1], 10);
      if (yr < 1000 || yr > 2099) throw new Error(t("create.validation.badYearRange"));

      const { dtIsoUtc, tzHours } = localCivilToUtcIso(dob, tob, tzId);

      const res = await fetch(`${API_BASE}/api/chart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: dtIsoUtc,
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          tz_offset_hours: tzHours,
        }),
      });

      const data: ApiResp = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      // Localize SVG planet names + make responsive
      const localizedSvg = data.svg
        ? makeSvgResponsive(localizeSvgPlanets(data.svg, t))
        : "";

      // Localize summary labels & values
      const rawSummary = data.summary || null;
      const dict = dictionaries[locale] as LocaleDict;
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

      const localizedSummary: Record<string, string> | null = rawSummary
        ? (() => {
            const result: Record<string, string> = {};
            for (const [k, v] of Object.entries(rawSummary)) {
              let vv = v;
              if (k === "lagna_sign" || k === "sun_sign" || k === "moon_sign") vv = EN_TO_LOC_SIGN(v);
              if (k === "moon_nakshatra") vv = EN_TO_LOC_NAK(v);
              result[labelMap[k] ?? k] = vv;
            }
            return result;
          })()
        : null;

      setSvg(localizedSummary ? localizedSvg : localizedSvg);
      setSummary(localizedSummary);

      const maybe = (data.meta?.["vimshottari"] ?? null) as DashaTimeline | null;
      setVimshottari(maybe && Array.isArray(maybe.mahadashas) && maybe.mahadashas.length > 0 ? maybe : null);

      // Immediate save right after successful fetch
      const payload: PersistedState = {
        dob, tob, tzId, place, lat, lon,
        svg: localizedSvg, summary: localizedSummary, vimshottari: maybe || null,
        savedAt: new Date().toISOString(),
      };
      if (safeSave(payload)) setSavedAt(payload.savedAt!);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("errors.genericGenerate");
      setError(msg);
    } finally {
      setLoading(false);
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
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
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
      dob, tob, tzId, place, lat, lon,
      svg: null, summary: null, vimshottari: null,
      savedAt: new Date().toISOString(),
    };
    if (safeSave(trimmed)) setSavedAt(trimmed.savedAt!);
    setSvg(null);
    setSummary(null);
    setVimshottari(null);
  }

  /* -------- Dasha Rendering -------- */
  function renderMahadashasSection(v: DashaTimeline) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
        <div className="text-white font-semibold mb-3">{t("dasha.titleFullTimeline")}</div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-white/10">
                <th className="text-left py-1 pr-3">{t("dasha.colLord")}</th>
                <th className="text-left py-1 pr-3">{t("dasha.colStart")}</th>
                <th className="text-left py-1 pr-3">{t("dasha.colEnd")}</th>
                <th className="text-left py-1 pr-3">{t("dasha.colDuration")}</th>
              </tr>
            </thead>
            <tbody>
              {v.mahadashas.map((md, i) => (
                <tr key={`${md.lord}-${i}`} className="border-b border-white/5">
                  <td className="py-1 pr-3 text-slate-200">{planetLabel(md.lord, t)}</td>
                  <td className="py-1 pr-3 text-slate-300">{fmtDate(md.start)}</td>
                  <td className="py-1 pr-3 text-slate-300">{fmtDate(md.end)}</td>
                  <td className="py-1 pr-3 text-slate-400">{fmtYearsAsYM(md.years)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderADBlock(title: string, md: Period | null, v: DashaTimeline) {
    if (!md) return null;
    const k = keyFor(md);
    const ads = v.antardashas?.[k] || [];
    return (
      <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
        <div className="text-white font-semibold mb-2">
          {title}: {planetLabel(md.lord, t)} ({fmtDate(md.start)} → {fmtDate(md.end)})
        </div>
        {ads.length === 0 ? (
          <div className="text-slate-400 text-sm">{t("dasha.noAntardasha")}</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-white/10">
                  <th className="text-left py-1 pr-3">{t("dasha.colADLord")}</th>
                  <th className="text-left py-1 pr-3">{t("dasha.colStart")}</th>
                  <th className="text-left py-1 pr-3">{t("dasha.colEnd")}</th>
                  <th className="text-left py-1 pr-3">{t("dasha.colDuration")}</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad, i) => (
                  <tr key={`${ad.lord}-${i}`} className="border-b border-white/5">
                    <td className="py-1 pr-3 text-slate-200">{planetLabel(ad.lord, t)}</td>
                    <td className="py-1 pr-3 text-slate-300">{fmtDate(ad.start)}</td>
                    <td className="py-1 pr-3 text-slate-300">{fmtDate(ad.end)}</td>
                    <td className="py-1 pr-3 text-slate-400">{fmtYearsAsYM(ad.years)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  function renderDashaSection() {
    if (!vimshottari) return null;
    const { prev, cur, next } = findCurrentPrevNextMD(vimshottari.mahadashas, new Date());
    const mdPrev = prev >= 0 ? vimshottari.mahadashas[prev] : null;
    const mdCur = cur >= 0 ? vimshottari.mahadashas[cur] : null;
    const mdNext = next >= 0 ? vimshottari.mahadashas[next] : null;

    return (
      <div className="mt-6 space-y-6">
        {renderMahadashasSection(vimshottari)}
        <div className="grid md:grid-cols-3 gap-6">
          {renderADBlock(t("dasha.prevADTitle"), mdPrev, vimshottari)}
          {renderADBlock(t("dasha.curADTitle"), mdCur, vimshottari)}
          {renderADBlock(t("dasha.nextADTitle"), mdNext, vimshottari)}
        </div>
      </div>
    );
  }

  /* -------------------- UI -------------------- */
  // Derive birth UTC for ShubhDin (safe even if fields are empty; guarded before render)
  const birthUtcIso = (dob && tob) ? localCivilToUtcIso(dob, tob, tzId).dtIsoUtc : "";

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

      <div className="bg-[#141A2A] rounded-2xl p-6 border border-white/5">
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
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                <div className="mx-auto w-full max-w-[min(92vw,520px)]">
                  <div className="w-full" dangerouslySetInnerHTML={{ __html: svg || "" }} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-200">
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

            {/* Ad: results mid-placement (good viewability) */}
            <div className="mt-6">
              <AdSlot slot="4741871653" minHeight={300} />
            </div>

            {/* >>> ShubhDin BETWEEN Summary and Dasha <<< */}
            {dob && tob && lat && lon && (
              <div className="mt-6">
                <ShubhDinInline
                  datetime={nowUtcIso}              // ⬅️ use NOW for ShubhDin
                  lat={parseFloat(lat)}
                  lon={parseFloat(lon)}
                  tzId={tzId}                       // ⬅️ component sends tz_offset_hours
                  horizonMonths={DEFAULT_SHUBHDIN_HORIZON}
                />
              </div>
            )}

            {/* 🔵 Saturn teaser — placed right AFTER ShubhDin */}
            <div className="mt-6">
              <Link
                href="/saturn"
                className="block rounded-2xl border border-indigo-400/40 bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-transparent p-5 hover:border-indigo-300/60 focus:outline-none focus:ring-2 focus:ring-indigo-300/60"
                aria-label={tf("cta.saturn.btn", "Open Saturn")}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl md:text-3xl">🪐</div>
                  <div>
                    <div className="text-white text-lg md:text-xl font-semibold">
                      {tf("cta.saturn.title", "Saturn Phases (Sade Sati & More)")}
                    </div>
                    <p className="mt-1 text-slate-300 text-sm md:text-base">
                      {tf(
                        "cta.saturn.desc",
                        "See your Sade Sati windows, Saturn transits, station days and caution periods—personalized from your birth details."
                      )}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 text-indigo-200 font-medium">
                      {tf("cta.saturn.btn", "Open Saturn")} <span className="animate-pulse">↗</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {vimshottari && (
              <div className="mt-6">
                <div className="text-white font-semibold mb-2 text-lg">{t("dasha.sectionTitle")}</div>
                {renderDashaSection()}
              </div>
            )}

            {/* Ad: end-of-page */}
            <div className="mt-6">
              <AdSlot slot="4741871653" minHeight={280} />
            </div>
          </>
        )}
      </div>

      {/* ---- Post-Results Deep Links (revamped to 3-card layout) ---- */}
      <div className="mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Life Wheel /domains */}
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

          {/* Skills /skills */}
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

          {/* Saturn /saturn */}
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
      {/* ---- /Post-Results Deep Links ---- */}
    </Container>
  );
}
