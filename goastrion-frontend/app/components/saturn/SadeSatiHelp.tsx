"use client";

import { useState } from "react";

export default function SadeSatiHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        ❓ What is Sade Sati?
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/60"
            aria-hidden="true"
          />
          <div
            className="relative max-w-lg w-full rounded-2xl border border-white/10 bg-[#0B1022] p-5 text-slate-200 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold text-lg">Sade Sati — quick guide</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-white/10 px-2 py-1 text-slate-300 hover:bg-white/5"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm leading-6">
              <p>
                Sade Sati is when <b>Saturn</b> transits the <b>12th, 1st, and 2nd sidereal signs</b> from your
                <b> natal Moon’s sign</b>. We use sidereal (Lahiri) longitudes.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><b>Start</b> (12th from Moon): prepare/declutter/close loops.</li>
                <li><b>Peak</b> (on Moon): prioritize essentials & routines.</li>
                <li><b>End</b> (2nd from Moon): rebuild reserves & boundaries.</li>
              </ul>
              <p className="text-slate-300">
                <b>Stations</b> → decisions stick; go slow; avoid rushed brand-new contracts.<br />
                <b>Retro overlaps</b> → best for reviews, audits, refactors, renegotiations.
              </p>
              <p className="text-slate-400">
                Daily labels are sampled at local noon for stability. For exact ingress minutes, use a finer scan.
              </p>
              <a
                href="/docs/sade-sati.md"
                className="inline-flex text-cyan-300 hover:text-cyan-200 underline decoration-dotted"
              >
                Read the full reference →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
