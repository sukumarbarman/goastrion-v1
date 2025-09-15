// app/components/insights/SkillCard.tsx
"use client";
import ScoreBar from "./ScoreBar";
import Chip from "./Chip";
import { useChipLabel } from "../../lib/insights-i18n";
import type { SkillInsight } from "../api/insightsClient";

export default function SkillCard({ s }: { s: SkillInsight }) {
  const chipLabel = useChipLabel();
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-semibold">{chipLabel(`insights.skills.${s.key}`)}</div>
        <div className="w-40"><ScoreBar score={s.score} tier={s.score >= 85 ? "excellent" : s.score >= 70 ? "strong" : s.score >= 45 ? "moderate" : "weak"} /></div>
      </div>
      <div className="flex flex-wrap">
        {s.chips.map((c) => <Chip key={c}>{chipLabel(c)}</Chip>)}
      </div>
      {s.reasons?.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-300">
          {s.reasons.map((r) => <li key={r}>{chipLabel(r)}</li>)}
        </ul>
      )}
    </div>
  );
}
