//goastrion-frontend/app/profile/_components/ChartSummaryPreview.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/app/lib/i18n";
import { loadCreateState, clearCreatePreview } from "@/app/lib/birthState";

export default function ChartSummaryPreview() {
  const { tOr } = useI18n();
  const [state, setState] = useState(() => loadCreateState());

  if (!state || (!state.svg && !state.summary)) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="text-white font-semibold mb-2">{tOr("profile.results.preview.title", "Chart & Summary")}</div>
        <p className="text-sm text-slate-400">{tOr("profile.results.preview.empty", "Generate your chart to see a preview.")}</p>
        <div className="mt-3"><Link href="/create" className="inline-flex rounded-full bg-cyan-500 px-4 py-2 text-slate-950 font-semibold hover:bg-cyan-400">{tOr("profile.results.preview.actions.openCreate", "Open in Create")}</Link></div>
      </div>
    );
  }

  const onClear = () => {
    clearCreatePreview();
    setState(loadCreateState());
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-white font-semibold">{tOr("profile.results.preview.title", "Chart & Summary")}</div>
        <div className="text-xs text-slate-400">{tOr("profile.results.preview.meta.lastSaved", "Last saved: {datetime}").replace("{datetime}", state?.savedAt ? new Date(state.savedAt).toLocaleString() : "—")}</div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-3">
        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
          <div className="w-full max-w-[min(92vw,520px)] mx-auto" dangerouslySetInnerHTML={{ __html: state?.svg || "" }} />
        </div>

        <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm">
          <div className="text-white font-semibold mb-2">{tOr("results.title", "Chart Summary")}</div>
          <ul className="space-y-1">
            {state?.summary && Object.entries(state.summary).map(([k, v]) => (
              <li key={k} className="grid grid-cols-[1fr_auto] gap-3 border-b border-white/5 py-1">
                <span className="text-slate-400 break-words">{k}</span>
                <span className="text-slate-200 break-words text-right">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Link href="/create" className="inline-flex rounded-full bg-indigo-500 px-4 py-2 text-slate-950 font-semibold hover:bg-indigo-400">{tOr("profile.results.preview.actions.openCreate", "Open in Create")}</Link>
        <button onClick={onClear} className="inline-flex rounded-full border border-white/10 px-4 py-2 text-slate-200 hover:border-white/20">{tOr("profile.results.preview.actions.clear", "Clear saved chart")}</button>
      </div>
    </div>
  );
}
