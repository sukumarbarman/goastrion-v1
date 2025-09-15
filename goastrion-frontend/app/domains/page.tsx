// app/domains/page.tsx
"use client";

import { useEffect, useState } from "react";
import Container from "../components/Container";
import { useI18n } from "../lib/i18n";
import ChartWithHighlights from "../components/ChartWithHighlights";
import HighlightController from "../components/HighlightController";
import { loadCreateState, fetchInsights } from "../lib/insightsClient";
import { useSkillHighlight as useHighlight } from "../hooks/useSkillHighlight";

type DomainItem = {
  key: string;                       // "Career" | "Finance" | ...
  score: number;                     // 0..100
  tier?: string;                     // "weak" | "moderate" | ...
  chips?: string[];                  // e.g. ["insights.career.chip10th","chip.benefic_harmony"]
  reasons?: string[];
  timeWindows?: any[];
  highlights?: {
    planets?: string[];              // ["Sun","Mars",...]
    houses?: number[];               // [10,6,11]
    aspects?: { p1: string; p2: string; name: string }[]; // [{p1:"Mercury", name:"Trine", p2:"Jupiter"}]
  };
};

type InsightsResponse = {
  insights?: { domains?: DomainItem[] };
};

export default function DomainsPage() {
  const { t } = useI18n();
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [svg, setSvg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const { highlightPlanets, lock, clear, setPreviewPlanets } = useHighlight();

  // fetch insights + chart svg
  useEffect(() => {
    const st = loadCreateState();
    if (!st) {
      setErr("No chart context found. Please generate a chart first.");
      return;
    }
    const tzHours = st.tzId === "IST" ? 5.5 : 0;
    const offset =
      tzHours >= 0
        ? `+${String(Math.floor(tzHours)).padStart(2, "0")}:${String(
            Math.round((tzHours % 1) * 60)
          ).padStart(2, "0")}`
        : `-${String(Math.floor(-tzHours)).padStart(2, "0")}:${String(
            Math.round((-tzHours % 1) * 60)
          ).padStart(2, "0")}`;
    const dtIsoUtc = new Date(`${st.dob}T${st.tob}:00${offset}`).toISOString();
    const lat = parseFloat(st.lat);
    const lon = parseFloat(st.lon);

    fetchInsights({
      datetime: dtIsoUtc,
      lat,
      lon,
      tz_offset_hours: tzHours,
    })
      .then((json: InsightsResponse) => {
        setDomains(json?.insights?.domains ?? []);
      })
      .catch((e) =>
        setErr(e instanceof Error ? e.message : "Failed to load domains")
      );

    fetch("/api/chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datetime: dtIsoUtc, lat, lon, tz_offset_hours: tzHours }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Chart error"))))
      .then((json) => setSvg(json?.svg ?? null))
      .catch(() => {
        /* ok to proceed without chart */
      });
  }, []);

  // helper to normalize chip keys so both "insights.*" and "chip.*" render
  const tChip = (key: string) => t(key.startsWith("insights.") ? key : `insights.${key}`);

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">{t("insights.pages.domainsTitle")}</h1>
        <p className="text-slate-400">{t("insights.pages.domainsSubtitle")}</p>
      </div>

      {err && <div className="text-red-300 text-sm mb-4">{err}</div>}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* LEFT: sticky chart */}
        <aside className="lg:col-span-5">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-4 lg:sticky lg:top-4">
            <div className="text-sm font-medium text-slate-200 mb-2">{t("insights.pages.highlightsTitle")}</div>
            <div className="aspect-square w-full rounded-xl overflow-hidden border border-white/10 bg-black/40">
              {svg ? (
                <ChartWithHighlights
                  svg={svg}
                  highlightPlanets={highlightPlanets}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  {t("common.loading")}
                </div>
              )}
            </div>
            <HighlightController onClear={clear} activeCount={highlightPlanets.length} />
          </div>
        </aside>

        {/* RIGHT: domain cards */}
        <section className="lg:col-span-7 grid md:grid-cols-2 gap-6">
          {domains.map((d) => {
            const hl = d.highlights ?? {};
            const planets = hl.planets ?? [];
            const houses = hl.houses ?? [];
            const aspects = hl.aspects ?? [];

            return (
              <div
                key={d.key}
                className="rounded-2xl border border-white/10 bg-black/10 p-4 hover:border-cyan-500/40 transition"
                onMouseLeave={() => setPreviewPlanets([])}
              >
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold">
                    {t(`insights.domains.${d.key.toLowerCase()}.title`)}
                  </div>
                  <div className="text-sm text-slate-300">{d.score}/100</div>
                </div>

                {/* score bar */}
                <div className="mt-2 w-full h-1.5 rounded bg-white/10 overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${d.score}%` }} />
                </div>

                {/* chips from backend (benefic harmony, house presence, etc.) */}
                {(d.chips?.length ?? 0) > 0 && (
                  <>
                    <div className="mt-3 text-slate-300 text-xs">
                      {t("insights.pages.highlightsTitle")}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {d.chips!.map((key) => (
                        <span
                          key={key}
                          className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-slate-200"
                          title={key}
                        >
                          {tChip(key)}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {/* key planets (interactive – highlight) */}
                {planets.length > 0 && (
                  <>
                    <div className="mt-4 text-slate-300 text-xs">
                      {t("insights.pages.highlightPlanets")}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {planets.map((p) => (
                        <button
                          key={p}
                          type="button"
                          className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10"
                          onMouseEnter={() => setPreviewPlanets([p])}
                          onFocus={() => setPreviewPlanets([p])}
                          onClick={() => lock([p])}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2">
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20"
                        onClick={() => lock(planets)}
                      >
                        {t("insights.actions.highlightAllDomain")}
                      </button>
                    </div>
                  </>
                )}

                {/* key houses (display only) */}
                {houses.length > 0 && (
                  <>
                    <div className="mt-4 text-slate-300 text-xs">
                      {t("insights.pages.highlightHouses")}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {houses.map((h) => (
                        <span
                          key={h}
                          className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-slate-200"
                        >
                          {t("insights.chips.house")} {h}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {/* key aspects */}
                {aspects.length > 0 && (
                  <>
                    <div className="mt-4 text-slate-300 text-xs">
                      {t("insights.pages.highlightAspects")}
                    </div>
                    <ul className="mt-1 space-y-1 text-slate-200 text-xs">
                      {aspects.map((a, i) => (
                        <li key={`${a.p1}-${a.name}-${a.p2}-${i}`} className="flex items-center gap-2">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                            {a.p1}
                          </span>
                          <span className="text-slate-400">— {t(`insights.aspects.${a.name}`)} —</span>
                          <span className="inline-block px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                            {a.p2}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </Container>
  );
}
