"use client";

import { useEffect, useState } from "react";

import Container from "./Container";
import { useI18n } from "../lib/i18n";



type ApiResp = {
  svg: string;
  summary: Record<string, string>;
  meta: any;
  error?: string;
};


const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";


function tzOffsetHoursFor(date: Date) {
  return -date.getTimezoneOffset() / 60;
}

export default function CreateChartClient() {
  const { t } = useI18n();

  // --- existing state ---
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [place, setPlace] = useState("");
  const [lat, setLat] = useState("22.5726");
  const [lon, setLon] = useState("88.3639");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [summary, setSummary] = useState<Record<string, string> | null>(null);

  // --- NEW: debounce helpers (MUST be inside the component) ---
  const [placeTyping, setPlaceTyping] = useState("");    // mirror of `place` for debounce
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  useEffect(() => {
    const q = placeTyping.trim();
    if (q.length < 3) return;
    const handle = setTimeout(() => {
      lookupPlace(q);
    }, 500);
    return () => clearTimeout(handle);
  }, [placeTyping]);

  async function lookupPlace(q: string) {
    const query = q.trim();
    if (!query || query === lastQuery) return; // avoid duplicate fetches
    setLastQuery(query);
    setGeoMsg(null);
    setGeoLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000"}/api/geocode?place=` +
          encodeURIComponent(query)
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Geocode failed (${res.status})`);
      setLat(String(data.lat));
      setLon(String(data.lon));
      setGeoMsg(data.address || "Location found.");
    } catch (e: any) {
      setGeoMsg(e.message || "Could not find that place.");
    } finally {
      setGeoLoading(false);
    }
  }

  async function onGenerate() {
    setError(null);
    setSvg(null);
    setSummary(null);

    if (!dob || !tob || !lat || !lon) {
      setError("Please enter date, time, latitude and longitude.");
      return;
    }

    // Build local date + time → ISO UTC string
    const [hh, mm] = tob.split(":").map(Number);
    const d = new Date(dob);
    d.setHours(hh ?? 0, mm ?? 0, 0, 0);
    const dtIsoUtc = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
    const tz_hours = tzOffsetHoursFor(d);

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: dtIsoUtc,
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          tz_offset_hours: tz_hours,
        }),
      });
      const data: ApiResp = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      setSvg(data.svg);
      setSummary(data.summary);
    } catch (e: any) {
      setError(e.message || "Failed to generate chart.");
    } finally {
      setLoading(false);
    }
  }

  function onReset() {
    setDob("");
    setTob("");
    setPlace("");
    setLat("22.5726");
    setLon("88.3639");
    setSvg(null);
    setSummary(null);
    setError(null);
    setGeoMsg(null);
  }

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
          {/* Date */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">{t("create.dob")}</label>
            <input
              type="date"
              className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-slate-200"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">{t("create.tob")}</label>
            <input
              type="time"
              className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-slate-200"
              value={tob}
              onChange={(e) => setTob(e.target.value)}
            />
          </div>

          {/* Place (auto-fill lat/lon) */}
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-1">{t("create.place") || "Place"}</label>
            <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-slate-200"
                  placeholder="City, Country (e.g., Kolkata, India)"
                  value={place}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPlace(v);
                    setPlaceTyping(v);           // triggers the debounced effect
                    setGeoMsg(null);             // clear status while typing
                  }}
                  onBlur={(e) => lookupPlace(e.target.value)}  // keep on-blur as a fallback
                />

              <button
                type="button"
                onClick={() => lookupPlace(place)}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 hover:border-white/20"
                disabled={geoLoading}
              >
                {geoLoading ? "Finding..." : "Find"}
              </button>
            </div>
            {geoMsg && (
              <div className="mt-1 text-xs text-slate-400">{geoMsg}</div>
            )}
          </div>

          {/* Latitude */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Latitude</label>
            <input
              type="text"
              className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-slate-200"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="e.g., 22.5726"
            />
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Longitude</label>
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
        <div className="mt-4 flex gap-3">
          <button
            onClick={onGenerate}
            disabled={loading}
            className="rounded-full bg-cyan-500 px-5 py-2.5 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-60"
          >
            {loading ? "Generating..." : t("create.generate")}
          </button>
          <button
            onClick={onReset}
            className="rounded-full border border-white/10 px-5 py-2.5 text-slate-200 hover:border-white/20"
          >
            {t("create.reset")}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {(svg || summary) && (
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
              <div className="w-full overflow-auto" dangerouslySetInnerHTML={{ __html: svg || "" }} />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-200">
              <div className="text-white font-semibold mb-2">{t("results.title")}</div>
              <ul className="space-y-1">
                {summary &&
                  Object.entries(summary).map(([k, v]) => (
                    <li key={k} className="flex items-center justify-between border-b border-white/5 py-1">
                      <span className="text-slate-400">{k}</span>
                      <span className="text-slate-200">{v}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
