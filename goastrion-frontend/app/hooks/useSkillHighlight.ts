// app/hooks/useSkillHighlight.ts
"use client";

import { useCallback, useState } from "react";

export function useSkillHighlight() {
  const [locked, setLocked] = useState<string[]>([]);
  const [preview, setPreview] = useState<string[]>([]);

  const lock = useCallback((planets: string[]) => setLocked(planets), []);
  const clear = useCallback(() => { setLocked([]); setPreview([]); }, []);
  const setPreviewPlanets = useCallback((planets: string[]) => setPreview(planets), []);

  // preview wins while hovering; fall back to locked
  const highlightPlanets = preview.length ? preview : locked;

  return { highlightPlanets, lock, clear, setPreviewPlanets };
}
