// app/skills/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "../components/Container";
import { useI18n } from "../lib/i18n";
import ChartWithHighlights from "../components/ChartWithHighlights";
import { loadCreateState, fetchInsights } from "../lib/insightsClient";
import { CHIP_TO_PLANETS } from "../lib/skillsMapping";
import { useSkillHighlight } from "../hooks/useSkillHighlight";
import HighlightController from "../components/HighlightController";

type InsightsResponse = {
  context?: { /* optional debug */ };
  insights?: {
    skills?: { key: string; score: number; chips?: string[] }[];
  };
};

export default function SkillsPage() {
  const { t } = useI18n();
  const [skills, setSkills] = useState<InsightsResponse["insights"]["skills"]>([]);
  const [svg, setSvg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const { highlightPlanets, lock, clear, setPreviewPlanets } = useSkillHighlight();

  // fetch insights + chart svg
  useEffect(() => {
    const st = loadCreateState();
    if (!st) { setErr("No chart context found. Please generate a chart first."); return; }
    const tzHours = st.tzId === "IST" ? 5.5 : 0;
    const offset = tzHours >= 0
      ? `+${String(Math.floor(tzHours)).padStart(2,"0")}:${String(Math.round((tzHours%1)*60)).padStart(2,"0")}`
      : `-${String(Math.floor(-tzHours)).padStart(2,"0")}:${String(Math.round((-tzHours%1)*60)).padStart(2,"0")}`;
    const dtIsoUtc = new Date(`${st.dob}T${st.tob}:00${offset}`).toISOString();

    fetchInsights({
      datetime: dtIsoUtc,
      lat: parseFloat(st.lat),
      lon: parseFloat(st.lon),
      tz_offset_hours: tzHours,
    })
      .then(json => {
        setSkills(json?.insights?.skills ?? []);
      })
      .catch(e => setErr(e instanceof Error ? e.message : "Failed to load skills"));

    // fetch chart SVG from your backend proxy route
    fetch("/api/chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        datetime: dtIsoUtc,
        lat: parseFloat(st.lat),
        lon: parseFloat(st.lon),
        tz_offset_hours: tzHours,
      })
    })
      .then(r => r.ok ? r.json() : Promise.reject(new Error("Chart error")))
      .then(json => setSvg(json?.svg ?? null))
      .catch(() => {/* leave svg null; we still render page */});
  }, []);

  // helper: compute highlight list from a skill's chips
  const planetsForSkill = (chips: string[] | undefined) => {
    const planets = new Set<string>();
    (chips ?? []).forEach(k => {
      (CHIP_TO_PLANETS[k] ?? []).forEach(p => planets.add(p));
    });
    return Array.from(planets);
  };

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">{t("insights.pages.skillsTitle")}</h1>
        <p className="text-slate-400">{t("insights.pages.skillsSubtitle")}</p>
      </div>

      {err && <div className="text-red-300 text-sm mb-4">{err}</div>}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* LEFT: sticky chart */}
        <aside className="lg:col-span-5">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-4 lg:sticky lg:top-4">
            <div className="text-sm font-medium text-slate-200 mb-2">Chart</div>
            <div className="aspect-square w-full rounded-xl overflow-hidden border border-white/10 bg-black/40">
              {svg ? (
                <ChartWithHighlights svg={svg} highlightPlanets={highlightPlanets} className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  {t("common.loading")}
                </div>
              )}
            </div>
            <HighlightController onClear={clear} activeCount={highlightPlanets.length} />
          </div>
        </aside>

        {/* RIGHT: skills list */}
        <section className="lg:col-span-7 grid md:grid-cols-2 gap-6">
          {(skills ?? []).map((s) => {
            const planetList = planetsForSkill(s.chips);
            return (
              <div
                key={s.key}
                className="rounded-2xl border border-white/10 bg-black/10 p-4 hover:border-cyan-500/40 transition"
                onMouseLeave={() => setPreviewPlanets([])}
              >
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold">{t(`insights.skills.${s.key}`)}</div>
                  <div className="text-sm text-slate-300">{s.score}/100</div>
                </div>
                <div className="mt-2 w-full h-1.5 rounded bg-white/10 overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${s.score}%` }} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(s.chips ?? []).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10"
                      onMouseEnter={() => setPreviewPlanets(CHIP_TO_PLANETS[key] ?? [])}
                      onFocus={() => setPreviewPlanets(CHIP_TO_PLANETS[key] ?? [])}
                      onClick={() => lock(planetsForSkill([key]))}
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>

                {planetList.length > 0 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20"
                      onClick={() => lock(planetList)}
                    >
                      Highlight all for this skill
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </Container>
  );
}
