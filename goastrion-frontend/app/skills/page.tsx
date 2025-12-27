//goastrion-frontend/app/skills/page.tsx
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
import {
  SKILLS_TOP_SLOT,
  SKILLS_MID_SLOT,
  SKILLS_END_SLOT,
} from "../constants/ads";

// -----------------------------
// Types
// -----------------------------
type Skill = { key: string; score: number; chips?: string[] };
type InsightsResponse = {
  context?: unknown;
  insights?: { skills?: Skill[] };
};

type TzId = "IST" | "UTC";
const TZ_HOURS: Record<TzId, number> = { IST: 5.5, UTC: 0.0 };

function localCivilToUtcIso(dob: string, tob: string, tzId: TzId) {
  const [Y, M, D] = dob.split("-").map(Number);
  const [h, m] = tob.split(":").map(Number);
  const tzHours = TZ_HOURS[tzId] ?? 0;
  const millis =
    Date.UTC(Y, (M ?? 1) - 1, D ?? 1, (h ?? 0), (m ?? 0)) -
    tzHours * 3600_000;
  return { dtIsoUtc: new Date(millis).toISOString(), tzHours };
}

// -----------------------------
// Tiers
// -----------------------------
const TIERS = {
  excellent: { label: "Excellent", min: 80 },
  strong: { label: "Strong", min: 60 },
  moderate: { label: "Moderate", min: 40 },
  emerging: { label: "Emerging", min: 0 },
} as const;

function tierOf(score: number) {
  if (score >= TIERS.excellent.min) return "excellent";
  if (score >= TIERS.strong.min) return "strong";
  if (score >= TIERS.moderate.min) return "moderate";
  return "emerging";
}

// Planet emojis
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

// i18n helpers
const planetKey = (p: string) => `planets.${p.toLowerCase()}`;
const localizePlanetName = (p: string, t: (k: string) => string) => {
  const k = planetKey(p);
  const v = t(k);
  return v === k ? p : v;
};
function localizeSvgPlanets(svg: string, t: (k: string) => string) {
  const names = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  const pattern = new RegExp(`(>)(\\s*)(${names.join("|")})(\\s*)(<)`, "gi");
  return svg.replace(pattern, (_m, gt, pre, name, post, lt) => {
    const localized = localizePlanetName(String(name), t);
    return `${gt}${pre}${localized}${post}${lt}`;
  });
}

// Avatar
function PlanetAvatar({
  glyph,
  title,
}: {
  glyph: string;
  title: string;
}) {
  return (
    <span
      title={title}
      className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-white/10 bg-white/5 text-sm"
    >
      {glyph}
    </span>
  );
}

