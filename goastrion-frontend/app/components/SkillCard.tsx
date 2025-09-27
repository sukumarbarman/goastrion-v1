// app/components/SkillCard.tsx
"use client";

import { useId, useMemo, useState } from "react";
import { useI18n } from "../lib/i18n";

type Props = {
  name: string;
  score: number;
  blurb: string;
};

export default function SkillCard({ name, score, blurb }: Props) {
  const [hover, setHover] = useState(false);
  const uid = useId();
  const t = useI18n() as any;

  // ---- Localized strings with safe fallbacks ----
  const hoverHint: string =
    t?.components?.skillCard?.hoverHint ??
    'Hover to preview. Click “See Sample Report” for details.';

  const ariaScoreTpl: string =
    t?.components?.skillCard?.ariaScoreLabel ?? "{name} score {score}";

  const ariaScore = useMemo(
    () => ariaScoreTpl.replace("{name}", name).replace("{score}", String(score)),
    [ariaScoreTpl, name, score]
  );

  // Stable, a11y-friendly id (don’t rely on raw name)
  const previewId = `skill-preview-${uid}`;

  return (
    <div
      className="relative bg-[#141A2A] rounded-2xl p-5 border border-white/5 hover:border-cyan-400/30 transition-all"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      tabIndex={0}
      aria-describedby={previewId}
    >
      <div className="text-white font-medium">{name}</div>

      <div className="mt-3 h-2 w-full rounded bg-white/10 overflow-hidden" aria-label={ariaScore}>
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-slate-400">{hoverHint}</p>

      {/* Hover preview */}
      {hover && (
        <div
          id={previewId}
          className="
            absolute z-30 -top-3 left-4 -translate-y-full w-72
            rounded-xl
            bg-[#060B19]/95
            backdrop-blur-sm
            ring-1 ring-cyan-400/30
            shadow-2xl shadow-black/60
            p-3
            origin-bottom-left scale-95 animate-[fadeIn_.14s_ease-out_forwards]
          "
          role="tooltip"
        >
          {/* caret */}
          <div
            className="
              absolute -bottom-2 left-6
              h-3 w-3 rotate-45
              bg-[#060B19]/95
              ring-1 ring-cyan-400/30
            "
            aria-hidden
          />
          <div className="text-slate-100 text-sm leading-snug">{blurb}</div>
        </div>
      )}
    </div>
  );
}
