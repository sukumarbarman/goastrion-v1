// goastrion-frontend/app/components/dasha/DashaSection.tsx
"use client";

import React from "react";
import { useI18n } from "../../lib/i18n";
import { DashaTimeline, Period, adsForMD } from "./types";
import AdSlot from "@/app/components/AdSlot"; // ✅ Added for AdSense integration

function fmtDate(iso: string) {
  return iso?.slice(0, 10);
}
function fmtYearsAsYM(y: number) {
  const m = Math.round(y * 12),
    yy = Math.floor(m / 12),
    mm = m % 12;
  return `${yy > 0 ? `${yy} y ` : ""}${mm} m`.trim();
}
function planetLabel(eng: string, t: (k: string) => string) {
  const k = eng.toLowerCase();
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
  return map[k] || eng;
}
const tOr = (t: (k: string) => string, k: string, fb: string) =>
  t(k) !== k ? t(k) : fb;

/* ---- Mahadasha table ---- */
function MDTable({ v }: { v: DashaTimeline }) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4 overflow-visible">
      <div className="text-white font-semibold mb-3">{t("dasha.titleFullTimeline")}</div>
      <div className="overflow-x-auto">
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

/* ---- Antardasha table ---- */
function ADTable({ title, md, v }: { title: string; md: Period; v: DashaTimeline }) {
  const { t } = useI18n();
  const ads = adsForMD(v, md);
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4 overflow-visible min-w-0">
      <div className="text-white font-semibold mb-2">
        {title}: {planetLabel(md.lord, t)} ({fmtDate(md.start)} → {fmtDate(md.end)})
      </div>
      {ads.length === 0 ? (
        <div className="text-slate-400 text-sm">{t("dasha.noAntardasha")}</div>
      ) : (
        <div className="overflow-x-auto">
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

/* ---- Dasha Section (with AdSlots) ---- */
export default function DashaSection({ v }: { v: DashaTimeline }) {
  const { t } = useI18n();

  return (
    <div className="mt-6 space-y-6 overflow-visible pb-8">
      <MDTable v={v} />

      {/* ✅ Ad after Mahadasha table */}
      <div className="mx-auto my-8 w-full max-w-3xl">
        <AdSlot
          slot="8234373966" // replace with Dasha-specific slot ID later
          format="auto"
          fullWidthResponsive={true}
          minHeight={280}
        />
      </div>

      <div className="space-y-6 overflow-visible">
        {v.mahadashas.map((md, idx) => (
          <ADTable
            key={`${md.lord}-${idx}-${md.start}`}
            title={tOr(t, "dasha.mdTitle", "Mahadasha")}
            md={md}
            v={v}
          />
        ))}
      </div>

      {/* ✅ Ad after all Antardashas */}
      <div className="mx-auto my-10 w-full max-w-3xl">
        <AdSlot
          slot="2982047285"
          format="auto"
          fullWidthResponsive={true}
          minHeight={280}
        />
      </div>
    </div>
  );
}
