// app/skills/page.tsx
"use client";

import type React from "react";
import { useEffect, useMemo, useState, useCallback } from "react";
import Container from "../components/Container";
import { useI18n } from "../lib/i18n";
import ChartWithHighlights from "../components/ChartWithHighlights";
import { loadCreateState, fetchInsights } from "../lib/insightsClient";
import { CHIP_TO_PLANETS } from "../lib/skillsMapping";
import { useSkillHighlight } from "../hooks/useSkillHighlight";
import HighlightController from "../components/HighlightController";

// -----------------------------
// Types
// -----------------------------
type Skill = { key: string; score: number; chips?: string[] };
type InsightsResponse = { context?: unknown; insights?: { skills?: Skill[] } };

// -----------------------------
// Small UI helpers
// -----------------------------
function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-300 border-emerald-500/30";
  if (score >= 60) return "text-cyan-300 border-cyan-500/30";
  if (score >= 40) return "text-amber-300 border-amber-500/30";
  return "text-rose-300 border-rose-500/30";
}
function barBg(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-cyan-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-rose-500";
}
const TIERS = {
  excellent: { label: "Excellent", min: 80 },
  strong: { label: "Strong", min: 60 },
  moderate: { label: "Moderate", min: 40 },
  emerging: { label: "Emerging", min: 0 },
} as const;
function tierOf(score: number) {
  if (score >= TIERS.excellent.min) return "excellent" as const;
  if (score >= TIERS.strong.min) return "strong" as const;
  if (score >= TIERS.moderate.min) return "moderate" as const;
  return "emerging" as const;
}

// Planet emojis (keep English keys for glyph lookup)
const PLANET_EMOJI: Record<string, string> = {
  Sun: "☀️",
  Moon: "🌙",
  Mars: "♂️",
  Mercury: "☿️",
  Jupiter: "♃",
  Venus: "♀️",
  Saturn: "♄",
  Rahu: "☊",
  Ketu: "☋",
};

// -------- i18n helpers for planets & SVG --------
const planetKey = (p: string) => `planets.${p.toLowerCase()}`;
const localizePlanetName = (p: string, t: (k: string) => string) => {
  const k = planetKey(p);
  const v = t(k);
  return v === k ? p : v;
};
function localizeSvgPlanets(svg: string, t: (k: string) => string) {
  const names = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
  const pattern = new RegExp(`(>)(\\s*)(${names.join("|")})(\\s*)(<)`, "gi");
  return svg.replace(pattern, (_m, gt, pre, name, post, lt) => {
    const localized = localizePlanetName(String(name), t);
    return `${gt}${pre}${localized}${post}${lt}`;
  });
}

// Render a planet icon; tooltip and label are localized in parent
function PlanetAvatar({ glyph, title }: { glyph: string; title: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-white/10 bg-white/5 text-sm"
    >
      {glyph}
    </span>
  );
}

function ScoreRing({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const circle = {
    background: `conic-gradient(currentColor ${pct * 3.6}deg, rgba(255,255,255,.12) 0)`,
  } as React.CSSProperties;
  return (
    <div className={`w-9 h-9 rounded-full grid place-items-center border ${scoreColor(value)} text-white/80`} style={circle}>
      <span className="text-[10px] font-semibold">{value}</span>
    </div>
  );
}

function ChipPill({ label, onHover, onClick }: { label: string; onHover?: () => void; onClick?: () => void }) {
  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onFocus={onHover}
      onClick={onClick}
      className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10"
    >
      {label}
    </button>
  );
}

