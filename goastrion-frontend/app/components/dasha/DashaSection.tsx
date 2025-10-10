"use client";
import React from "react";
import { useI18n } from "../../lib/i18n";
import { DashaTimeline, Period, keyFor, findCurrentPrevNextMD } from "./types";

function fmtDate(iso: string) { return iso?.slice(0, 10); }
function fmtYearsAsYM(y: number) {
  const m = Math.round(y * 12), yy = Math.floor(m / 12), mm = m % 12;
  return `${yy > 0 ? `${yy} y ` : ""}${mm} m`.trim();
}
function planetLabel(eng: string, t: (k: string)=>string) {
  const k = eng.toLowerCase();
  const map: Record<string,string> = {
    sun: t("planets.sun"), moon: t("planets.moon"), mars: t("planets.mars"),
    mercury: t("planets.mercury"), jupiter: t("planets.jupiter"), venus: t("planets.venus"),
    saturn: t("planets.saturn"), rahu: t("planets.rahu"), ketu: t("planets.ketu"),
  };
  return map[k] || eng;
}
const lower = (s: string) => s?.toLowerCase?.() ?? s;
const hasKey = (t: (k:string)=>string, k: string) => t(k) !== k;

// Try array-based key first; fallback to comma text; finally []
function listFromI18n(t: (k:string)=>string, planet: string, kind: "good"|"slow"): string[] {
  const kArr = `dasha.summary.affinities.${planet}.${kind}`;
  const kTxt = `dasha.summary.affinitiesText.${planet}.${kind}`;
  if (hasKey(t, kArr)) {
    try {
      const v = (t as unknown as (k:string)=>unknown)(kArr);
      if (Array.isArray(v)) return v as string[];
    } catch {}
  }
  if (hasKey(t, kTxt)) {
    const s = t(kTxt);
    return String(s).split(",").map(x => x.trim()).filter(Boolean);
  }
  return [];
}

// Map custom domain keys to titles
function titleForDomain(key: string, t: (k:string)=>string) {
  const path = `insights.domains.${key}.title`;
  const v = t(path);
  if (v !== path) return v;
  const fallback: Record<string,string> = {
    business: "Business",
    outreach: "Outreach",
    "long-term-plans": "Long-term plans",
    "hard-negotiations": "Hard negotiations",
    "quick-wins": "Quick wins",
    "steady-routines": "Steady routines",
    research: "Research",
    "inner-work": "Inner work",
    home: "Home",
  };
  return fallback[key] || key.replace(/-/g, " ");
}

