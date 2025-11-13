"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useI18n } from "@/app/lib/i18n";
import AdSlot from "@/app/components/AdSlot";
import { SHUBHDIN_TOP_SLOT_ID, SHUBHDIN_END_SLOT_ID } from "@/app/constants/ads";

type TzId = "IST" | "UTC";
const STORAGE_KEY = "ga_create_state_v1";
const TZ_HOURS: Record<TzId, number> = { IST: 5.5, UTC: 0 };

/* ---------- Local helper for DOB formatting ---------- */
function formatDobTime(dob?: string, tob?: string, tzId?: string) {
  if (!dob) return "";
  try {
    const dateObj = new Date(`${dob}T${tob || "00:00"}`);
    const local = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(dateObj);
    const tzLabel = tzId ? ` (${tzId})` : "";
    return `${local}${tzLabel}`;
  } catch {
    return `${dob}${tob ? `, ${tob}` : ""}${tzId ? ` (${tzId})` : ""}`;
  }
}

/* ---------- Backend types ---------- */
type BackendWindow = { start: string; end: string; duration_days?: number };
type BackendDate = {
  date: string;
  score?: number;
  tags?: string[];
  tags_t?: Array<{ key: string; args?: Record<string, unknown> }>;
};
type BackendResult = {
  goal: string;
  headline?: string;
  headline_t?: { key: string; args?: Record<string, unknown> };
  score?: number;
  confidence?: string;
  dates?: BackendDate[];
  windows?: BackendWindow[];
  explain?: string[];
  explain_t?: Array<{ key: string; args?: Record<string, unknown> }>;
  cautions?: string[];
  cautions_t?: Array<{ key: string; args?: Record<string, unknown> }>;
  caution_days?: string[];
};
type BackendResponse = {
  query_id: string;
  generated_at: string;
  tz?: string;
  horizon_months?: number;
  confidence_overall?: string;
  results?: BackendResult[];
};

/* ---------- Local helpers ---------- */
type KeyArgs = Record<string, string | number>;

