// app/components/insights/DomainCard.tsx
"use client";
import ScoreBar from "./ScoreBar";
import Chip from "./Chip";
import { useChipLabel } from "../../lib/insights-i18n";
import type { DomainInsight } from "../api/insightsClient";

export default function DomainCard({ d }: { d: DomainInsight }) {
  const chipLabel = useChipLabel();

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-semibold">{d.key}</div>
        <div className="w-48"><ScoreBar score={d.score} tier={d.tier} /></div>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap mb-3">
        {d.chips.map((c) => <Chip key={c}>{chipLabel(c)}</Chip>)}
      </div>

      {/* Highlights */}
      {d.highlights && (
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-slate-400 mb-1">Planets</div>
            <div className="flex flex-wrap">
              {d.highlights.planets.map((p) => <Chip key={p}>{p}</Chip>)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">Houses</div>
            <div className="flex flex-wrap">
              {d.highlights.houses.map((h) => <Chip key={h}>House {h}</Chip>)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">Aspects</div>
            <div className="flex flex-wrap">
              {d.highlights.aspects.map((a, i) => (
                <Chip key={`${a.p1}-${a.p2}-${a.name}-${i}`}>{a.p1}–{a.p2} {a.name}</Chip>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reasons */}
      {d.reasons?.length > 0 && (
        <ul className="mt-3 list-disc pl-5 text-sm text-slate-300">
          {d.reasons.map((r) => <li key={r}>{chipLabel(r)}</li>)}
        </ul>
      )}

      {/* Time windows */}
      {d.timeWindows?.length > 0 && (
        <div className="mt-3 text-xs text-slate-400">
          {d.timeWindows.map((tw, i) => (
            <div key={i} className="border-t border-white/10 pt-2 mt-2">
              <div>{chipLabel(tw.title || "insights.time.transitWindow")}</div>
              <div>
                {tw.nextExact ? `Next: ${tw.nextExact}` : `Window: ${tw.window ?? "-"}`} · {tw.source ?? ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
