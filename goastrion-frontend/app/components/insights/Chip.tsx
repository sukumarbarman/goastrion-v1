"use client";
export default function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 mr-2 mb-2">
      {children}
    </span>
  );
}