function tzHoursToOffset(h: number) {
  const sign = h >= 0 ? "+" : "-";
  const abs = Math.abs(h);
  const hh = Math.floor(abs);
  const mm = Math.round((abs - hh) * 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${sign}${pad(hh)}:${pad(mm)}`;
}
function localCivilToUtcIso(dob: string, tob: string, tzId: TzId) {
  const offset = tzHoursToOffset(TZ_HOURS[tzId]);
  return new Date(`${dob}T${tob}:00${offset}`).toISOString();
}
function ensureDate(d: string) {
  try {
    return new Date(d);
  } catch {
    // @ts-expect-error sentinel null-ish date
    return null as Date;
  }
}
function fmtLocalDate(d: string, locale?: string) {
  const dt = ensureDate(d);
  if (!dt || isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(locale, { year: "numeric", month: "short", day: "2-digit" });
}
function renderItemsT(
  t: (k: string, v?: KeyArgs) => string,
  items?: Array<{ key: string; args?: Record<string, unknown> }>
): string[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map(({ key, args }) => t(key, args as KeyArgs | undefined));
}
function renderTagsT(
  t: (k: string, v?: KeyArgs) => string,
  tags_t?: BackendDate["tags_t"]
): string[] {
  if (!tags_t || !Array.isArray(tags_t)) return [];
  return tags_t.map(({ key, args }) => {
    const out = t(key, args as KeyArgs | undefined);
    if (out === key && args) {
      if (key === "sd.aspect.tag") return t("sd.aspect.tag", args as KeyArgs);
      if (key === "sd.dasha.md") return t("sd.dasha.md", args as KeyArgs);
      if (key === "sd.dasha.ad") return t("sd.dasha.ad", args as KeyArgs);
    }
    return out;
  });
}
function renderHeadline(
  t: (k: string, v?: KeyArgs) => string,
  r: BackendResult,
  locale?: string
): string | undefined {
  if (r.headline_t?.key === "sd.headline.best_windows") {
    const spans =
      (r.headline_t.args?.["spans"] as Array<{ start: string; end: string; days: number }>) || [];
    const parts = spans.map((s) =>
      t("sd.headline.span", {
        start: fmtLocalDate(s.start, locale),
        end: fmtLocalDate(s.end, locale),
        days: s.days,
      } as KeyArgs)
    );
    return t("sd.headline.prefix") + parts.join(t("sd.join.comma"));
  }
  return r.headline;
}

/** Type guard to avoid `any` casts when checking for aborts */
function isAbortError(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { name?: unknown }).name === "AbortError";
}

/* ---------- Card ---------- */
function GoalCard({ r }: { r: BackendResult }) {
  const { t, locale } = useI18n();

  const windows = r.windows ?? [];
  const cautionDays = r.caution_days ?? [];

  const explain = r.explain_t ? renderItemsT(t, r.explain_t) : r.explain ?? [];
  const cautions = r.cautions_t ? renderItemsT(t, r.cautions_t) : r.cautions ?? [];
  const headline = renderHeadline(t, r, locale);

  const dates = (r.dates ?? []).map((d) => ({
    ...d,
    tags: d.tags_t ? renderTagsT(t, d.tags_t) : d.tags ?? [],
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-white font-semibold capitalize">
          {t(`sd.goals.${r.goal}`) !== `sd.goals.${r.goal}` ? t(`sd.goals.${r.goal}`) : r.goal.replace(/_/g, " ")}
        </div>
      </div>

      {headline && <div className="text-slate-300 text-sm mb-2">{headline}</div>}

      {windows.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 text-sm font-medium text-emerald-300">{t("sd.windows.title")}</div>
          <ul className="space-y-1">
            {windows.map((w, i) => (
              <li
                key={`w-${i}`}
                className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-sm text-emerald-100"
              >
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="font-medium">
                    {fmtLocalDate(w.start, locale)} → {fmtLocalDate(w.end, locale)}
                  </span>
                  {typeof w.duration_days === "number" && (
                    <span className="text-emerald-300/80">({w.duration_days}d)</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {dates.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 text-sm font-medium text-sky-300">{t("sd.topday.title")}</div>
          <ul className="space-y-1 text-sm text-sky-100">
            {dates.map((d, i) => (
              <li key={`d-${i}`}>
                <span className="font-medium">{fmtLocalDate(d.date, locale)}</span>
                {d.tags && d.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {d.tags.slice(0, 6).map((tag, j) => (
                      <span key={`tag-${j}`} className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(cautions.length > 0 || cautionDays.length > 0) && (
        <div className="mb-3">
          <div className="mb-1 text-sm font-medium text-amber-300">{t("sd.caution.title")}</div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-amber-100">
            {cautions.map((c, i) => (
              <li key={`c-${i}`}>{c}</li>
            ))}
            {cautionDays.length > 0 && (
              <li key="cdays">
                {t("sd.caution.days")}: {cautionDays.map((d) => fmtLocalDate(d, locale)).join(", ")}
              </li>
            )}
          </ul>
        </div>
      )}

      {explain.length > 0 && (
        <div>
          <div className="mb-1 text-sm font-medium text-slate-300">{t("sd.why.title")}</div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-200">
            {explain.map((s, i) => (
              <li key={`e-${i}`}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------- Main ---------- */
export default function ShubhDinClient({ showTitle = true }: { showTitle?: boolean }) {
  const { t, locale } = useI18n();
  const tOr = useCallback(
    (key: string, fallback: string, vars?: KeyArgs) => {
      const out = t(key, vars);
      return out === key ? fallback : out;
    },
    [t]
  );

  const [saved, setSaved] = useState<{
      name?: string;
      dob?: string;
      tob?: string;
      tzId?: string;
      place?: string;
    } | null>(null);


  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);

  const name = saved?.name || "";
  const dobLine = useMemo(() => {
    if (!saved?.dob) return "";
    return formatDobTime(saved.dob, saved.tob, saved.tzId);
  }, [saved]);

  // params loaded once from Create
  const [params, setParams] = useState<{
    datetime: string;
    lat: number;
    lon: number;
    tzId: TzId;
  } | null>(null);

  // fetch state
  const [resp, setResp] = useState<BackendResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchAbortRef = useRef<AbortController | null>(null);

  // 1) Read saved Create inputs
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        dob?: string;
        tob?: string;
        tzId?: TzId;
        lat?: string | number;
        lon?: string | number;
      };
      if (saved?.dob && saved?.tob && saved?.tzId && saved?.lat != null && saved?.lon != null) {
        const datetime = localCivilToUtcIso(saved.dob, saved.tob, saved.tzId);
        const lat = parseFloat(String(saved.lat));
        const lon = parseFloat(String(saved.lon));
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          setParams({ datetime, lat, lon, tzId: saved.tzId });
        }
      }
    } catch (e) {
      console.warn("[ShubhDinClient] failed to parse saved state:", e);
    }
  }, []);

  const doFetch = useCallback(
    async (p: { datetime: string; lat: number; lon: number; tzId: TzId }) => {
      const { datetime, lat, lon, tzId } = p;
      const tz_offset_hours = TZ_HOURS[tzId];
      const horizon_months = 24;

      fetchAbortRef.current?.abort();
      const controller = new AbortController();
      fetchAbortRef.current = controller;

      try {
        setLoading(true);
        setErr(null);

        const payload: Record<string, unknown> = {
          datetime,
          lat,
          lon,
          tz_offset_hours,
          horizon_months,
        };

        const res = await fetch("/api/shubhdin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok) {
          const msg = `HTTP ${res.status}`;
          console.error("[/api/shubhdin] fetch failed:", msg);
          throw new Error(msg);
        }

        const json = (await res.json()) as BackendResponse;
        setResp(json);
      } catch (e: unknown) {
        if (isAbortError(e)) return;
        const msg = e instanceof Error ? e.message : "Failed to load";
        console.error("[/shubhdin] error:", e);
        setErr(msg);
        setResp(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 2) Fetch once params are known (and on retry)
  useEffect(() => {
    if (!params) return;
    void doFetch(params);
    return () => {
      fetchAbortRef.current?.abort();
    };
  }, [params, doFetch]);

  const results = useMemo(() => resp?.results ?? [], [resp]);
  const handleRetry = useCallback(() => {
    if (params) void doFetch(params);
  }, [params, doFetch]);

  return (
    <div className="px-0 md:px-0 pt-0">
      {/* Page header */}
      {showTitle && (
        <header className="mb-4" aria-labelledby="sd-h1">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 border border-cyan-400/40 px-3 py-1 text-cyan-100 text-xs font-medium">
            {tOr("home.shubhdin.badge", "Next 2 yrs")}
          </div>
          <h1 id="sd-h1" className="mt-2 text-2xl md:text-3xl font-semibold text-white">
            {tOr("sd.page.title", "ShubhDin — Next 2 yrs")}
          </h1>

          {/* ✅ Added Name + DOB */}
          <div className="mt-2 text-xs md:text-sm text-slate-400 leading-relaxed">
            <p>Name: {name || "___"}</p>
            {dobLine && <p>DOB: {dobLine}</p>}
          </div>

          <p className="mt-2 text-slate-300">
            {tOr(
              "sd.page.sub",
              "Pick the right month, not just a date — data-backed Vedic windows for promotions, job change, property, marriage and more."
            )}
          </p>
          {/* 🔥 SHUBHDIN TOP AD SLOT */}
          <div className="my-6 mx-auto max-w-4xl">
            <AdSlot
              slot={SHUBHDIN_TOP_SLOT_ID}
              format="auto"
              fullWidthResponsive={true}
              minHeight={250}
            />
          </div>

        </header>
      )}

      {/* Body */}
      {!params ? (
        <div className="text-slate-300">
          {tOr(
            "sd.prompt_fill_create",
            "Please fill the Create tab first so we can read your lat/lon/tz from the saved state."
          )}
        </div>
      ) : (
        <section
          className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5"
          aria-busy={loading ? "true" : "false"}
        >
          {loading && (
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-white/60">loading…</span>
            </div>
          )}

          {err && (
            <div className="text-sm text-red-300">
              <div>Error: {err}</div>
              <button
                onClick={handleRetry}
                className="mt-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-white/90 hover:bg-white/20"
              >
                Retry
              </button>
            </div>
          )}

          {!err && resp && (
            <div className="space-y-4">
              {results.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {results.map((r) => (
                    <GoalCard key={r.goal} r={r} />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-white/80">
                  {tOr("sd.empty.goal", "No notable windows for this goal.")}
                </div>
              )}

              <div className="pt-2 text-xs text-white/50">
                {t("sd.generated_at", {
                  dt: resp.generated_at
                    ? new Date(resp.generated_at).toLocaleString(locale)
                    : new Date().toLocaleString(locale),
                  tz: params.tzId,
                } as KeyArgs) ||
                  `${new Date(resp.generated_at || Date.now()).toLocaleString(locale)} • TZ: ${params.tzId}`}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
