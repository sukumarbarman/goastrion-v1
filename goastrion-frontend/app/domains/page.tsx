// app/domains/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "../components/Container";
import { useI18n } from "../lib/i18n";
import ChartWithHighlights from "../components/ChartWithHighlights";
import { loadCreateState, fetchInsights } from "../lib/insightsClient";
import { useHighlight } from "../hooks/useSkillHighlight";

type DomainItem = {
  key: string;               // "Career" | "Finance" | ...
  score: number;             // 0..100
  tier?: string;             // "weak" | "moderate" | "strong" | "excellent"
  chips?: string[];
  reasons?: string[];
  timeWindows?: Array<any>;
  highlights?: {
    planets?: string[];
    houses?: number[];
    aspects?: { p1: string; p2: string; name: string }[];
  };
};

type InsightsResponse = {
  context?: {
    planets_in_houses?: Record<string, string[]>;
  };
  insights?: {
    domains?: DomainItem[];
  };
};

// --- Friendly labels (lightweight, local) -----------------------------------
const HOUSE_GLOSS: Record<number, string> = {
  1: "Self, vitality",
  2: "Wealth, speech",
  3: "Courage, skills",
  4: "Home, foundations",
  5: "Creativity, studies",
  6: "Work, health",
  7: "Partnerships",
  8: "Depth, transformations",
  9: "Dharma, higher learning",
  10: "Career, status",
  11: "Gains, networks",
  12: "Retreat, expenses",
};

const PLANET_GLOSS: Record<string, string> = {
  Sun: "authority, vitality",
  Moon: "mind, flow",
  Mars: "drive, initiative",
  Mercury: "analysis, communication",
  Jupiter: "growth, wisdom",
  Venus: "art, harmony",
  Saturn: "discipline, structure",
  Rahu: "ambition, surge",
  Ketu: "detachment, insight",
};

const ASPECT_TONE: Record<string, string> = {
  Trine: "harmonious",
  Sextile: "supportive",
  Conjunction: "intense",
  Opposition: "polarizing",
  Square: "challenging",
};

function oxfordJoin(items: string[], finalSep = " and "): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return items.join(finalSep);
  return items.slice(0, -1).join(", ") + "," + finalSep + items[items.length - 1];
}

