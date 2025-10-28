// app/components/insights/SkillCard.tsx
"use client";
import ScoreBar from "./ScoreBar";
import Chip from "./Chip";
import { useChipLabel } from "../../lib/insights-i18n";
import type { SkillInsight } from "../api/insightsClient";

/** ScoreBar’s accepted tier type */
type ScoreTier = "weak" | "moderate" | "strong" | "excellent";

/** Derive a compatible tier from a numeric score */
function scoreToTier(score: number): ScoreTier {
  if (score >= 85) return "excellent";
  if (score >= 70) return "strong";
  if (score >= 45) return "moderate";
  return "weak";
}

/** Get a string[] property safely (strictly strings) */
function getStrArrayProp(obj: unknown, prop: string): string[] {
  if (obj && typeof obj === "object" && prop in obj) {
    const v = (obj as Record<string, unknown>)[prop];
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  }
  return [];
}

/** Flex getter: return first non-empty string[] among candidates; supports single string too */
function getStrArrayFlex(obj: unknown, props: string[]): string[] {
  for (const p of props) {
    if (obj && typeof obj === "object" && p in obj) {
      const v = (obj as Record<string, unknown>)[p];
      if (Array.isArray(v)) {
        const arr = v.filter((x): x is string => typeof x === "string");
        if (arr.length) return arr;
      } else if (typeof v === "string" && v.trim()) {
        return [v];
      }
    }
  }
  return [];
}

export default function SkillCard({ s }: { s: SkillInsight }) {
  const chipLabel = useChipLabel();

  // Some payloads may omit `chips`
  const chips = getStrArrayProp(s, "chips");

  // Back-compat: API may send `reason` (string or string[]) or `reasons` (string[])
  const reasons = getStrArrayFlex(s, ["reasons", "reason"]);

  const tier = scoreToTier(s.score);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-semibold">
          {chipLabel(`insights.skills.${s.key}`)}
        </div>
        <div className="w-40">
          <ScoreBar score={s.score} tier={tier} />
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap">
          {chips.map((c) => (
            <Chip key={c}>{chipLabel(c)}</Chip>
          ))}
        </div>
      )}

      {reasons.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-300">
          {reasons.map((r) => (
            <li key={r}>{chipLabel(r)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
