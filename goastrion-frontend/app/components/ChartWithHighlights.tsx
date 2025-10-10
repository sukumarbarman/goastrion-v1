"use client";

import { useEffect, useRef } from "react";

type Props = {
  svg?: string | null;
  highlightPlanets?: string[]; // NEW
  className?: string;
};

export default function ChartWithHighlights({ svg, highlightPlanets = [], className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Inject SVG into the wrapper
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = svg || "";
  }, [svg]);

  // Apply highlight classes whenever the list changes
  useEffect(() => {
    if (!ref.current) return;
    const root = ref.current;

    // clear old highlights
    root.querySelectorAll<SVGTextElement>("text.__hi").forEach(el => el.classList.remove("__hi"));

    if (!highlightPlanets.length) return;

    // normalize target labels for matching
    const want = new Set(highlightPlanets.map(s => s.trim().toLowerCase()));

    // naive match: any <text> whose content equals a planet name
    root.querySelectorAll<SVGTextElement>("text").forEach(el => {
      const label = (el.textContent || "").trim().toLowerCase();
      if (want.has(label)) el.classList.add("__hi");
    });
  }, [highlightPlanets]);

  return (
    <div className={className}>
      {/* style used by the __hi class */}
      <style jsx>{`
        :global(text.__hi) {
          fill: #22d3ee !important; /* cyan-400 */
          font-weight: 700;
          paint-order: stroke;
          stroke: #0c4a6e;          /* cyan-900-ish stroke for contrast */
          stroke-width: 0.8px;
        }
      `}</style>
      <div ref={ref} className="w-full h-full" />
    </div>
  );
}