export default function DomainsPage() {
  const { t } = useI18n();

  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [svg, setSvg] = useState<string | null>(null);
  const [ctxHouses, setCtxHouses] = useState<Record<string, string[]>>({});
  const [err, setErr] = useState<string | null>(null);

  const { highlightPlanets, lock, clear, setPreviewPlanets } = useHighlight();

  useEffect(() => {
    const st = loadCreateState();
    if (!st) { setErr("No chart context found. Please generate a chart first."); return; }

    const tzHours = st.tzId === "IST" ? 5.5 : 0;
    const offset =
      tzHours >= 0
        ? `+${String(Math.floor(tzHours)).padStart(2,"0")}:${String(Math.round((tzHours%1)*60)).padStart(2,"0")}`
        : `-${String(Math.floor(-tzHours)).padStart(2,"0")}:${String(Math.round((-tzHours%1)*60)).padStart(2,"0")}`;
    const dtIsoUtc = new Date(`${st.dob}T${st.tob}:00${offset}`).toISOString();

    // Insights + context
    fetchInsights({
      datetime: dtIsoUtc,
      lat: parseFloat(st.lat),
      lon: parseFloat(st.lon),
      tz_offset_hours: tzHours,
    })
      .then((json: InsightsResponse) => {
        setDomains(json?.insights?.domains ?? []);
        setCtxHouses(json?.context?.planets_in_houses ?? {});
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load insights"));

    // Chart SVG
    fetch("/api/chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        datetime: dtIsoUtc,
        lat: parseFloat(st.lat),
        lon: parseFloat(st.lon),
        tz_offset_hours: tzHours,
      }),
    })
      .then(r => r.ok ? r.json() : Promise.reject(new Error("Chart error")))
      .then(json => setSvg(json?.svg ?? null))
      .catch(() => {});
  }, []);

  const occupantsForHouse = (h: number): string[] => ctxHouses[String(h)] ?? [];

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

            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={clear}
                className="text-xs px-2 py-1 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10"
              >
                {t("insights.ui.clearHighlights", "Clear highlights")}
              </button>
              {highlightPlanets.length > 0 && (
                <div className="text-xs text-slate-400 truncate max-w-[60%]" title={highlightPlanets.join(", ")}>
                  {highlightPlanets.join(", ")}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT: domain cards */}
        <section className="lg:col-span-7 grid md:grid-cols-2 gap-6">
          {(domains ?? []).map((d) => {
            const houses = d.highlights?.houses ?? [];
            const planets = d.highlights?.planets ?? [];
            const aspects = d.highlights?.aspects ?? [];

            const houseOccupants = Array.from(new Set(houses.flatMap(h => occupantsForHouse(h))));

            // Text lines
            const housesLine =
              houses.length > 0
                ? houses
                    .map(h => `${h} (${HOUSE_GLOSS[h] ?? `House ${h}`})`)
                    .join(", ") + "."
                : null;

            const planetsLine =
              planets.length > 0
                ? planets
                    .map(p => `${p} (${PLANET_GLOSS[p] ?? ""}`.replace(/\s*\($/, "") + (PLANET_GLOSS[p] ? ")" : ""))
                    .join(", ") + "."
                : null;

            const aspectsLine =
              aspects.length > 0
                ? aspects
                    .slice(0, 2)
                    .map(a => `${a.p1}–${a.p2} (${(ASPECT_TONE[a.name] ?? "").trim()} ${a.name.toLowerCase()})`.replace(/\(\s+\)/, ""))
                    .join("; ") + "."
                : null;

            const tierKey = d.tier ? `insights.tiers.${d.tier}` : undefined;

            return (
              <div key={d.key} className="rounded-2xl border border-white/10 bg-black/10 p-4 hover:border-cyan-500/40 transition">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold">
                    {t(`insights.domains.${d.key.toLowerCase()}.title`)}
                  </div>
                  <div className="text-sm text-slate-300">
                    {d.score}/100{tierKey ? ` · ${t(tierKey)}` : ""}
                  </div>
                </div>
                <div className="mt-2 w-full h-1.5 rounded bg-white/10 overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${d.score}%` }} />
                </div>

                {/* Friendly bullets with hover/lock */}
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {housesLine && (
                    <li
                      onMouseEnter={() => setPreviewPlanets(houseOccupants)}
                      onMouseLeave={() => setPreviewPlanets([])}
                      onClick={() => lock(houseOccupants)}
                      className="cursor-pointer hover:text-cyan-300"
                      title={houseOccupants.length ? `Highlight: ${houseOccupants.join(", ")}` : undefined}
                    >
                      <span className="text-slate-300">{t("insights.pages.highlightHouses", "Key houses")}:</span>{" "}
                      {housesLine}
                    </li>
                  )}

                  {planetsLine && (
                    <li
                      onMouseEnter={() => setPreviewPlanets(planets)}
                      onMouseLeave={() => setPreviewPlanets([])}
                      onClick={() => lock(planets)}
                      className="cursor-pointer hover:text-cyan-300"
                      title={`Highlight: ${planets.join(", ")}`}
                    >
                      <span className="text-slate-300">{t("insights.pages.highlightPlanets", "Key planetary influence")}:</span>{" "}
                      {planetsLine}
                    </li>
                  )}

                  {aspectsLine && (
                    <li className="flex flex-col gap-1">
                      <span className="text-slate-300">{t("insights.ui.notableAspects", "Notable aspects")}:</span>
                      {aspects.slice(0, 2).map((a, i) => {
                        const pair = [a.p1, a.p2];
                        const label = `${a.p1}–${a.p2} (${(ASPECT_TONE[a.name] ?? "").trim()} ${a.name.toLowerCase()})`.replace(/\(\s+\)/, "");
                        return (
                          <button
                            key={i}
                            type="button"
                            onMouseEnter={() => setPreviewPlanets(pair)}
                            onMouseLeave={() => setPreviewPlanets([])}
                            onClick={() => lock(pair)}
                            className="text-left text-slate-200 hover:text-cyan-300"
                            title={`Highlight: ${pair.join(", ")}`}
                          >
                            • {label}
                          </button>
                        );
                      })}
                    </li>
                  )}
                </ul>

                {/* Quick actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {planets.length > 0 && (
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20"
                      onClick={() => lock(planets)}
                    >
                      {t("insights.ui.highlightPlanetsBtn", "Highlight planets")}
                    </button>
                  )}
                  {houses.length > 0 && houseOccupants.length > 0 && (
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10"
                      onClick={() => lock(houseOccupants)}
                    >
                      {t("insights.ui.highlightHousesBtn", "Highlight houses’ planets")}
                    </button>
                  )}
                  {aspects.length > 0 && (
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10"
                      onClick={() => {
                        const pairs = aspects.flatMap(a => [a.p1, a.p2]);
                        const uniq = Array.from(new Set(pairs));
                        lock(uniq);
                      }}
                    >
                      {t("insights.ui.highlightAspectsBtn", "Highlight aspects")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </Container>
  );
}
