// goastrion-frontend/app/profile/_components/ChartSummaryPreview.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/app/lib/i18n";
import { loadCreateState, clearCreatePreview } from "@/app/lib/birthState";

type CreateState = ReturnType<typeof loadCreateState> | null;

// Deterministic timestamp (no locale/timezone surprises during hydration)
function formatSavedAt(savedAt?: string | number | Date) {
  if (!savedAt) return "—";
  try {
    const d = new Date(savedAt);
    // YYYY-MM-DD HH:mmZ (UTC) — stable across server/client
    const iso = d.toISOString(); // 2025-10-27T15:09:00.000Z
    return iso.slice(0, 16).replace("T", " ") + "Z"; // 2025-10-27 15:09Z
  } catch {
    return "—";
  }
}

export default function ChartSummaryPreview() {
  const { tOr } = useI18n();

  // undefined => pre-mount (SSR and first client render are identical)
  const [state, setState] = useState<CreateState | undefined>(undefined);

  useEffect(() => {
    setState(loadCreateState() ?? null);
  }, []);

  const lastSaved = state && state.savedAt ? formatSavedAt(state.savedAt) : "—";

  const Header = (
    <div className="flex items-center justify-between gap-2">
      <div className="text-white font-semibold">
        {tOr("profile.results.preview.title", "Chart & Summary")}
      </div>
      <div className="text-xs text-slate-400">
        {tOr(
          "profile.results.preview.meta.lastSaved",
          "Last saved: {datetime}"
        ).replace("{datetime}", lastSaved)}
      </div>
    </div>
  );

  const Container = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      {Header}
      {children}
    </div>
  );

  // Skeleton during hydration — SSR == first client render
  if (state === undefined) {
    return (
      <Container>
        <div className="mt-3 grid md:grid-cols-2 gap-4">
          <div className="h-40 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
          <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-3 w-3/4 bg-white/10 rounded" />
            <div className="h-3 w-2/3 bg-white/10 rounded" />
            <div className="h-3 w-1/2 bg-white/10 rounded" />
          </div>
        </div>
        <div className="mt-3 h-9 w-40 bg-white/10 rounded-full" />
      </Container>
    );
  }

  // No saved preview
  if (!state || (!state.svg && !state.summary)) {
    return (
      <Container>
        <p className="mt-3 text-sm text-slate-400">
          {tOr(
            "profile.results.preview.empty",
            "Generate your chart to see a preview."
          )}
        </p>
        <div className="mt-3">
          <Link
            href="/create"
            className="inline-flex rounded-full bg-cyan-500 px-4 py-2 text-slate-950 font-semibold hover:bg-cyan-400"
          >
            {tOr(
              "profile.results.preview.actions.openCreate",
              "Open in Create"
            )}
          </Link>
        </div>
      </Container>
    );
  }

  const onClear = () => {
    clearCreatePreview();
    setState(loadCreateState() ?? null);
  };

  // Has preview
  return (
    <Container>
      <div className="grid md:grid-cols-2 gap-4 mt-3">
        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
          <div
            className="w-full max-w-[min(92vw,520px)] mx-auto"
            dangerouslySetInnerHTML={{ __html: state.svg || "" }}
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm">
          <div className="text-white font-semibold mb-2">
            {tOr("results.title", "Chart Summary")}
          </div>
          <ul className="space-y-1">
            {state.summary &&
              Object.entries(state.summary).map(([k, v]) => (
                <li
                  key={k}
                  className="grid grid-cols-[1fr_auto] gap-3 border-b border-white/5 py-1"
                >
                  <span className="text-slate-400 break-words">{k}</span>
                  <span className="text-slate-200 break-words text-right">
                    {String(v)}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Link
          href="/create"
          className="inline-flex rounded-full bg-indigo-500 px-4 py-2 text-slate-950 font-semibold hover:bg-indigo-400"
        >
          {tOr(
            "profile.results.preview.actions.openCreate",
            "Open in Create"
          )}
        </Link>
        <button
          onClick={onClear}
          className="inline-flex rounded-full border border-white/10 px-4 py-2 text-slate-200 hover:border-white/20"
        >
          {tOr("profile.results.preview.actions.clear", "Clear saved chart")}
        </button>
      </div>
    </Container>
  );
}
