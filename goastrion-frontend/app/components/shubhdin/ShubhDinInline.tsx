"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../lib/i18n";

/* ---------- Types: backend shape ---------- */
type BackendWindow = { start: string; end: string; duration_days?: number };
type BackendDate = {
  date: string;
  score?: number;
  tags?: string[];
  // new: localized tag payload
  tags_t?: Array<{ key: string; args?: Record<string, unknown> }>;
};

type BackendResult = {
  goal: string;
  headline?: string;
  // new: localized headline payload
  headline_t?: { key: string; args?: Record<string, unknown> };
  score?: number;
  confidence?: string;
  dates?: BackendDate[];
  windows?: BackendWindow[];
  explain?: string[];
  // new: localized explain payload
  explain_t?: Array<{ key: string; args?: Record<string, unknown> }>;
  cautions?: string[];
  // new: localized cautions payload
  cautions_t?: Array<{ key: string; args?: Record<string, unknown> }>;
  caution_days?: string[];
};

type BackendResponse = {
  query_id: string;
  generated_at: string;   // UTC ISO
  tz?: string;
  horizon_months?: number;
  confidence_overall?: string;
  results?: BackendResult[];
};

type TzId = "IST" | "UTC";

type Props = {
  /** Anchor moment in UTC ISO (use NOW) */
  datetime: string;
  lat: number;
  lon: number;
  tzId?: TzId;                 // default IST
  horizonMonths?: number;      // default 24
  /** If provided, backend may tailor scoring, but we still render ALL goals */
  goal?: string;               // optional hint for backend
  // ====== optional props you had in caller; keep for compatibility ======
  variant?: "smart";
  displayMode?: "all" | "single";
};

const TZ_HOURS: Record<TzId, number> = { IST: 5.5, UTC: 0 };

/* ---------- Helpers ---------- */
function ensureDate(d: string) {
  try { return new Date(d); } catch { return null as unknown as Date; }
}
function fmtLocalDate(d: string, locale?: string) {
  const dt = ensureDate(d);
  if (!dt) return d;
  return dt.toLocaleDateString(locale, { year: "numeric", month: "short", day: "2-digit" });
}

/** Render server i18n items (array of {key,args}) via t(); fallback to nothing if key missing */
function renderItemsT(
  t: (k: string, v?: Record<string, unknown>) => string,
  items?: Array<{ key: string; args?: Record<string, unknown> }>
): string[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map(({ key, args }) => t(key, args));
}

/** Render tags_t (each item) using t(); if a key isn’t found, fallback by composing known patterns */
function renderTagsT(
  t: (k: string, v?: Record<string, unknown>) => string,
  tags_t?: BackendDate["tags_t"]
): string[] {
  if (!tags_t || !Array.isArray(tags_t)) return [];
  return tags_t.map(({ key, args }) => {
    const out = t(key, args);
    // if t returned the key name (missing), try known patterns:
    if (out === key && args) {
      // known patterns we emit from backend:
      // sd.aspect.tag => "{p1} {name} -> {p2}"
      // sd.dasha.md   => "MD:{lord}"
      // sd.dasha.ad   => "AD:{lord}"
      if (key === "sd.aspect.tag") {
        return t("sd.aspect.tag", args); // will still be the key if missing, but keeps consistency
      }
      if (key === "sd.dasha.md") {
        return t("sd.dasha.md", args);
      }
      if (key === "sd.dasha.ad") {
        return t("sd.dasha.ad", args);
      }
    }
    return out;
  });
}

/** Headline: prefer headline_t; if absent, use headline string */
function renderHeadline(
  t: (k: string, v?: Record<string, unknown>) => string,
  r: BackendResult,
  locale?: string
): string | undefined {
  if (r.headline_t?.key === "sd.headline.best_windows") {
    const spans = (r.headline_t.args?.spans as Array<{start:string;end:string;days:number}>) || [];
    const parts = spans.map(s =>
      t("sd.headline.span", {
        start: fmtLocalDate(s.start, locale),
        end: fmtLocalDate(s.end, locale),
        days: s.days,
      })
    );
    // prefix is localized too
    return t("sd.headline.prefix") + parts.join(t("sd.join.comma"));
  }
  // fallback: raw headline
  return r.headline;
}

