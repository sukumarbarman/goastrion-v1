"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../lib/i18n";

/* ---------- Types: backend shape (extended to include *_t) ---------- */
type BackendSpan = { start: string; end: string; days?: number };
type BackendWindow = { start: string; end: string; duration_days?: number };
type BackendTagT = { key: string; args?: Record<string, unknown> };
type BackendExplainT = { key: string; args?: Record<string, unknown> };
type BackendCautionT = { key: string; args?: Record<string, unknown> };
type BackendHeadlineT =
  | { key: "sd.headline.best_windows"; args: { spans: Array<{ start: string; end: string; days: number }> } }
  | { key: string; args?: Record<string, unknown> };

type BackendDate = {
  date: string;
  score?: number;
  tags?: string[];
  tags_t?: BackendTagT[]; // localized tags
};

type BackendResult = {
  goal: string;
  headline?: string;
  headline_t?: BackendHeadlineT;
  score?: number;
  confidence?: string;
  dates?: BackendDate[];
  windows?: BackendWindow[];
  explain?: string[];
  explain_t?: BackendExplainT[];
  cautions?: string[];
  cautions_t?: BackendCautionT[];
  caution_days?: string[];
};

type BackendResponse = {
  query_id: string;
  generated_at: string; // UTC ISO
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
  tzId?: TzId; // default IST
  horizonMonths?: number; // default 24
  /** If provided, backend may tailor scoring, but we still render ALL goals */
  goal?: string; // optional hint for backend
  /** Optional display variant/hooks from parent */
  variant?: "smart" | "basic";
  displayMode?: "all" | "single";
};

const TZ_HOURS: Record<TzId, number> = { IST: 5.5, UTC: 0 };

function fmtDate(d: string) {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return d;
  }
}

function joinList(items: string[], comma = ", ") {
  return items.join(comma);
}

function fmtCautionDates(dates: string[]) {
  // Render as "Nov 17, 2025, Nov 18, 2025, ..."
  return joinList(dates.map(fmtDate));
}

