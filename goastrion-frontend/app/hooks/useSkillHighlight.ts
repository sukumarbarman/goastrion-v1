// app/hooks/useHighlight.ts
"use client";
import { useCallback, useMemo, useState } from "react";

export function useHighlight() {
  const [lockedPlanets, setLockedPlanets] = useState<string[]>([]);
  const [previewPlanets, setPreviewPlanets] = useState<string[]>([]);

  const canonical = (arr: string[]) =>
    Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b));

  const highlightPlanets = useMemo(() => {
    return lockedPlanets.length ? lockedPlanets : previewPlanets;
  }, [lockedPlanets, previewPlanets]);

  const clear = useCallback(() => {
    setLockedPlanets([]);
    setPreviewPlanets([]);
  }, []);

  // replace lock; if same selection is already locked, toggle off
  const lock = useCallback((planets: string[]) => {
    const next = canonical(planets);
    const curr = canonical(lockedPlanets);
    const isSame =
      next.length === curr.length && next.every((p, i) => p === curr[i]);
    setLockedPlanets(isSame ? [] : next);
    setPreviewPlanets([]);
  }, [lockedPlanets]);

  return {
    highlightPlanets,
    lock,
    clear,
    setPreviewPlanets,
  };
}

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

