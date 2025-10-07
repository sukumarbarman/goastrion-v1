// app/components/PrintButton.tsx
"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-white/20"
      title="Print or save as PDF"
    >
      ⬇️ Download PDF
    </button>
  );
}