/* ---- Tables ---- */
function MDTable({ v }: { v: DashaTimeline }) {
  const { t } = useI18n();
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

function ADTable({ title, md, v }: { title: string; md: Period; v: DashaTimeline }) {
  const { t } = useI18n();
  const ads = v.antardashas?.[keyFor(md)] || [];
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

/* ---- Summaries (cur/prev/next) ---- */
function ADSummary({
  label,
  variant,
  md,
  adList,
}: {
  label: string;
  variant: "cur" | "prev" | "next";
  md: Period;
  adList: Period[];
}) {
  const { t } = useI18n();
  const now = Date.now();

  const curAd =
    variant === "cur"
      ? adList.find(a => now >= new Date(a.start).getTime() && now < new Date(a.end).getTime())
      : undefined;

  const firstAd = adList?.[0];
  const lastAd  = adList?.[adList.length - 1];

  const nextAd =
    variant === "cur"
      ? (() => {
          if (!adList?.length) return undefined;
          if (!curAd) return adList[0];
          const i = adList.findIndex(a => a.start === curAd.start && a.lord === curAd.lord);
          return i >= 0 && i + 1 < adList.length ? adList[i + 1] : undefined;
        })()
      : undefined;

  // Determine which AD to present & the readable line
  let showAd: Period | undefined;
  let readable = "";
  let whenLabel = "";

  if (variant === "cur") {
    showAd = curAd;
    readable = showAd
      ? t("dasha.summary.readable", { md: planetLabel(md.lord, t), ad: planetLabel(showAd.lord, t) })
      : t("dasha.noCurrentAD");
  } else if (variant === "prev") {
    showAd = lastAd;
    if (showAd) {
      readable = t("dasha.summary.prevReadable", { md: planetLabel(md.lord, t), ad: planetLabel(showAd.lord, t) });
      whenLabel = t("dasha.summary.lastADLabel");
    } else {
      readable = t("dasha.noAntardasha"); // no list for that MD
    }
  } else {
    showAd = firstAd;
    if (showAd) {
      readable = t("dasha.summary.nextReadable", { md: planetLabel(md.lord, t), ad: planetLabel(showAd.lord, t) });
      whenLabel = t("dasha.summary.firstADLabel");
    } else {
      readable = t("dasha.noAntardasha");
    }
  }

  // Guidance (themes/advice + good/slow) only when we have an AD to name
  const adLord = showAd?.lord;
  const adKeyBase = adLord ? `dasha.summary.planet.${lower(adLord)}` : "";
  const hasThemes = !!adLord && hasKey(t, `${adKeyBase}.themes`);
  const hasAdvice = !!adLord && hasKey(t, `${adKeyBase}.advice`);
  const goodList = adLord ? listFromI18n(t, adLord, "good") : [];
  const slowList = adLord ? listFromI18n(t, adLord, "slow") : [];

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
      <div className="font-semibold text-white mb-1">{label}</div>

      <div className="text-slate-200">{readable}</div>

      {showAd && (
        <>
          <div className="text-slate-400">
            {whenLabel ? `${whenLabel}: ` : ""}{fmtDate(showAd.start)} → {fmtDate(showAd.end)}
          </div>

          {(hasThemes || hasAdvice) && (
            <div className="mt-2 space-y-1 text-xs">
              {hasThemes && (
                <div className="text-slate-300">
                  <span className="font-medium">{t("dasha.summary.themesLabel")}:</span>{" "}
                  {t(`${adKeyBase}.themes`)}
                </div>
              )}
              {hasAdvice && (
                <div className="text-slate-300">
                  <span className="font-medium">{t("dasha.summary.adviceLabel")}:</span>{" "}
                  {t(`${adKeyBase}.advice`)}
                </div>
              )}
            </div>
          )}

          {(goodList.length > 0 || slowList.length > 0) && (
            <div className="mt-2 text-xs space-y-1">
              {goodList.length > 0 && (
                <div className="text-emerald-200">
                  <span className="font-medium">{t("dasha.summary.goodFor")}:</span>{" "}
                  {goodList.map((k) => titleForDomain(k, t)).join(", ")}
                </div>
              )}
              {slowList.length > 0 && (
                <div className="text-amber-200">
                  <span className="font-medium">{t("dasha.summary.goSlow")}:</span>{" "}
                  {slowList.map((k) => titleForDomain(k, t)).join(", ")}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {variant === "cur" && nextAd && (
        <div className="mt-2 text-slate-300">
          {t("dasha.nextADShort")}: {planetLabel(nextAd.lord, t)} ({fmtDate(nextAd.start)} → {fmtDate(nextAd.end)})
        </div>
      )}
    </div>
  );
}

export default function DashaSection({ v }: { v: DashaTimeline }) {
  const { t } = useI18n();
  const { prev, cur, next } = findCurrentPrevNextMD(v.mahadashas, new Date());
  const mdPrev = prev >= 0 ? v.mahadashas[prev] : undefined;
  const mdCur  = cur  >= 0 ? v.mahadashas[cur]  : undefined;
  const mdNext = next >= 0 ? v.mahadashas[next] : undefined;

  return (
    <div className="mt-6 space-y-6">
      <MDTable v={v} />

      {(mdPrev || mdCur || mdNext) && (
        <div className="grid md:grid-cols-3 gap-4">
          {mdCur && (
            <ADSummary
              label={t("dasha.curADTitle")}
              variant="cur"
              md={mdCur}
              adList={v.antardashas?.[keyFor(mdCur)] || []}
            />
          )}
          {mdPrev && (
            <ADSummary
              label={t("dasha.prevADTitle")}
              variant="prev"
              md={mdPrev}
              adList={v.antardashas?.[keyFor(mdPrev)] || []}
            />
          )}
          {mdNext && (
            <ADSummary
              label={t("dasha.nextADTitle")}
              variant="next"
              md={mdNext}
              adList={v.antardashas?.[keyFor(mdNext)] || []}
            />
          )}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {mdPrev && <ADTable title={t("dasha.prevADTitle")} md={mdPrev} v={v} />}
        {mdCur  && <ADTable title={t("dasha.curADTitle")}  md={mdCur}  v={v} />}
        {mdNext && <ADTable title={t("dasha.nextADTitle")} md={mdNext} v={v} />}
      </div>
    </div>
  );
}
