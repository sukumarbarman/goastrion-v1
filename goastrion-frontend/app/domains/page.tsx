"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Container from "../components/Container";
import { useI18n } from "../lib/i18n";
import ChartWithHighlights from "../components/ChartWithHighlights";
import {
  loadCreateState,
  fetchInsights,
  type DomainItem as DomainItemClient,
} from "../lib/insightsClient";
import { useHighlight } from "../hooks/useSkillHighlight";
import AdSlot from "../components/AdSlot"; // ⬅️ NEW

/* ---------- Safari-safe datetime helper (same as Create page) ---------- */
type TzId = "IST" | "UTC";
const TZ_HOURS: Record<TzId, number> = { IST: 5.5, UTC: 0.0 };

function localCivilToUtcIso(dob: string, tob: string, tzId: TzId) {
  const [Y, M, D] = dob.split("-").map(Number);
  const [h, m] = tob.split(":").map(Number);
  const tzHours = TZ_HOURS[tzId] ?? 0;
  const ms =
    Date.UTC(Y, (M ?? 1) - 1, D ?? 1, (h ?? 0), (m ?? 0)) - tzHours * 3600_000;
  const iso = new Date(ms).toISOString();
  if (!iso || Number.isNaN(ms)) throw new Error("Bad datetime");
  return { dtIsoUtc: iso, tzHours };
}