/* ---------- Goal card ---------- */
function GoalCard({ r }: { r: BackendResult }) {
  const { t } = useI18n();

  const windows = r.windows ?? [];
  const cautions = r.cautions ?? [];
  const cautionDays = r.caution_days ?? [];
  const explain = r.explain ?? [];

  const headlineText = useMemo(() => {
    if (r.headline_t && r.headline_t.key === "sd.headline.best_windows") {
      const spans = (r.headline_t.args?.spans as BackendSpan[]) || [];
      const spanStrs = spans.map((sp) =>
        t("sd.headline.span", {
          start: fmtDate(sp.start),
          end: fmtDate(sp.end),
          days: sp.days ?? "",
        })
      );
      return `${t("sd.headline.prefix")}${joinList(spanStrs, t("sd.join.comma"))}`;
    }
    if (r.headline) return r.headline;
    if (windows.length > 0) {
      // client fallback from windows
      const spanStrs = windows.map((w) =>
        t("sd.headline.span", {
          start: fmtDate(w.start),
          end: fmtDate(w.end),
          days: w.duration_days ?? "",
        })
      );
      return `${t("sd.headline.prefix")}${joinList(spanStrs, t("sd.join.comma"))}`;
    }
    return undefined;
  }, [r.headline, r.headline_t, windows, t]);

  const topDay = r.dates?.[0];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-white font-semibold capitalize">
          {r.goal.replace(/_/g, " ")}
        </div>
        {typeof r.score === "number" && (
          <span className="text-xs rounded bg-white/10 px-2 py-0.5 text-white/80">
            {t("sd.score.label", { score: r.score })}
          </span>
        )}
      </div>

      {headlineText && (
        <div className="text-slate-300 text-sm mb-2">{headlineText}</div>
      )}

      {/* Best windows */}
      {windows.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 text-sm font-medium text-emerald-300">
            {t("sd.windows.title")}
          </div>
          <ul className="space-y-1">
            {windows.map((w, i) => (
              <li
                key={`w-${i}`}
                className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-sm text-emerald-100"
              >
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="font-medium">
                    {fmtDate(w.start)} → {fmtDate(w.end)}
                  </span>
                  {typeof w.duration_days === "number" && (
                    <span className="text-emerald-300/80">
                      ({w.duration_days}d)
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Day */}
      {topDay && (
        <div className="mb-3">
          <div className="mb-1 text-sm font-medium text-sky-300">
            {t("sd.topday.title")}
          </div>
          <div className="rounded-lg border border-sky-400/20 bg-sky-400/5 px-3 py-2 text-sm text-sky-100">
            <div className="mb-1">
              <span className="font-medium">{fmtDate(topDay.date)}</span>
              {typeof topDay.score === "number" && (
                <span className="ml-2">{t("sd.score.label", { score: topDay.score })}</span>
              )}
            </div>

            {/* Tags: prefer localized tags_t, fallback to raw tags */}
            <ul className="list-disc pl-5 space-y-1">
              {(topDay.tags_t && topDay.tags_t.length > 0
                ? topDay.tags_t.map((tag, idx) => (
                    <li key={`tt-${idx}`}>
                      {t(tag.key, (tag.args as Record<string, string | number>) ?? {})}
                    </li>
                  ))
                : (topDay.tags || []).map((txt, idx) => <li key={`tg-${idx}`}>{txt}</li>)
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Cautions: use localized cautions_t if present */}
      {(r.cautions_t?.length || cautions.length || cautionDays.length) ? (
        <div className="mb-3">
          <div className="mb-1 text-sm font-medium text-amber-300">
            {t("sd.caution.title")}
          </div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-amber-100">
            {(r.cautions_t || []).map((c, i) => {
              // special handling: sd.caution.no_big_txn may carry dates/more
              if (c.key === "sd.caution.no_big_txn" || c.key === "sd.caution_text.no_big_txn") {
                const dates = (c.args?.dates as string[] | undefined) ?? [];
                const moreNum = (c.args?.more as number | undefined);
                const more = moreNum && moreNum > 0 ? ` (+${moreNum} more)` : "";
                return (
                  <li key={`ct-${i}`}>
                    {t("sd.caution.no_big_txn", {
                      dates: fmtCautionDates(dates),
                      more,
                    })}
                  </li>
                );
              }
              return (
                <li key={`ct-${i}`}>
                  {t(c.key, (c.args as Record<string, string | number>) ?? {})}
                </li>
              );
            })}

            {cautions.map((c, i) => (
              <li key={`c-${i}`}>{c}</li>
            ))}

            {cautionDays.length > 0 && (
              <li key="cdays">
                {t("sd.caution.days")}: {fmtCautionDates(cautionDays)}
              </li>
            )}
          </ul>
        </div>
      ) : null}

      {/* Why these days? */}
      {(r.explain_t?.length || explain.length) ? (
        <div>
          <div className="mb-1 text-sm font-medium text-slate-300">
            {t("sd.why.title")}
          </div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-200">
            {(r.explain_t || []).map((e, i) => (
              <li key={`e-${i}`}>
                {t(e.key, (e.args as Record<string, string | number>) ?? {})}
              </li>
            ))}
            {explain.map((s, i) => (
              <li key={`ee-${i}`}>{s}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Empty state */}
      {windows.length === 0 &&
        (r.cautions_t?.length ?? 0) === 0 &&
        cautions.length === 0 &&
        (r.explain_t?.length ?? 0) === 0 &&
        explain.length === 0 && (
          <div className="text-sm text-white/70">{t("sd.empty.goal")}</div>
        )}
    </div>
  );
}

export default function ShubhDinInline({
  datetime,
  lat,
  lon,
  tzId = "IST",
  horizonMonths = 24,
  goal, // optional hint to backend
}: Props) {
  const { t } = useI18n();

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
    return () => {
      abort = true;
    };
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
              {t("sd.empty.goal")}
            </div>
          )}

          <div className="pt-2 text-xs text-white/50">
            {t("sd.generated_at", {
              ts: resp.generated_at
                ? new Date(resp.generated_at).toLocaleString()
                : new Date().toLocaleString(),
              tz: tzId,
            })}
          </div>
        </div>
      )}
    </section>
  );
}
