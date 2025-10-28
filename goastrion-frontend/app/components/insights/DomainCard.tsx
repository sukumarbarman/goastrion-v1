// app/components/insights/DomainCard.tsx
"use client";
import ScoreBar from "./ScoreBar";
import Chip from "./Chip";
import { useChipLabel } from "../../lib/insights-i18n";
import type { DomainInsight } from "../api/insightsClient";

/** Safe string getter without using `any` */
function getStrProp(obj: unknown, prop: string): string | undefined {
  if (obj && typeof obj === "object" && prop in obj) {
    const v = (obj as Record<string, unknown>)[prop];
    return typeof v === "string" ? v : undefined;
  }
  return undefined;
}

/** Safe string-array getter */
function getStrArrayProp(obj: unknown, prop: string): string[] {
  if (obj && typeof obj === "object" && prop in obj) {
    const v = (obj as Record<string, unknown>)[prop];
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  }
  return [];
}

/** Tier expected by <ScoreBar /> */
type ScoreTier = "weak" | "moderate" | "strong" | "excellent";

/** If server didn’t send a ScoreBar-compatible tier, derive one from score */
function scoreToScoreBarTier(score: number): ScoreTier {
  if (score >= 85) return "excellent";
  if (score >= 70) return "strong";
  if (score >= 40) return "moderate";
  return "weak";
}

/** Read a compatible `tier` safely from the object */
function getScoreBarTierProp(obj: unknown): ScoreTier | undefined {
  if (obj && typeof obj === "object" && "tier" in obj) {
    const v = (obj as Record<string, unknown>).tier;
    if (v === "weak" || v === "moderate" || v === "strong" || v === "excellent") return v;
  }
  return undefined;
}

/** Highlights types (as actually rendered by this card) */
type Aspect = { p1: string; p2: string; name: string };
type Highlights = {
  planets: string[];
  houses: Array<string | number>;
  aspects: Aspect[];
};

/** Safe highlights reader */
function getHighlightsProp(obj: unknown): Highlights | null {
  if (!(obj && typeof obj === "object" && "highlights" in obj)) return null;
  const raw = (obj as Record<string, unknown>).highlights;

  if (!raw || typeof raw !== "object") return null;

  const planets = getStrArrayProp(raw, "planets");
  const housesRaw = (raw as Record<string, unknown>)["houses"];
  const houses = Array.isArray(housesRaw)
    ? housesRaw.filter((h) => typeof h === "string" || typeof h === "number")
    : [];

  const aspectsRaw = (raw as Record<string, unknown>)["aspects"];
  const aspects: Aspect[] = Array.isArray(aspectsRaw)
    ? aspectsRaw
        .filter((a) => a && typeof a === "object")
        .map((a) => {
          const o = a as Record<string, unknown>;
          const p1 = typeof o.p1 === "string" ? o.p1 : "";
          const p2 = typeof o.p2 === "string" ? o.p2 : "";
          const name = typeof o.name === "string" ? o.name : "";
          return { p1, p2, name };
        })
        .filter((a) => a.p1 && a.p2 && a.name)
    : [];

  if (!planets.length && !houses.length && !aspects.length) return null;
  return { planets, houses, aspects };
}

type TimeWindow = { title?: string; window?: string; nextExact?: string; source?: string };

/** Safe timeWindows reader */
function getTimeWindowsProp(obj: unknown): TimeWindow[] {
  if (!(obj && typeof obj === "object" && "timeWindows" in obj)) return [];
  const v = (obj as Record<string, unknown>).timeWindows;
  if (!Array.isArray(v)) return [];
  return v
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const o = item as Record<string, unknown>;
      const title = typeof o.title === "string" ? o.title : undefined;
      const window = typeof o.window === "string" ? o.window : undefined;
      const nextExact = typeof o.nextExact === "string" ? o.nextExact : undefined;
      const source = typeof o.source === "string" ? o.source : undefined;
      return { title, window, nextExact, source };
    });
}

/** Safe reasons reader */
function getReasonsProp(obj: unknown): string[] {
  return getStrArrayProp(obj, "reasons");
}

export default function DomainCard({ d }: { d: DomainInsight }) {
  const chipLabel = useChipLabel();

  // Prefer a human label, else a domain code, else fallback to legacy `key`
  const title =
    getStrProp(d, "label") ??
    getStrProp(d, "domain") ??
    getStrProp(d, "key") ??
    "";

  // Backward-compat: use provided compatible tier, else derive from score
  const tier: ScoreTier = getScoreBarTierProp(d) ?? scoreToScoreBarTier(d.score);

  const chips = getStrArrayProp(d, "chips");
  const highlights = getHighlightsProp(d);
  const reasons = getReasonsProp(d);
  const timeWindows = getTimeWindowsProp(d);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-semibold">{title}</div>
        <div className="w-48">
          <ScoreBar score={d.score} tier={tier} />
        </div>
      </div>

      {/* Chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap mb-3">
          {chips.map((c) => (
            <Chip key={c}>{chipLabel(c)}</Chip>
          ))}
        </div>
      )}

      {/* Highlights */}
      {highlights && (
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-slate-400 mb-1">Planets</div>
            <div className="flex flex-wrap">
              {highlights.planets.map((p) => (
                <Chip key={p}>{p}</Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">Houses</div>
            <div className="flex flex-wrap">
              {highlights.houses.map((h) => (
                <Chip key={String(h)}>House {h}</Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">Aspects</div>
            <div className="flex flex-wrap">
              {highlights.aspects.map((a, i) => (
                <Chip key={`${a.p1}-${a.p2}-${a.name}-${i}`}>
                  {a.p1}–{a.p2} {a.name}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reasons */}
      {reasons.length > 0 && (
        <ul className="mt-3 list-disc pl-5 text-sm text-slate-300">
          {reasons.map((r) => (
            <li key={r}>{chipLabel(r)}</li>
          ))}
        </ul>
      )}

      {/* Time windows */}
      {timeWindows.length > 0 && (
        <div className="mt-3 text-xs text-slate-400">
          {timeWindows.map((tw, i) => (
            <div key={i} className="border-t border-white/10 pt-2 mt-2">
              <div>{chipLabel(tw.title || "insights.time.transitWindow")}</div>
              <div>
                {tw.nextExact ? `Next: ${tw.nextExact}` : `Window: ${tw.window ?? "-"}`} ·{" "}
                {tw.source ?? ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
