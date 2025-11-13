// goastrion-frontend/app/components/shubhdin/ShubhDinInline.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../lib/i18n";


/* ---------- Types: backend shape ---------- */
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
type TzId = "IST" | "UTC";
type KeyArgs = Record<string, string | number>;

/* ---------- Helper functions ---------- */
function ensureDate(d: string) {
  try {
    return new Date(d);
  } catch {
    return null as unknown as Date;
  }
}
function fmtLocalDate(d: string, locale?: string) {
  const dt = ensureDate(d);
  if (!dt) return d;
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

/* ---------- UI: GoalCard ---------- */
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
          {t(`sd.goals.${r.goal}`) !== `sd.goals.${r.goal}`
            ? t(`sd.goals.${r.goal}`)
            : r.goal.replace(/_/g, " ")}
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
                      <span
                        key={`tag-${j}`}
                        className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/80"
                      >
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

/* ---------- Main component ---------- */
type Props = {
  datetime: string;
  lat: number;
  lon: number;
  tzId?: TzId;
  horizonMonths?: number;
  goal?: string;
  showTitle?: boolean;
  variant?: "smart";
  displayMode?: "all" | "single";
  saturnCapDays?: number;
  goals?: string[];
  businessType?: string;
};

const TZ_HOURS: Record<TzId, number> = { IST: 5.5, UTC: 0 };

export default function ShubhDinInline({
  datetime,
  lat,
  lon,
  tzId = "IST",
  horizonMonths = 24,
  goal,
  saturnCapDays,
  goals,
  businessType,
  showTitle = false,
}: Props) {
  const { t, locale } = useI18n();
  const [resp, setResp] = useState<BackendResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const tzOffsetHours = TZ_HOURS[tzId];

  useEffect(() => {
    let abort = false;
    (async () => {
      if (!datetime || !Number.isFinite(lat) || !Number.isFinite(lon)) return;
      try {
        setLoading(true);
        setErr(null);

        const payload: Record<string, unknown> = {
          datetime,
          lat,
          lon,
          tz_offset_hours: tzOffsetHours,
          horizon_months: horizonMonths,
        };
        if (goal) payload.goal = goal;
        if (typeof saturnCapDays === "number" && saturnCapDays > 0)
          payload.saturn_cap_days = Math.floor(saturnCapDays);
        if (Array.isArray(goals) && goals.length > 0) payload.goals = goals;
        if (typeof businessType === "string" && businessType.trim())
          payload.business = { type: businessType.trim().toLowerCase() };

        const res = await fetch("/api/shubhdin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as BackendResponse;
        if (!abort) setResp(json);
      } catch (e: unknown) {
        if (!abort) setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, [datetime, lat, lon, tzOffsetHours, horizonMonths, goal, saturnCapDays, goals, businessType]);

  const results = useMemo(() => resp?.results ?? [], [resp]);

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
      {(showTitle || loading) && (
        <div className="mb-3 flex items-center justify-between">
          {showTitle && <h2 className="text-lg font-semibold text-white">{t("sd.title")}</h2>}
          {loading && <span className="text-xs text-white/60">loading…</span>}
        </div>
      )}



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
            <div className="text-sm text-white/80">{t("sd.no_windows")}</div>
          )}



          <div className="pt-2 text-xs text-white/50">
            {t("sd.generated_at", {
              dt: resp.generated_at
                ? new Date(resp.generated_at).toLocaleString(locale)
                : new Date().toLocaleString(locale),
              tz: tzId,
            } as KeyArgs) ||
              `${new Date(resp.generated_at || Date.now()).toLocaleString(locale)} • TZ: ${tzId}`}
          </div>
        </div>
      )}
    </section>
  );
}
