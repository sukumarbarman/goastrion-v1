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
import AdSlot from "../components/AdSlot";
import { SKILLS_TOP_SLOT, SKILLS_MID_SLOT, SKILLS_END_SLOT  } from "../constants/ads";

// -----------------------------
// Types
// -----------------------------
type Skill = { key: string; score: number; chips?: string[] };
type InsightsResponse = { context?: unknown; insights?: { skills?: Skill[] } };

// --- Safari-safe timezone helper (consistent with other pages) ---
type TzId = "IST" | "UTC";
const TZ_HOURS: Record<TzId, number> = { IST: 5.5, UTC: 0.0 };
function localCivilToUtcIso(dob: string, tob: string, tzId: TzId) {
  const [Y, M, D] = dob.split("-").map(Number);
  const [h, m] = tob.split(":").map(Number);
  const tzHours = TZ_HOURS[tzId] ?? 0;
  const millis = Date.UTC(Y, (M ?? 1) - 1, D ?? 1, (h ?? 0), (m ?? 0)) - tzHours * 3600_000;
  return { dtIsoUtc: new Date(millis).toISOString(), tzHours };
}

// -----------------------------
// Tiers (internal only; not shown to user)
// -----------------------------
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

  const { highlightPlanets, lock, clear, setPreviewPlanets } = useSkillHighlight();

  const reload = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const st = loadCreateState();
      if (!st) { setErr(t("errors.genericGenerate")); return; }
      const { dtIsoUtc, tzHours } = localCivilToUtcIso(st.dob, st.tob, st.tzId as TzId);

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

  // Always show ALL skills, sorted by score (internal), but do not render any scores
  const visibleSkills = useMemo(() => {
    const list = [...(skills ?? [])];
    list.sort((a, b) => b.score - a.score);
    return list;
  }, [skills]);

  // Group by tiers (internal only)
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
    {t("insights.pages.skillsTitle")}
  </h1>


  {/* 👇 Added Name + DOB block */}
  <div className="mt-2 text-xs md:text-sm text-slate-400 leading-relaxed">
    {(() => {
      try {
        const raw = localStorage.getItem("ga_create_state_v1");
        if (!raw) return <p>Name: —<br />DOB: —</p>;
        const saved = JSON.parse(raw);
        const name = saved?.name || "___";
        const tz =
          saved?.tzId === "IST" ? "Asia/Kolkata" : saved?.tzId || "UTC";
        let dobText = "—";
        if (saved?.dob && saved?.tob) {
          dobText = `${saved.dob.split("-").reverse().join(" ")} ${saved.tob} (${tz})`;
        } else if (saved?.dob) {
          dobText = `${saved.dob} (${tz})`;
        }
        return (
          <>
            <p>Name: {name}</p>
            <p>DOB: {dobText}</p>
          </>
        );
      } catch {
        return <p>Name: —<br />DOB: —</p>;
      }
    })()}
  </div>
   <p className="text-slate-400 break-words">{t("insights.pages.skillsSubtitle")}</p>
</div>


      {/* Ad: top of page */}
      <div className="mb-6">
        <AdSlot slot={SKILLS_TOP_SLOT} minHeight={280} />
      </div>

      {err && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-900/20 text-rose-200 p-3 flex items-center justify-between">
          <span className="break-words">{err}</span>
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
              <span className="break-words">{t("insights.pages.chartTitle")}</span>
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
                    <span className="break-words">{label}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT: skills */}
        <section className="lg:col-span-7">
          {/* Loading skeletons */}
          {loading && (
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[.04] p-4 animate-pulse">
                  <div className="h-4 w-3/5 bg-white/10 rounded mb-2" />
                  <div className="h-5 w-4/5 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && visibleSkills.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-6 text-slate-300">
              {t("common.notAvailable")}
            </div>
          )}

          {/* Tiered groups (no score shown) */}
          {!loading && (
            <div className="space-y-8">
              {(Object.keys(TIERS) as Array<keyof typeof TIERS>).map((k, groupIdx) => {
                const list = grouped[k];
                if (!list.length) return null;
                const planets = unionPlanets(list);
                return (
                  <div key={k} className="rounded-2xl border border-white/10 bg-black/10">
                    <div className="px-4 pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-white break-words">{TIERS[k].label}</h2>
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

                    <div className="p-4 grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                      {list.map((s) => {
                        const planetList = planetsForSkill(s.chips);

                        function Card() {
                          const [isOpen, setIsOpen] = useState(false);
                          return (
                            <div
                              className="rounded-xl border border-white/10 bg-black/20 p-4 hover:border-cyan-500/40 transition"
                              onMouseLeave={() => setPreviewPlanets([])}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-white font-semibold break-words">
                                    {t(`insights.skills.${s.key}`)}
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
                                    onClick={() => setIsOpen(v => !v)}
                                    className="text-xs px-2 py-1 rounded-md border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                                  >
                                    {isOpen ? "Hide" : "Details"}
                                  </button>
                                </div>
                              </div>

                              {isOpen && (
                                <div className="mt-3">
                                  {!!planetList.length && (
                                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                                      {planetList.map((p) => (
                                        <span key={p} className="inline-flex items-center gap-1">
                                          <PlanetAvatar glyph={PLANET_EMOJI[p] ?? p[0]} title={localizePlanetName(p, t)} />
                                          <span className="text-slate-300 text-xs break-words">
                                            {localizePlanetName(p, t)}
                                          </span>
                                        </span>
                                      ))}
                                    </div>
                                  )}

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
                        }

                        return <Card key={s.key} />;
                      })}
                    </div>

                    {/* Mid-page ad after first tier block */}
                    {groupIdx === 0 && (
                      <div className="px-4 pb-4">
                        <AdSlot slot={SKILLS_MID_SLOT} minHeight={300} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Ad: end-of-page */}
          <div className="mt-8">
            <AdSlot slot={SKILLS_END_SLOT} minHeight={280} />
          </div>
        </section>
      </div>
    </Container>
  );
}