/* ---------- Fallback strings (only used if a key is missing) ---------- */
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
function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}
function joinOxford(items: string[], andWord = "and", comma = ", ") {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} ${andWord} ${items[1]}`;
  return `${items.slice(0, -1).join(comma)}${comma}${andWord} ${items[items.length - 1]}`;
}

/* ---------- Planet localization helpers ---------- */
function planetI18nKey(p: string) {
  return `planets.${p.toLowerCase()}`;
}
function localizePlanetName(
  p: string,
  t: (k: string, vars?: Record<string, string | number>) => string
) {
  const key = planetI18nKey(p);
  const label = t(key);
  return label === key ? p : label; // fall back to original if key missing
}

/** Localize planet labels inside the generated SVG so visual + highlight names match */
function localizeSvgPlanets(svg: string, t: (k: string) => string) {
  const names = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  const pattern = new RegExp(`(>)(\\s*)(${names.join("|")})(\\s*)(<)`, "g");
  return svg.replace(pattern, (_m, gt, pre, name, post, lt) => {
    return `${gt}${pre}${localizePlanetName(String(name), t)}${post}${lt}`;
  });
}

/* ---------- Interactive handlers (NOT a hook) ---------- */
type HandlerProps = React.HTMLAttributes<HTMLElement> & {
  role?: string;
  tabIndex?: number;
};
function makeInteractiveHandlers(
  planets: string[],
  setPreviewPlanets: (ps: string[]) => void,
  lockReplace: (ps: string[]) => void
): HandlerProps {
  const has = planets && planets.length > 0;
  if (!has) return { tabIndex: -1 };
  return {
    onMouseEnter: () => setPreviewPlanets(planets),
    onMouseLeave: () => setPreviewPlanets([]),
    onFocus: () => setPreviewPlanets(planets),
    onBlur: () => setPreviewPlanets([]),
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        lockReplace(planets);
      }
    },
    onClick: () => lockReplace(planets),
    tabIndex: 0,
    role: "button",
    className:
      "cursor-pointer hover:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded",
    title: "Hover or click to highlight",
    "aria-label": "Highlight related planets",
  };
}

export default function DomainsPage() {
  const { t } = useI18n();

  // Fallback wrapper (memoized so it can be in deps)
  const tf = useCallback(
    (key: string, fb: string) => {
      const v = t(key);
      return v === key ? fb : v;
    },
    [t]
  );

  // i18n accessors with fallbacks
  const houseGloss = (h: number) => tf(`insights.housesGloss.${h}`, HOUSE_GLOSS_FALLBACK[h] ?? "");
  const houseOrdinal = (h: number) => tf(`insights.housesOrdinal.${h}`, `${h}th`);
  const aspectTone = (name: string) => tf(`insights.aspectTone.${name}`, ASPECT_TONE_FALLBACK[name] ?? "");

  const [domains, setDomains] = useState<DomainItemClient[]>([]);
  const [svg, setSvg] = useState<string | null>(null);
  const [ctxHouses, setCtxHouses] = useState<Record<string, string[]>>({});
  const [err, setErr] = useState<string | null>(null);

  const { highlightPlanets, lockReplace, clear, setPreviewPlanets } = useHighlight();

  useEffect(() => {
    const st = loadCreateState();
    if (!st || !st.dob || !st.tob || !st.tzId || !st.lat || !st.lon) {
      setErr(tf("errors.genericGenerate", "Failed to generate chart."));
      return;
    }

    const { dtIsoUtc, tzHours } = localCivilToUtcIso(st.dob, st.tob, st.tzId as TzId);

    fetchInsights({
      datetime: dtIsoUtc,
      lat: parseFloat(st.lat),
      lon: parseFloat(st.lon),
      tz_offset_hours: tzHours,
    })
      .then((json) => {
        setDomains(json?.insights?.domains ?? []);
        setCtxHouses(json?.context?.planets_in_houses ?? {});
      })
      .catch((e) =>
        setErr(e instanceof Error ? e.message : tf("errors.genericGenerate", "Failed to generate chart."))
      );

    // Chart SVG (raw → localized later)
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
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Chart error"))))
      .then((json) => setSvg(json?.svg ?? null))
      .catch(() => {});
  }, [tf]);

  // Localize the SVG whenever svg/t changes
  const localizedSvg = useMemo(() => (svg ? localizeSvgPlanets(svg, t) : null), [svg, t]);

  const occupantsForHouse = (h: number): string[] => ctxHouses[String(h)] ?? [];
  //const uniqStr = (arr: string[]) => Array.from(new Set(arr)).filter(Boolean);

  // Build localized, interactive sentence parts
  const buildOption2Parts = (d: DomainItemClient) => {
    const domain = tf(`insights.domains.${d.key.toLowerCase()}.title`, d.key);
    const andWord = tf("insights.copy.join.and", "and");
    const comma = tf("insights.copy.join.comma", ", ");
    const tierKey = d.tier ?? "unknown";
    const phase = tf(`insights.copy.phase_by_tier.${tierKey}`, "an evolving phase");

    const houses = d.highlights?.houses ?? [];
    const planets = d.highlights?.planets ?? [];
    const aspects = d.highlights?.aspects ?? [];

    // S1
    const line1Text = tpl(t("insights.copy.line1_template"), {
      domain,
      phase,
      score: d.score,
    });

    // Houses sentence
    let houseListLabel = "";
    if (houses.length === 1)
      houseListLabel = `${houseOrdinal(houses[0])} ${tf("insights.copy.housesWord", "house")}`;
    else if (houses.length === 2)
      houseListLabel = `${houseOrdinal(houses[0])} ${andWord} ${houseOrdinal(houses[1])} ${tf(
        "insights.copy.housesWordPlural",
        "houses"
      )}`;
    else if (houses.length >= 3)
      houseListLabel = `${joinOxford(houses.map(houseOrdinal), andWord, comma)} ${tf(
        "insights.copy.housesWordPlural",
        "houses"
      )}`;

    const themes = uniq(
      houses
        .flatMap((h) => (houseGloss(h) ?? "").split(",").map((s) => s.trim()).filter(Boolean))
    );
    const themesJoined = joinOxford(themes, andWord, comma);

    const housesLineText = houses.length
      ? tpl(t("insights.copy.houses_intro"), { houseList: houseListLabel, themes: themesJoined })
      : "";

    // Planets sentence (localized planet names + advice)
    const planetListLabel = joinOxford(
      planets.map((p) => localizePlanetName(p, t)),
      andWord,
      comma
    );
    const adviceList = joinOxford(
      planets.map((p) => t(`insights.copy.planet_advice.${p}`)),
      andWord,
      comma
    );
    const planetsLineText = planets.length
      ? tpl(t("insights.copy.planets_intro"), { planetList: planetListLabel, adviceList })
      : "";

    // Aspects (localized planet names + tone)
    const aspectItemsDetailed = (aspects ?? []).slice(0, 2).map((a) => {
      const tone = aspectTone(a.name).trim();
      const p1 = localizePlanetName(a.p1, t);
      const p2 = localizePlanetName(a.p2, t);
      const pair = tpl(t("insights.copy.aspect_pair"), { p1, p2, tone, name: a.name.toLowerCase() });
      const hint = t(`insights.copy.aspect_hint_by_name.${a.name}`);
      const text = tpl(t("insights.copy.aspect_item"), { pair, hint });
      return { text, planets: uniq([a.p1, a.p2]) as string[] };
    });

    const houseOccupantsAll = uniq(houses.flatMap((h) => occupantsForHouse(h)));
    const aspectPlanetsAll = uniq(aspects.flatMap((a) => [a.p1, a.p2]));

    return {
      line1: { text: line1Text, planets: [] as string[] },
      housesLine: housesLineText ? { text: housesLineText, planets: houseOccupantsAll } : null,
      planetsLine: planetsLineText ? { text: planetsLineText, planets } : null,
      aspectsHeader: aspects.length ? t("insights.ui.notableAspects") + ":" : "",
      aspectsAllPlanets: aspectPlanetsAll as string[],
      aspectsItems: aspectItemsDetailed,
    };
  };

  // Helper: convert any planet keys array → visible (localized) labels
  const toVisiblePlanets = useCallback((ps: string[]) => ps.map((p) => localizePlanetName(p, t)), [t]);

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">{t("insights.pages.domainsTitle")}</h1>


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
<p className="text-slate-400">{t("insights.pages.domainsSubtitle")}</p>
      </div>

      {err && <div className="text-red-300 text-sm mb-4">{err}</div>}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* LEFT: sticky chart */}
        <aside className="lg:col-span-5">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-4 lg:sticky lg:top-4">
            <div className="text-sm font-medium text-slate-200 mb-2">{t("insights.pages.chartTitle")}</div>
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
                  {highlightPlanets.join(", ")}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar ad (desktop only) */}
          <div className="mt-4 hidden lg:block">
            <AdSlot slot="8600708697" minHeight={600} />
          </div>
        </aside>

        {/* RIGHT: domain cards */}
        <section className="lg:col-span-7 grid md:grid-cols-2 gap-6">
          {(domains ?? []).map((d, idx) => {
            const houses = d.highlights?.houses ?? [];
            const planets = d.highlights?.planets ?? [];
            const aspects = d.highlights?.aspects ?? [];

            const occupantsForHouseLocal = (h: number): string[] => ctxHouses[String(h)] ?? [];
            const uniqStrLocal = (arr: string[]) => Array.from(new Set(arr)).filter(Boolean);

            const houseOccupants = uniqStrLocal(houses.flatMap((h) => occupantsForHouseLocal(h)));
            const aspectPlanets = uniqStrLocal(aspects.flatMap((a) => [a.p1, a.p2]));
            const allForDomainRaw = uniqStrLocal([...houseOccupants, ...planets, ...aspectPlanets]);

            // Convert every list we send to the highlighter to *visible localized* names
            const allForDomainVisible = toVisiblePlanets(allForDomainRaw);

            const parts = buildOption2Parts(d);
            const tierKey = d.tier ? `insights.tiers.${d.tier}` : undefined;

            // Build handlers with *localized* names
            const housesHandlers: HandlerProps | null = parts.housesLine
              ? makeInteractiveHandlers(toVisiblePlanets(parts.housesLine.planets), setPreviewPlanets, lockReplace)
              : null;
            const planetsHandlers: HandlerProps | null = parts.planetsLine
              ? makeInteractiveHandlers(toVisiblePlanets(parts.planetsLine.planets), setPreviewPlanets, lockReplace)
              : null;
            const aspectsHeaderHandlers: HandlerProps | null =
              parts.aspectsAllPlanets && parts.aspectsAllPlanets.length > 0
                ? makeInteractiveHandlers(toVisiblePlanets(parts.aspectsAllPlanets), setPreviewPlanets, lockReplace)
                : null;

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

                {/* Localized sentences (interactive) */}
                <div className="mt-3 text-sm text-slate-300 leading-6 space-y-1.5">
                  {parts.housesLine && <div {...housesHandlers!}>{parts.housesLine.text}</div>}

                  {parts.planetsLine && <div {...planetsHandlers!}>{parts.planetsLine.text}</div>}

                  {parts.aspectsItems.length > 0 && (
                    <div>
                      <div className="font-medium text-slate-200" {...(aspectsHeaderHandlers ?? {})}>
                        {parts.aspectsHeader}
                      </div>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        {parts.aspectsItems.map((it, i) => {
                          const liHandlers = makeInteractiveHandlers(
                            toVisiblePlanets(it.planets),
                            setPreviewPlanets,
                            lockReplace
                          );
                          return (
                            <li key={i}>
                              <span {...liHandlers}>{it.text}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {allForDomainVisible.length > 0 && (
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20"
                      onClick={() => lockReplace(allForDomainVisible)}
                    >
                      {t("insights.ui.highlightAll")}
                    </button>
                  )}
                </div>

                {/* Mid-feed ad after 3rd card (index 2) */}
                {idx === 2 && (
                  <div className="mt-4 md:col-span-2">
                    <AdSlot slot="2470931531" minHeight={300} />
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>

      {/* End-of-page ad */}
      <div className="mt-6">
        <AdSlot slot="3156810322" minHeight={280} />
      </div>
    </Container>
  );
}