// -----------------------------
// Page
// -----------------------------
export default function SkillsPage() {
  const { t } = useI18n();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [svg, setSvg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"score" | "alpha">("score");
  const [topN, setTopN] = useState<number | "all">(10);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { highlightPlanets, lock, clear, setPreviewPlanets } = useSkillHighlight();

  const reload = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const st = loadCreateState();
      if (!st) { setErr(t("errors.genericGenerate")); return; }
      const tzHours = st.tzId === "IST" ? 5.5 : 0;
      const offset = tzHours >= 0
        ? `+${String(Math.floor(tzHours)).padStart(2,"0")}:${String(Math.round((tzHours%1)*60)).padStart(2,"0")}`
        : `-${String(Math.floor(-tzHours)).padStart(2,"0")}:${String(Math.round((-tzHours%1)*60)).padStart(2,"0")}`;
      const dtIsoUtc = new Date(`${st.dob}T${st.tob}:00${offset}`).toISOString();

      // 1) insights
      const json: InsightsResponse = await fetchInsights({
        datetime: dtIsoUtc,
        lat: parseFloat(st.lat),
        lon: parseFloat(st.lon),
        tz_offset_hours: tzHours,
      });
      setSkills(json?.insights?.skills ?? []);

      // 2) chart SVG
      try {
        const r = await fetch("/api/chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ datetime: dtIsoUtc, lat: parseFloat(st.lat), lon: parseFloat(st.lon), tz_offset_hours: tzHours })
        });
        if (r.ok) {
          const j = await r.json();
          setSvg(j?.svg ?? null);
        } else {
          setSvg(null);
        }
      } catch {
        setSvg(null);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg || t("errors.genericGenerate"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { reload(); }, [reload]);

  // Localize chart SVG whenever svg or t changes
  const localizedSvg = useMemo(() => (svg ? localizeSvgPlanets(svg, t) : null), [svg, t]);

  // helper: compute highlight list from a skill's chips
  const planetsForSkill = useCallback((chips?: string[]) => {
    const set = new Set<string>();
    (chips ?? []).forEach((k) => (CHIP_TO_PLANETS[k] ?? []).forEach((p) => set.add(p)));
    return Array.from(set);
  }, []);

  // Search + sort + topN slice (use localized skill names)
  const visibleSkills = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = (skills ?? []).filter(s => {
      const name = t(`insights.skills.${s.key}`);
      return q ? name.toLowerCase().includes(q) : true;
    });

    list.sort((a, b) => {
      if (sort === "alpha") return t(`insights.skills.${a.key}`).localeCompare(t(`insights.skills.${b.key}`));
      return b.score - a.score;
    });

    if (topN !== "all") list = list.slice(0, topN);
    return list;
  }, [skills, query, sort, topN, t]);

  // Group by tiers
  const grouped = useMemo(() => {
    const g: Record<keyof typeof TIERS, Skill[]> = { excellent: [], strong: [], moderate: [], emerging: [] };
    for (const s of visibleSkills) g[tierOf(s.score)].push(s);
    return g;
  }, [visibleSkills]);

  const unionPlanets = (list: Skill[]) => {
    const set = new Set<string>();
    list.forEach(s => (s.chips ?? []).forEach(k => (CHIP_TO_PLANETS[k] ?? []).forEach(p => set.add(p))));
    return Array.from(set);
  };

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-3">
          {t("insights.pages.skillsTitle")} <span className="text-xs font-normal text-slate-400">(beta)</span>
        </h1>
        <p className="text-slate-400">{t("insights.pages.skillsSubtitle")}</p>
      </div>

      {err && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-900/20 text-rose-200 p-3 flex items-center justify-between">
          <span>{err}</span>
          <button onClick={reload} className="px-3 py-1 rounded-md border border-white/15 bg-white/10 hover:bg-white/15 text-sm">
            {t("common.retry")}
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* LEFT: sticky chart */}
        <aside className="lg:col-span-5">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-4 lg:sticky lg:top-4">
            <div className="text-sm font-medium text-slate-200 mb-2 flex items-center justify-between">
              <span>{t("insights.pages.chartTitle")}</span>
              <HighlightController onClear={clear} activeCount={highlightPlanets.length} />
            </div>
            <div className="aspect-square w-full rounded-xl overflow-hidden border border-white/10 bg-black/40">
              {localizedSvg ? (
                <ChartWithHighlights svg={localizedSvg} highlightPlanets={highlightPlanets} className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  {loading ? t("common.loading") : t("common.notAvailable")}
                </div>
              )}
            </div>

            {/* Localized quick legend */}
            <div className="mt-3 text-xs text-slate-400 flex flex-wrap items-center gap-2">
              <span className="mr-1">Legend:</span>
              {Object.keys(PLANET_EMOJI).map((p) => {
                const label = localizePlanetName(p, t);
                return (
                  <span key={p} className="inline-flex items-center gap-1">
                    <PlanetAvatar glyph={PLANET_EMOJI[p]} title={label} />
                    <span>{label}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT */}
        <section className="lg:col-span-7">
          {/* Controls */}
          <div className="mb-3 flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("common.search") + "…"}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">Sort</label>
              <select
                value={sort}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSort(e.target.value as "score" | "alpha")
                }
                className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-200"
              >
                <option value="score">Score (high → low)</option>
                <option value="alpha">A → Z</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">Show</label>
              <select
                value={String(topN)}
                onChange={(e) => setTopN(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-200"
              >
                <option value="all">All</option>
                <option value="3">Top 3</option>
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
              </select>
            </div>
            <button
              onClick={() => {
                const count = topN === "all" ? 10 : topN;
                const lines = visibleSkills.slice(0, count).map((s, i) => `${i + 1}. ${t(`insights.skills.${s.key}`)} — ${s.score}/100`);
                navigator.clipboard?.writeText(["Top skills:", ...lines].join("\n"));
              }}
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            >
              Copy summary
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[.04] p-4 animate-pulse">
                  <div className="h-4 w-1/2 bg-white/10 rounded mb-2" />
                  <div className="h-1.5 w-full bg-white/10 rounded" />
                  <div className="mt-3 h-5 w-2/3 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && visibleSkills.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-6 text-slate-300">
              No skills to show. Try changing filters.
            </div>
          )}

          {/* Tiered groups */}
          {!loading && (
            <div className="space-y-6">
              {(Object.keys(TIERS) as Array<keyof typeof TIERS>).map((k) => {
                const list = grouped[k];
                if (!list.length) return null;
                const planets = unionPlanets(list);
                return (
                  <div key={k} className="rounded-2xl border border-white/10 bg-black/10">
                    <div className="px-4 pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-white">{TIERS[k].label}</h2>
                        <span className="text-xs text-slate-400">{list.length} item(s)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!!planets.length && (
                          <button
                            type="button"
                            title="Highlight planets for this group"
                            className="text-xs px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20"
                            onClick={() => lock(planets)}
                          >
                            Highlight group
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 grid md:grid-cols-2 gap-4">
                      {list.map((s) => {
                        const planetList = planetsForSkill(s.chips);
                        const isOpen = !!expanded[s.key];
                        return (
                          <div
                            key={s.key}
                            className="rounded-xl border border-white/10 bg-black/20 p-4 hover:border-cyan-500/40 transition"
                            onMouseLeave={() => setPreviewPlanets([])}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="text-white font-semibold truncate">
                                    {t(`insights.skills.${s.key}`)}
                                  </div>
                                  <ScoreRing value={s.score} />
                                </div>
                                <div className="mt-2 w-full h-1.5 rounded bg-white/10 overflow-hidden">
                                  <div className={`h-full ${barBg(s.score)}`} style={{ width: `${s.score}%` }} />
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {!!planetList.length && (
                                  <button
                                    type="button"
                                    className="text-xs px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20"
                                    onClick={() => lock(planetList)}
                                  >
                                    Highlight
                                  </button>
                                )}
                                <button
                                  type="button"
                                  aria-expanded={isOpen}
                                  onClick={() => setExpanded((m) => ({ ...m, [s.key]: !isOpen }))}
                                  className="text-xs px-2 py-1 rounded-md border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                                >
                                  {isOpen ? "Hide" : "Details"}
                                </button>
                              </div>
                            </div>

                            {isOpen && (
                              <div className="mt-3">
                                {/* Planets row (localized labels) */}
                                {!!planetList.length && (
                                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                                    {planetList.map((p) => (
                                      <span key={p} className="inline-flex items-center gap-1">
                                        <PlanetAvatar glyph={PLANET_EMOJI[p] ?? p[0]} title={localizePlanetName(p, t)} />
                                        <span className="text-slate-300 text-xs">{localizePlanetName(p, t)}</span>
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Chips (keys already exist in dict: root.chip.skill.* and insights.skills.chip.*) */}
                                <div className="flex flex-wrap gap-2">
                                  {(s.chips ?? []).map((key) => (
                                    <ChipPill
                                      key={key}
                                      label={t(key)}
                                      onHover={() => setPreviewPlanets(CHIP_TO_PLANETS[key] ?? [])}
                                      onClick={() => {
                                        const ps = CHIP_TO_PLANETS[key] ?? [];
                                        if (ps.length) lock(ps);
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <p className="mt-8 text-xs text-slate-500">
        Tip: Hover any chip to preview its planets on the chart; click a chip or the “Highlight” button to lock highlights. Use the top-right Clear inside
        the Chart card to reset.
      </p>
    </Container>
  );
}
