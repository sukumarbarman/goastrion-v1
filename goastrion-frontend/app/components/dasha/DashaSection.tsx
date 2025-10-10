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

/* ---- Small blocks ---- */
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

/* ---- Tiny summaries for Current/Next AD ---- */
function ADSummary({ label, md, adList }: { label: string; md: Period; adList: Period[] }) {
  const { t } = useI18n();
  // derive current AD within md:
  const now = Date.now();
  const curAd = adList.find(a => now >= new Date(a.start).getTime() && now < new Date(a.end).getTime());
  const nextAd = (() => {
    if (!curAd) return adList[0];
    const i = adList.findIndex(a => a.start === curAd.start && a.lord === curAd.lord);
    return i >= 0 && i + 1 < adList.length ? adList[i + 1] : undefined;
  })();

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
      <div className="font-semibold text-white mb-1">{label}</div>
      {curAd ? (
        <>
          <div className="text-slate-200">
            {t("dasha.mdLabel")} {planetLabel(md.lord, t)} · {t("dasha.adLabel")} {planetLabel(curAd.lord, t)}
          </div>
          <div className="text-slate-400">{fmtDate(curAd.start)} → {fmtDate(curAd.end)}</div>
        </>
      ) : (
        <div className="text-slate-400">{t("dasha.noCurrentAD")}</div>
      )}
      {nextAd && (
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

      {/* Summary row */}
      {mdCur && (
        <div className="grid md:grid-cols-3 gap-4">
          <ADSummary
            label={t("dasha.curADTitle")}
            md={mdCur}
            adList={v.antardashas[keyFor(mdCur)] || []}
          />
          {mdPrev && (
            <ADSummary
              label={t("dasha.prevADTitle")}
              md={mdPrev}
              adList={v.antardashas[keyFor(mdPrev)] || []}
            />
          )}
          {mdNext && (
            <ADSummary
              label={t("dasha.nextADTitle")}
              md={mdNext}
              adList={v.antardashas[keyFor(mdNext)] || []}
            />
          )}
        </div>
      )}

      {/* Full AD tables */}
      <div className="grid md:grid-cols-3 gap-6">
        {mdPrev && <ADTable title={t("dasha.prevADTitle")} md={mdPrev} v={v} />}
        {mdCur  && <ADTable title={t("dasha.curADTitle")}  md={mdCur}  v={v} />}
        {mdNext && <ADTable title={t("dasha.nextADTitle")} md={mdNext} v={v} />}
      </div>
    </div>
  );
}