// Chips
function ChipPill({
  label,
  onHover,
  onClick,
}: {
  label: string;
  onHover?: () => void;
  onClick?: () => void;
}) {
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

// =======================================================
// ⭐ SkillCard Component With Types
// =======================================================
type SkillCardProps = {
  s: Skill;
  planetList: string[];
  t: (k: string) => string;
  CHIP_TO_PLANETS: Record<string, string[]>;
  PLANET_EMOJI: Record<string, string>;
  localizePlanetName: (p: string, t: (k: string) => string) => string;
  PlanetAvatar: React.ComponentType<{ glyph: string; title: string }>;
  ChipPill: React.ComponentType<{
    label: string;
    onHover?: () => void;
    onClick?: () => void;
  }>;
  lock: (planets: string[]) => void;
  setPreviewPlanets: (planets: string[]) => void;
};

function SkillCard({
  s,
  planetList,
  t,
  CHIP_TO_PLANETS,
  PLANET_EMOJI,
  localizePlanetName,
  PlanetAvatar,
  ChipPill,
  lock,
  setPreviewPlanets,
}: SkillCardProps) {
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

          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            {(() => {
              const key = `insights.skillsDescription.${s.key}`;
              const v = t(key);
              return v === key ? t("insights.skillsDescription.fallback") : v;
            })()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!!planetList.length && (
            <button
              className="text-xs px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20"
              onClick={() => lock(planetList)}
            >
              Highlight
            </button>
          )}
          <button
            className="text-xs px-2 py-1 rounded-md border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
            onClick={() => setIsOpen((v) => !v)}
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
                  <PlanetAvatar
                    glyph={PLANET_EMOJI[p] ?? p[0]}
                    title={localizePlanetName(p, t)}
                  />
                  <span className="text-slate-300 text-xs">
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

// =======================================================
// PAGE COMPONENT
// =======================================================

export default function SkillsPage() {
  const { t } = useI18n();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [svg, setSvg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { highlightPlanets, lock, clear, setPreviewPlanets } =
    useSkillHighlight();

  const reload = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const st = loadCreateState();
      if (!st) {
        setErr(t("errors.genericGenerate"));
        return;
      }
      const { dtIsoUtc, tzHours } = localCivilToUtcIso(
        st.dob,
        st.tob,
        st.tzId as TzId
      );

      const json: InsightsResponse = await fetchInsights({
        datetime: dtIsoUtc,
        lat: parseFloat(st.lat),
        lon: parseFloat(st.lon),
        tz_offset_hours: tzHours,
      });
      setSkills(json?.insights?.skills ?? []);

      const r = await fetch("/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: dtIsoUtc,
          lat: parseFloat(st.lat),
          lon: parseFloat(st.lon),
          tz_offset_hours: tzHours,
        }),
      });
      if (r.ok) {
        const j = await r.json();
        setSvg(j?.svg ?? null);
      } else setSvg(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg || t("errors.genericGenerate"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    reload();
  }, [reload]);

  const localizedSvg = useMemo(
    () => (svg ? localizeSvgPlanets(svg, t) : null),
    [svg, t]
  );

  const planetsForSkill = useCallback((chips?: string[]) => {
    const set = new Set<string>();
    (chips ?? []).forEach((k) =>
      (CHIP_TO_PLANETS[k] ?? []).forEach((p) => set.add(p))
    );
    return Array.from(set);
  }, []);

  const visibleSkills = useMemo(() => {
    const list = [...(skills ?? [])];
    list.sort((a, b) => b.score - a.score);
    return list;
  }, [skills]);

  const grouped = useMemo(() => {
    const g: Record<keyof typeof TIERS, Skill[]> = {
      excellent: [],
      strong: [],
      moderate: [],
      emerging: [],
    };
    for (const s of visibleSkills) g[tierOf(s.score)].push(s);
    return g;
  }, [visibleSkills]);

  const unionPlanets = (list: Skill[]) => {
    const set = new Set<string>();
    list.forEach((s) =>
      (s.chips ?? []).forEach((k) =>
        (CHIP_TO_PLANETS[k] ?? []).forEach((p) => set.add(p))
      )
    );
    return Array.from(set);
  };

  return (
    <Container>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-3">
          {t("insights.pages.skillsTitle")}
        </h1>

        <div className="mt-2 text-xs md:text-sm text-slate-400 leading-relaxed">
          {(() => {
            try {
              const raw = localStorage.getItem("ga_create_state_v1");
              if (!raw)
                return (
                  <p>
                    Name: —<br />
                    DOB: —{" "}
                  </p>
                );
              const saved = JSON.parse(raw);
              const name = saved?.name || "___";
              const tz =
                saved?.tzId === "IST"
                  ? "Asia/Kolkata"
                  : saved?.tzId || "UTC";
              let dobText = "—";
              if (saved?.dob && saved?.tob) {
                dobText = `${saved.dob.split("-").reverse().join(" ")} ${
                  saved.tob
                } (${tz})`;
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
              return (
                <p>
                  Name: —<br />
                  DOB: —{" "}
                </p>
              );
            }
          })()}
        </div>

        <p className="text-slate-400 break-words">
          {t("insights.pages.skillsSubtitle")}
        </p>
      </div>

      <div className="mt-4 mb-6 rounded-xl border border-white/10 bg-black/10 p-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          {t("insights.skillsPageCalculation.title")}
        </h3>

        <p className="text-slate-300 text-sm mb-3">
          {t("insights.skillsPageCalculation.body1")}
        </p>

        <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
          <li>{t("insights.skillsPageCalculation.item1")}</li>
          <li>{t("insights.skillsPageCalculation.item2")}</li>
          <li>{t("insights.skillsPageCalculation.item3")}</li>
          <li>{t("insights.skillsPageCalculation.item4")}</li>
          <li>{t("insights.skillsPageCalculation.item5")}</li>
        </ul>

        <p className="text-slate-300 text-sm mt-3">
          {t("insights.skillsPageCalculation.body2")}
        </p>
      </div>

      {/* TOP AD */}
      <div className="mb-6">
        <AdSlot slot={SKILLS_TOP_SLOT} minHeight={280} />
      </div>

      {/* ERROR */}
      {err && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-900/20 text-rose-200 p-3 flex items-center justify-between">
          <span className="break-words">{err}</span>
          <button
            onClick={reload}
            className="px-3 py-1 rounded-md border border-white/15 bg-white/10 hover:bg-white/15 text-sm"
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-12 gap-6">

        {/* LEFT CHART PANEL */}
        <aside className="col-span-12 lg:col-span-5 mb-6 lg:mb-0">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-4 lg:sticky lg:top-4">
            <div className="text-sm font-medium text-slate-200 mb-2 flex items-center justify-between">
              <span>{t("insights.pages.chartTitle")}</span>
              <HighlightController
                onClear={clear}
                activeCount={highlightPlanets.length}
              />
            </div>

            <div className="aspect-square w-full rounded-xl overflow-hidden border border-white/10 bg-black/40">
              {localizedSvg ? (
                <ChartWithHighlights
                  svg={localizedSvg}
                  highlightPlanets={highlightPlanets}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  {loading ? t("common.loading") : t("common.notAvailable")}
                </div>
              )}
            </div>

            {/* Legend */}
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

        {/* RIGHT SKILLS PANEL */}
        <section className="col-span-12 lg:col-span-7">
          {!loading && visibleSkills.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-6 text-slate-300">
              {t("common.notAvailable")}
            </div>
          )}

          {!loading && (
            <div className="space-y-8">
              {(Object.keys(TIERS) as Array<keyof typeof TIERS>).map(
                (tierKey, idxTier) => {
                  const list = grouped[tierKey];
                  if (!list.length) return null;
                  const planets = unionPlanets(list);

                  return (
                    <div
                      key={tierKey}
                      className="rounded-2xl border border-white/10 bg-black/10"
                    >
                      {/* Tier header */}
                      <div className="px-4 pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-semibold text-white">
                            {TIERS[tierKey].label}
                          </h2>
                          <span className="text-xs text-slate-400">
                            {list.length} item(s)
                          </span>
                        </div>

                        {planets.length > 0 && (
                          <button
                            className="text-xs px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20"
                            onClick={() => lock(planets)}
                          >
                            Highlight group
                          </button>
                        )}
                      </div>

                      {/* Skill Cards */}
                      <div className="p-4 grid grid-cols-1 gap-4">
                        {list.map((s) => {
                          const planetList = planetsForSkill(s.chips);
                          return (
                            <SkillCard
                              key={s.key}
                              s={s}
                              planetList={planetList}
                              t={t}
                              CHIP_TO_PLANETS={CHIP_TO_PLANETS}
                              PLANET_EMOJI={PLANET_EMOJI}
                              localizePlanetName={localizePlanetName}
                              PlanetAvatar={PlanetAvatar}
                              ChipPill={ChipPill}
                              lock={lock}
                              setPreviewPlanets={setPreviewPlanets}
                            />
                          );
                        })}
                      </div>

                      {/* Mid Ad */}
                      {idxTier === 0 && (
                        <div className="px-4 pb-4">
                          <AdSlot slot={SKILLS_MID_SLOT} minHeight={300} />
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* FULL WIDTH BLOCK */}
        <div className="mt-10 w-full col-span-12">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 md:p-8 lg:p-10">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">
              {t("insights.skillsUsage.title")}
            </h2>

            <div className="space-y-4 text-sm md:text-base text-slate-300 leading-relaxed">
              <p>{t("insights.skillsUsage.p1")}</p>
              <p>{t("insights.skillsUsage.p2")}</p>
              <p>{t("insights.skillsUsage.p3")}</p>
              <p>{t("insights.skillsUsage.p4")}</p>
            </div>
          </div>
        </div>

        {/* Bottom Ad */}
        <div className="mt-8 col-span-12">
          <AdSlot slot={SKILLS_END_SLOT} minHeight={280} />
        </div>
      </div>
    </Container>
  );
}
