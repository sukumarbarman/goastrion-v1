// app/components/SkillCard.tsx
"use client";
import { useState, KeyboardEvent } from "react";

type SkillCardProps = {
  name: string;
  score: number; // 0–100
  blurb: string;
};

export default function SkillCard({ name, score, blurb }: SkillCardProps) {
  const [hover, setHover] = useState(false);

  const clamped = Math.max(0, Math.min(100, score));
  const previewId = `${name}-preview`;

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setHover((h) => !h);
    }
  };

  return (
    <div
      className="relative bg-[#141A2A] rounded-2xl p-5 border border-white/5 hover:border-cyan-400/30 transition-all outline-none focus:ring-2 focus:ring-cyan-400/40"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onKeyDown={onKey}
      role="button"
      tabIndex={0}
      aria-describedby={previewId}
      aria-pressed={hover}
    >
      <div className="text-white font-medium">{name}</div>

      <div
        className="mt-3 h-2 w-full rounded bg-white/10 overflow-hidden"
        aria-label={`${name} score ${clamped}`}
      >
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
          style={{ width: `${clamped}%` }}
        />
      </div>

      {/* hover/keyboard preview */}
      {hover && (
        <div
          id={previewId}
          className="absolute left-5 right-5 top-full mt-3 rounded-xl bg-white/5 text-slate-200 text-sm p-3 backdrop-blur"
        >
          {blurb}
        </div>
      )}
    </div>
  );
}