/* ---------- UI: GoalCard ---------- */
function GoalCard({ r }: { r: BackendResult }) {
  const { t, locale } = useI18n(); // we exposed locale in context earlier
  const windows = r.windows ?? [];
  const cautionDays = r.caution_days ?? [];

  // Prefer localized explain/cautions if present
  const explain = r.explain_t ? renderItemsT(t, r.explain_t) : (r.explain ?? []);
  const cautions = r.cautions_t ? renderItemsT(t, r.cautions_t) : (r.cautions ?? []);

  // Headline
  const headline = renderHeadline(t, r, locale);

  // Dates (top date row) – render tags_t if present
  const dates = (r.dates ?? []).map(d => ({
    ...d,
    tags: d.tags_t ? renderTagsT(t, d.tags_t) : (d.tags ?? []),
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
            {cautions.map((c, i) => <li key={`c-${i}`}>{c}</li>)}
            {cautionDays.length > 0 && (
              <li key="cdays">
                {t("sd.caution.days")}: {cautionDays.map(d => fmtLocalDate(d, locale)).join(", ")}
              </li>
            )}
          </ul>
        </div>
      )}

      {explain.length > 0 && (
        <div>
          <div className="mb-1 text-sm font-medium text-slate-300">{t("sd.why.title")}</div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-200">
            {explain.map((s, i) => <li key={`e-${i}`}>{s}</li>)}
          </ul>
        </div>
      )}

      {windows.length === 0 && cautions.length === 0 && explain.length === 0 && dates.length === 0 && (
        <div className="text-sm text-white/70">{/* Keep a localized generic fallback if you add one */}</div>
      )}
    </div>
  );
}

/* ---------- Main component ---------- */
export default function ShubhDinInline({
  datetime,
  lat,
  lon,
  tzId = "IST",
  horizonMonths = 24,
  goal, // optional hint to backend
}: Props) {
  const { t, locale } = useI18n();
  const [resp, setResp] = useState<BackendResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const tzOffsetHours = TZ_HOURS[tzId];

  useEffect(() => {
    let abort = false;
    async function run() {
      if (!datetime || !Number.isFinite(lat) || !Number.isFinite(lon)) return;
      try {
        setLoading(true);
        setErr(null);

        const res = await fetch("/api/shubhdin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            datetime,
            lat,
            lon,
            tz_offset_hours: tzOffsetHours,
            horizon_months: horizonMonths,
            goal, // backend may tailor scores but will still return multiple goals
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as BackendResponse;
        if (!abort) setResp(json);
      } catch (e: unknown) {
        if (!abort) setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!abort) setLoading(false);
      }
    }
    run();
    return () => { abort = true; };
  }, [datetime, lat, lon, tzOffsetHours, horizonMonths, goal]);

  const results = useMemo(() => resp?.results ?? [], [resp]);

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t("sd.title")}</h2>
        {loading && <span className="text-xs text-white/60">loading…</span>}
      </div>

      {err && <div className="text-sm text-red-300">Error: {err}</div>}

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
              {/* Optional: t("sd.no_windows") if you add it */}
            </div>
          )}

          <div className="pt-2 text-xs text-white/50">
            {/* “Generated … TZ …” could be localized later if desired */}
            {t("sd.generated_at", {
              // If you add this key, you can localize the line.
              // Example: "Generated {dt} • TZ: {tz}"
              dt: resp.generated_at ? new Date(resp.generated_at).toLocaleString(locale) : new Date().toLocaleString(locale),
              tz: tzId,
            }) || `${new Date(resp.generated_at || Date.now()).toLocaleString(locale)} • TZ: ${tzId}`}
          </div>
        </div>
      )}
    </section>
  );
}
