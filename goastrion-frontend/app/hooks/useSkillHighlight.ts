// app/hooks/useSkillHighlight.ts
"use client";
import { useCallback, useMemo, useState } from "react";

/* ========= Generic chart highlighter (used by Domains) ========= */
export function useHighlight() {
  const [lockedPlanets, setLockedPlanets] = useState<string[]>([]);
  const [previewPlanets, setPreviewState] = useState<string[]>([]); // <- renamed setter

  const canonical = useCallback(
    (arr: string[]) =>
      Array.from(new Set((arr ?? []).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    []
  );

  // Preview wins; otherwise show locked
  const highlightPlanets = useMemo(
    () => (previewPlanets.length ? previewPlanets : lockedPlanets),
    [lockedPlanets, previewPlanets]
  );

  const clear = useCallback(() => {
    setLockedPlanets([]);
    setPreviewState([]);
  }, []);

  // Toggle behavior (kept for backward-compat)
  const lock = useCallback(
    (planets: string[]) => {
      const next = canonical(planets);
      setLockedPlanets((curr) => {
        const currCanon = canonical(curr);
        const isSame =
          next.length === currCanon.length &&
          next.every((p, i) => p === currCanon[i]);
        return isSame ? [] : next;
      });
      setPreviewState([]);
    },
    [canonical]
  );

  // Always replace current selection (recommended)
  const lockReplace = useCallback(
    (planets: string[]) => {
      setLockedPlanets(canonical(planets));
      setPreviewState([]);
    },
    [canonical]
  );

  // Public API for previews (canonicalized)
  const setPreviewPlanets = useCallback(
    (planets: string[]) => {
      setPreviewState(canonical(planets)); // <- call the setter, not itself
    },
    [canonical]
  );

  return {
    highlightPlanets,
    lock,          // toggle
    lockReplace,   // replace
    clear,
    setPreviewPlanets,
  };
}

/* ========= Skill-specific highlighter (used by Skills) ========= */
export function useSkillHighlight() {
  const [locked, setLocked] = useState<string[]>([]);
  const [preview, setPreviewState] = useState<string[]>([]); // <- distinct name

  const lock = useCallback((planets: string[]) => setLocked(planets), []);
  const clear = useCallback(() => {
    setLocked([]);
    setPreviewState([]);
  }, []);
  const setPreviewPlanets = useCallback(
    (planets: string[]) => setPreviewState(planets),
    []
  );

  // preview wins while hovering; fall back to locked
  const highlightPlanets = preview.length ? preview : locked;

  return { highlightPlanets, lock, clear, setPreviewPlanets };
}
