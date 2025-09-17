// app/domains/page.tsx
"use client";

import { useEffect, useState } from "react";
import Container from "../components/Container";
import { useI18n } from "../lib/i18n";
import ChartWithHighlights from "../components/ChartWithHighlights";
import { loadCreateState, fetchInsights } from "../lib/insightsClient";
import { useHighlight } from "../hooks/useSkillHighlight";

type DomainItem = {
  key: string;
  score: number;
  tier?: string;
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

// ---------- i18n helpers & fallbacks ----------
const HOUSE_GLOSS_FALLBACK: Record<number, string> = {
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

const PLANET_GLOSS_FALLBACK: Record<string, string> = {
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

const ASPECT_TONE_FALLBACK: Record<string, string> = {
  Trine: "harmonious",
  Sextile: "supportive",
  Conjunction: "intense",
  Opposition: "polarizing",
  Square: "challenging",
};

function tpl(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
function uniq<T>(arr: T[]) { return Array.from(new Set(arr)); }
function joinOxford(items: string[], andWord = "and", comma = ", ") {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} ${andWord} ${items[1]}`;
  return `${items.slice(0, -1).join(comma)}${comma}${andWord} ${items[items.length - 1]}`;
}

// Sentence → preview/lock highlight wrapper
function HoverSentence({
  text,
  planets,
  onPreview,
  onClearPreview,
  onLock,
}: {
  text: string;
  planets: string[];
  onPreview: (p: string[]) => void;
  onClearPreview: () => void;
  onLock: (p: string[]) => void;
}) {
  const has = planets && planets.length > 0;
  return (
    <span
      className={has ? "cursor-pointer hover:text-cyan-300" : ""}
      onMouseEnter={() => has && onPreview(planets)}
      onMouseLeave={() => onClearPreview()}
      onClick={() => has && onLock(planets)}
    >
      {text}
    </span>
  );
}

// ---------------------------------------------------------------

export default function DomainsPage() {
  const { t } = useI18n();

  // i18n accessors (use translation with fallback)
  const houseGloss = (h: number) =>
    t(`insights.housesGloss.${h}`, HOUSE_GLOSS_FALLBACK[h] ?? "");
  const houseShort = (h: number) =>
    (houseGloss(h).split(",")[0] || t("insights.ui.house"));
  const houseOrdinal = (h: number) =>
    t(`insights.housesOrdinal.${h}`, `${h}th`);
  const planetGloss = (p: string) =>
    t(`insights.planetsGloss.${p}`, PLANET_GLOSS_FALLBACK[p] ?? "");
  const aspectTone = (name: string) =>
    t(`insights.aspectTone.${name}`, ASPECT_TONE_FALLBACK[name] ?? "");

  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [svg, setSvg] = useState<string | null>(null);
  const [ctxHouses, setCtxHouses] = useState<Record<string, string[]>>({});
  const [err, setErr] = useState<string | null>(null);

  const { highlightPlanets, lockReplace, clear, setPreviewPlanets } = useHighlight();

  useEffect(() => {
    const st = loadCreateState();
    if (!st) { setErr(t("errors.genericGenerate", "Failed to generate chart.")); return; }

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
      .catch((e) => setErr(e instanceof Error ? e.message : t("errors.genericGenerate")));

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
  const uniqStr = (arr: string[]) => Array.from(new Set(arr)).filter(Boolean);

  // Build Option-2 sentences + which planets to highlight for each (fully localized)
  const buildOption2Parts = (d: DomainItem) => {
    const domain = t(`insights.domains.${d.key.toLowerCase()}.title`, d.key);
    const andWord = t("insights.copy.join.and", "and");
    const comma = t("insights.copy.join.comma", ", ");
    const tierKey = d.tier ?? "unknown";
    const phase = t(`insights.copy.phase_by_tier.${tierKey}`, "an evolving phase");

    const houses = d.highlights?.houses ?? [];
    const planets = d.highlights?.planets ?? [];
    const aspects = d.highlights?.aspects ?? [];

    // S1: "Right now, Domain is in phase (score/100)."
    const line1Text = tpl(
      t("insights.copy.line1_template"),
      { domain, phase, score: d.score }
    );

    // Houses → label like "6th and 11th houses", themes from gloss
    let houseListLabel = "";
    if (houses.length === 1) houseListLabel = `${houseOrdinal(houses[0])} ${t("insights.copy.housesWord", "house")}`;
    else if (houses.length === 2) houseListLabel = `${houseOrdinal(houses[0])} ${andWord} ${houseOrdinal(houses[1])} ${t("insights.copy.housesWordPlural", "houses")}`;
    else if (houses.length >= 3) houseListLabel = `${joinOxford(houses.map(houseOrdinal), andWord, comma)} ${t("insights.copy.housesWordPlural", "houses")}`;

    const themes = uniq(
      houses.flatMap(h => (houseGloss(h) ?? "").split(",").map(s => s.trim()).filter(Boolean))
    );
    const themesJoined = joinOxford(themes, andWord, comma);

    const housesLineText =
      houses.length
        ? tpl(t("insights.copy.houses_intro"), {
            houseList: houseListLabel, themes: themesJoined
          })
        : "";

    // Planets → advice list (already localized via insights.copy.planet_advice.*)
    const adviceList = joinOxford(
      planets.map(p => t(`insights.copy.planet_advice.${p}`)),
      andWord, comma
    );
    const planetListLabel = joinOxford(planets, andWord, comma);
    const planetsLineText =
      planets.length
        ? tpl(t("insights.copy.planets_intro"), {
            planetList: planetListLabel, adviceList
          })
        : "";

    // Aspects → pair text + short hint (1–2 items)
    const aspectItemsDetailed = (aspects ?? []).slice(0,2).map(a => {
      const tone = aspectTone(a.name).trim();
      const pair = tpl(t("insights.copy.aspect_pair"), {
        p1: a.p1, p2: a.p2, tone, name: a.name.toLowerCase()
      });
      const hint = t(`insights.copy.aspect_hint_by_name.${a.name}`);
      const text = tpl(t("insights.copy.aspect_item"), { pair, hint });
      return { text, planets: uniq([a.p1, a.p2]) as string[] };
    });

    // Highlight sets for each sentence
    const houseOccupantsAll = uniq(houses.flatMap(h => occupantsForHouse(h)));
    const aspectPlanetsAll = uniq(aspects.flatMap(a => [a.p1, a.p2]));

    return {
      line1:       { text: line1Text,       planets: [] },
      housesLine:  housesLineText ? { text: housesLineText,  planets: houseOccupantsAll } : null,
      planetsLine: planetsLineText ? { text: planetsLineText, planets } : null,
      aspectsHeader: aspects.length ? t("insights.ui.notableAspects") + ":" : "",
      aspectsAllPlanets: aspectPlanetsAll as string[],
      aspectsItems: aspectItemsDetailed, // [{text, planets}]
    };
  };

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          {t("insights.pages.domainsTitle")}
        </h1>
        <p className="text-slate-400">{t("insights.pages.domainsSubtitle")}</p>
      </div>

      {err && <div className="text-red-300 text-sm mb-4">{err}</div>}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* LEFT: sticky chart */}
        <aside className="lg:col-span-5">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-4 lg:sticky lg:top-4">
            <div className="text-sm font-medium text-slate-200 mb-2">
              {t("insights.pages.chartTitle")}
            </div>
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
                {t("insights.ui.clearHighlights")}
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

            const houseOccupants = uniqStr(houses.flatMap(h => occupantsForHouse(h)));
            const aspectPlanets = uniqStr(aspects.flatMap(a => [a.p1, a.p2]));
            const allForDomain = uniqStr([...houseOccupants, ...planets, ...aspectPlanets]);

            // Build interactive Option-2 sentences (localized)
            const parts = buildOption2Parts(d);

            const tierKey = d.tier ? `insights.tiers.${d.tier}` : undefined;

            return (
              <div
                key={d.key}
                className="rounded-2xl border border-white/10 bg-black/10 p-4 hover:border-cyan-500/40 transition"
                onMouseEnter={() => setPreviewPlanets([])} // avoid stale previews when moving card-to-card
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold">
                    {t(`insights.domains.${d.key.toLowerCase()}.title`)}
                  </div>
                  <div className="text-sm text-slate-300">
                    {d.score}/100{tierKey ? ` · ${t(tierKey)}` : ""}
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-2 w-full h-1.5 rounded bg-white/10 overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${d.score}%` }} />
                </div>

                {/* Option-2 with line breaks + bulleted aspects */}
                <div className="mt-3 text-sm text-slate-300 leading-6 space-y-1.5">
                  {/* Line 1 */}
                  <div>
                    <HoverSentence
                      text={parts.line1.text}
                      planets={[]}
                      onPreview={setPreviewPlanets}
                      onClearPreview={() => setPreviewPlanets([])}
                      onLock={lockReplace}
                    />
                  </div>

                  {/* Houses sentence */}
                  {parts.housesLine && (
                    <div>
                      <HoverSentence
                        text={parts.housesLine.text}
                        planets={parts.housesLine.planets}
                        onPreview={setPreviewPlanets}
                        onClearPreview={() => setPreviewPlanets([])}
                        onLock={lockReplace}
                      />
                    </div>
                  )}

                  {/* Planets sentence */}
                  {parts.planetsLine && (
                    <div>
                      <HoverSentence
                        text={parts.planetsLine.text}
                        planets={parts.planetsLine.planets}
                        onPreview={setPreviewPlanets}
                        onClearPreview={() => setPreviewPlanets([])}
                        onLock={lockReplace}
                      />
                    </div>
                  )}

                  {/* Aspects header + list */}
                  {parts.aspectsItems.length > 0 && (
                    <div>
                      <div className="font-medium text-slate-200">
                        {parts.aspectsHeader}
                      </div>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        {parts.aspectsItems.map((it, idx) => (
                          <li key={idx}>
                            <HoverSentence
                              text={it.text}
                              planets={it.planets}
                              onPreview={setPreviewPlanets}
                              onClearPreview={() => setPreviewPlanets([])}
                              onLock={lockReplace}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Interactive chips */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {/* House chips (highlight their occupants) */}
                  {houses.map((h) => {
                    const occ = occupantsForHouse(h);
                    const disabled = occ.length === 0;
                    return (
                      <button
                        key={`h-${h}`}
                        type="button"
                        className={
                          "px-2 py-0.5 rounded-full text-xs border " +
                          (disabled
                            ? "bg-white/5 border-white/10 text-slate-500 cursor-not-allowed"
                            : "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10")
                        }
                        title={houseGloss(h)}
                        onMouseEnter={() => !disabled && setPreviewPlanets(occ)}
                        onMouseLeave={() => !disabled && setPreviewPlanets([])}
                        onClick={() => !disabled && lockReplace(occ)}
                      >
                        {h} • {houseShort(h)}
                      </button>
                    );
                  })}

                  {/* Planet chips */}
                  {planets.map((p) => (
                    <button
                      key={`p-${p}`}
                      type="button"
                      className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20"
                      title={planetGloss(p)}
                      onMouseEnter={() => setPreviewPlanets([p])}
                      onMouseLeave={() => setPreviewPlanets([])}
                      onClick={() => lockReplace([p])}
                    >
                      {p}
                    </button>
                  ))}

                  {/* Aspect chips (each chip highlights the pair) */}
                  {(aspects ?? []).slice(0, 2).map((a, i) => {
                    const pair = [a.p1, a.p2];
                    const tone = aspectTone(a.name).trim();
                    const label = `${a.p1}–${a.p2}${tone ? ` (${tone} ${a.name.toLowerCase()})` : ` (${a.name.toLowerCase()})`}`;
                    return (
                      <button
                        key={`a-${i}-${a.p1}-${a.p2}`}
                        type="button"
                        className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10"
                        title={t("insights.ui.highlightAspectsBtn")}
                        onMouseEnter={() => setPreviewPlanets(pair)}
                        onMouseLeave={() => setPreviewPlanets([])}
                        onClick={() => lockReplace(pair)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Quick actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {allForDomain.length > 0 && (
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20"
                      onClick={() => lockReplace(allForDomain)}
                    >
                      {t("insights.ui.highlightAll")}
                    </button>
                  )}
                  {planets.length > 0 && (
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10"
                      onClick={() => lockReplace(planets)}
                    >
                      {t("insights.ui.highlightPlanetsBtn")}
                    </button>
                  )}
                  {houses.length > 0 && houseOccupants.length > 0 && (
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10"
                      onClick={() => lockReplace(houseOccupants)}
                    >
                      {t("insights.ui.highlightHousesBtn")}
                    </button>
                  )}
                  {aspects.length > 0 && (
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10"
                      onClick={() => lockReplace(aspectPlanets)}
                    >
                      {t("insights.ui.highlightAspectsBtn")}
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
