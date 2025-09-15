// app/components/HighlightController.tsx
"use client";

type Props = {
  onClear: () => void;
  activeCount: number;
};

export default function HighlightController({ onClear, activeCount }: Props) {
  return (
    <div className="mt-3 flex items-center justify-between">
      <div className="text-xs text-slate-300">
        {activeCount > 0 ? `${activeCount} highlighted` : "No highlights"}
      </div>
      <button
        onClick={onClear}
        className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10"
      >
        Clear highlights
      </button>
    </div>
  );
}
