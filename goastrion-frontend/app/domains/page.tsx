// app/domains/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "../components/Container";
import { useI18n } from "../lib/i18n";
import ChartWithHighlights from "../components/ChartWithHighlights";
import { loadCreateState, fetchInsights } from "../lib/insightsClient";
import { useHighlight } from "../hooks/useSkillHighlight";

/* ---------- Types ---------- */
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
  context?: { planets_in_houses?: Record<string, string[]> };
  insights?: { domains?: DomainItem[] };
};

/* ---------- Fallback strings (used only if i18n key missing) ---------- */
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

/* ---------- Small utils ---------- */
function tpl(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
function uniq<T>(arr: T[]) { return Array.from(new Set(arr)); }
function joinOxford(items: string[], andWord = "and", comma = ", ") {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} ${andWord} ${items[1]}`;
  return `${items.slice(0, -1).join(comma)}${comma}${andWord} ${items[items.length - 1]}`;
}

/* ---------- Planet localization helpers ---------- */
function planetI18nKey(p: string) {
  return `planets.${p.toLowerCase()}`;
}
function localizePlanetName(p: string, t: (k: string, vars?: any) => string) {
  const label = t(planetI18nKey(p));
  return label === planetI18nKey(p) ? p : label; // if key missing, keep original
}
function localizeSvgPlanets(svg: string, t: (k: string) => string) {
  const names = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
  const pattern = new RegExp(`(>)(\\s*)(${names.join("|")})(\\s*)(<)`, "gi");
  return svg.replace(pattern, (_m, gt, pre, name, post, lt) => {
    const localized = localizePlanetName(String(name), t);
    return `${gt}${pre}${localized}${post}${lt}`;
  });
}

export default function DomainsPage() {
  const { t, locale } = useI18n();

  // dev-friendly fallback wrapper: if t(key) returns the key string, use fb instead
  const tf = (key: string, fb: string) => {
    const v = t(key);
    return v === key ? fb : v;
  };

  // i18n accessors (translation with fallback strings)
  const houseGloss = (h: number) => tf(`insights.housesGloss.${h}`, HOUSE_GLOSS_FALLBACK[h] ?? "");
  const houseShort = (h: number) => (houseGloss(h).split(",")[0] || t("insights.ui.house"));
  const houseOrdinal = (h: number) => tf(`insights.housesOrdinal.${h}`, `${h}th`);
  const planetGloss = (p: string) => tf(`insights.planetsGloss.${p}`, PLANET_GLOSS_FALLBACK[p] ?? "");
  const aspectTone = (name: string) => tf(`insights.aspectTone.${name}`, ASPECT_TONE_FALLBACK[name] ?? "");

  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [svg, setSvg] = useState<string | null>(null);
  const [ctxHouses, setCtxHouses] = useState<Record<string, string[]>>({});
  const [err, setErr] = useState<string | null>(null);

  const { highlightPlanets, lockReplace, clear, setPreviewPlanets } = useHighlight();

  useEffect(() => {
    const st = loadCreateState();
    if (!st) { setErr(tf("errors.genericGenerate", "Failed to generate chart.")); return; }

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
      .catch((e) => setErr(e instanceof Error ? e.message : tf("errors.genericGenerate", "Failed to generate chart.")));

    // Chart SVG (raw)
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

  // Localize the SVG on the client whenever svg or locale changes
  const localizedSvg = useMemo(() => {
    return svg ? localizeSvgPlanets(svg, t) : null;
  }, [svg, t, locale]);

  const occupantsForHouse = (h: number): string[] => ctxHouses[String(h)] ?? [];
  const uniqStr = (arr: string[]) => Array.from(new Set(arr)).filter(Boolean);

  // Build localized, interactive sentence parts
  const buildOption2Parts = (d: DomainItem) => {
    const domain = tf(`insights.domains.${d.key.toLowerCase()}.title`, d.key);
    const andWord = tf("insights.copy.join.and", "and");
    const comma = tf("insights.copy.join.comma", ", ");
    const tierKey = d.tier ?? "unknown";
    const phase = tf(`insights.copy.phase_by_tier.${tierKey}`, "an evolving phase");

    const houses = d.highlights?.houses ?? [];
    const planets = d.highlights?.planets ?? [];
    const aspects = d.highlights?.aspects ?? [];

    // S1
    const line1Text = tpl(t("insights.copy.line1_template"), { domain, phase, score: d.score });

    // Houses sentence
    let houseListLabel = "";
    if (houses.length === 1) houseListLabel = `${houseOrdinal(houses[0])} ${tf("insights.copy.housesWord","house")}`;
    else if (houses.length === 2) houseListLabel = `${houseOrdinal(houses[0])} ${andWord} ${houseOrdinal(houses[1])} ${tf("insights.copy.housesWordPlural","houses")}`;
    else if (houses.length >= 3) houseListLabel = `${joinOxford(houses.map(houseOrdinal), andWord, comma)} ${tf("insights.copy.housesWordPlural","houses")}`;

    const themes = uniq(
      houses.flatMap(h => (houseGloss(h) ?? "").split(",").map(s => s.trim()).filter(Boolean))
    );
    const themesJoined = joinOxford(themes, andWord, comma);

    const housesLineText =
      houses.length
        ? tpl(t("insights.copy.houses_intro"), { houseList: houseListLabel, themes: themesJoined })
        : "";

    // Planets sentence
    const planetListLabel = joinOxford(planets.map(p => localizePlanetName(p, t)), andWord, comma);
    const adviceList = joinOxford(planets.map(p => t(`insights.copy.planet_advice.${p}`)), andWord, comma);
    const planetsLineText =
      planets.length
        ? tpl(t("insights.copy.planets_intro"), { planetList: planetListLabel, adviceList })
        : "";

    // Aspects (use localized planet names + tone)
    const aspectItemsDetailed = (aspects ?? []).slice(0,2).map(a => {
      const tone = aspectTone(a.name).trim();
      const p1 = localizePlanetName(a.p1, t);
      const p2 = localizePlanetName(a.p2, t);
      const pair = tpl(t("insights.copy.aspect_pair"), { p1, p2, tone, name: a.name.toLowerCase() });
      const hint = t(`insights.copy.aspect_hint_by_name.${a.name}`);
      const text = tpl(t("insights.copy.aspect_item"), { pair, hint });
      return { text, planets: uniq([a.p1, a.p2]) as string[] };
    });

    const houseOccupantsAll = uniq(houses.flatMap(h => occupantsForHouse(h)));
    const aspectPlanetsAll = uniq(aspects.flatMap(a => [a.p1, a.p2]));

    return {
      line1:       { text: line1Text,       planets: [] },
      housesLine:  housesLineText ? { text: housesLineText,  planets: houseOccupantsAll } : null,
      planetsLine: planetsLineText ? { text: planetsLineText, planets } : null,
      aspectsHeader: aspects.length ? t("insights.ui.notableAspects") + ":" : "",
      aspectsAllPlanets: aspectPlanetsAll as string[],
      aspectsItems: aspectItemsDetailed,
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
              {localizedSvg ? (
                <ChartWithHighlights svg={localizedSvg} highlightPlanets={highlightPlanets} className="w-full h-full" />
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
                  {highlightPlanets.map(p => localizePlanetName(p, t)).join(", ")}
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

            const parts = buildOption2Parts(d);
            const tierKey = d.tier ? `insights.tiers.${d.tier}` : undefined;

            return (
              <div
                key={d.key}
                className="rounded-2xl border border-white/10 bg-black/10 p-4 hover:border-cyan-500/40 transition"
                onMouseEnter={() => setPreviewPlanets([])}
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

                {/* Localized sentences */}
                <div className="mt-3 text-sm text-slate-300 leading-6 space-y-1.5">
                  <div>{parts.line1.text}</div>
                  {parts.housesLine && <div>{parts.housesLine.text}</div>}
                  {parts.planetsLine && <div>{parts.planetsLine.text}</div>}

                  {parts.aspectsItems.length > 0 && (
                    <div>
                      <div className="font-medium text-slate-200">{parts.aspectsHeader}</div>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        {parts.aspectsItems.map((it, idx) => (
                          <li key={idx}>{it.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Chips */}
                <div className="mt-3 flex flex-wrap gap-2">
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
                      {localizePlanetName(p, t)}
                    </button>
                  ))}

                  {(aspects ?? []).slice(0, 2).map((a, i) => {
                    const pair = [a.p1, a.p2];
                    const tone = aspectTone(a.name).trim();
                    const p1 = localizePlanetName(a.p1, t);
                    const p2 = localizePlanetName(a.p2, t);
                    const label = `${p1}–${p2}${tone ? ` (${tone} ${a.name.toLowerCase()})` : ` (${a.name.toLowerCase()})`}`;
                    return (
                      <button
                        key={`a-${i}-${a.p1}-${a.p2}`}
                        type="button"
                        className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-slate-2 00 hover:bg-white/10"
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
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </Container>
  );
}
