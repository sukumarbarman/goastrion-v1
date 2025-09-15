"use client";
export default function ScoreBar({ score, tier }: { score:number; tier:"weak"|"moderate"|"strong"|"excellent" }) {
  return (
    <div className="space-y-1">
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div className="h-2 rounded-full" style={{ width: `${score}%` }} />
      </div>
      <div className="text-xs text-slate-400">{score} · {tier}</div>
    </div>
  );
}