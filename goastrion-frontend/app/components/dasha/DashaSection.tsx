// goastrion-frontend/app/components/dasha/DashaSection.tsx
"use client";

import React from "react";
import { useI18n } from "../../lib/i18n";
import { DashaTimeline, Period, adsForMD } from "./types";
import AdSlot from "@/app/components/AdSlot";
import { DASHA_END_SLOT_ID } from "../../constants/ads";

function fmtDate(iso: string) {
  return iso?.slice(0, 10);
}
function fmtYearsAsYM(y: number) {
  const m = Math.round(y * 12);
  const yy = Math.floor(m / 12);
  const mm = m % 12;
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
      <div className="text-white font-semibold mb-3">
        {t("dasha.titleFullTimeline")}
      </div>

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
              <tr
                key={`${md.lord}-${i}`}
                className="border-b border-white/5"
              >
                <td className="py-1 pr-3 text-slate-200">
                  {planetLabel(md.lord, t)}
                </td>
                <td className="py-1 pr-3 text-slate-300">{fmtDate(md.start)}</td>
                <td className="py-1 pr-3 text-slate-300">{fmtDate(md.end)}</td>
                <td className="py-1 pr-3 text-slate-400">
                  {fmtYearsAsYM(md.years)}
                </td>
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
        {title}: {planetLabel(md.lord, t)} ({fmtDate(md.start)} →{" "}
        {fmtDate(md.end)})
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
                <tr
                  key={`${ad.lord}-${i}`}
                  className="border-b border-white/5"
                >
                  <td className="py-1 pr-3 text-slate-200">
                    {planetLabel(ad.lord, t)}
                  </td>
                  <td className="py-1 pr-3 text-slate-300">{fmtDate(ad.start)}</td>
                  <td className="py-1 pr-3 text-slate-300">{fmtDate(ad.end)}</td>
                  <td className="py-1 pr-3 text-slate-400">
                    {fmtYearsAsYM(ad.years)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---- Dasha Section (ONE bottom ad only) ---- */
export default function DashaSection({ v }: { v: DashaTimeline }) {
  const { t } = useI18n();

  return (
    <div className="mt-6 space-y-6 overflow-visible pb-8">

    {/* ---- DASHAS ABOUT SECTION ---- */}
<div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-4">
  <div className="flex items-start gap-3">
    <div
      className="shrink-0 mt-0.5 h-5 w-5 rounded-full border border-cyan-400/40 bg-cyan-500/15"
      aria-hidden
    />
    <div>
      <div className="text-slate-100 font-semibold">
        {t("dasha.about.title")}
      </div>

      <p className="text-slate-300 text-sm mt-1">
        {t("dasha.about.blurb")}
      </p>

      <div className="mt-3">
        <div className="text-slate-200 text-sm font-medium">
          {t("dasha.about.termsTitle")}
        </div>

        <ul className="mt-1 space-y-1.5 text-xs text-slate-300">
          <li>
            <span className="font-medium">{t("dasha.about.terms.maha")}</span>
          </li>
          <li>
            <span className="font-medium">{t("dasha.about.terms.antara")}</span>
          </li>
          <li>
            <span className="font-medium">{t("dasha.about.terms.transition")}</span>
          </li>
          <li>
            <span className="font-medium">{t("dasha.about.terms.peak")}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>

{/* ---- EXTRA DASHAS GUIDANCE ---- */}
<section className="mt-4 mb-6 p-4 rounded-xl bg-white/5 border border-white/10 text-slate-200">
  <h3 className="text-lg font-semibold text-white mb-2">
    {t("dasha.extra.howTitle")}
  </h3>

  <p className="text-sm leading-relaxed text-slate-300">
    {t("dasha.extra.howBody")}
  </p>

  <h3 className="mt-4 text-lg font-semibold text-white mb-2">
    {t("dasha.extra.benefitsTitle")}
  </h3>

  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-300">
    <li>{t("dasha.extra.b1")}</li>
    <li>{t("dasha.extra.b2")}</li>
    <li>{t("dasha.extra.b3")}</li>
    <li>{t("dasha.extra.b4")}</li>
  </ul>

  <h3 className="mt-4 text-lg font-semibold text-white mb-2">
    {t("dasha.extra.exampleTitle")}
  </h3>

  <p className="text-sm leading-relaxed text-slate-300">
    {t("dasha.extra.exampleBody")}
  </p>
</section>


      {/* Mahadasha Table */}
      <MDTable v={v} />

      {/* All Antardashas */}
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

      {/* ----- ONLY ONE AD AT BOTTOM (SAFE FOR TOOL PAGES) ----- */}
      <div className="mx-auto my-12 w-full max-w-3xl">
        <AdSlot
          slot={DASHA_END_SLOT_ID}   // FINAL safe bottom slot
          format="auto"
          fullWidthResponsive={true}
          minHeight={280}
        />
      </div>
    </div>
  );
}
