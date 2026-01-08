//goastrion-frontend/app/components/MeetieeBottomBar.tsx
"use client";

import { useEffect, useState } from "react";

export default function MeetieeBottomBar() {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isNight, setIsNight] = useState<boolean | null>(null);

  /* ------------------ CLIENT-ONLY TIME LOGIC ------------------ */
  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour >= 19 || hour < 6);
  }, []);

  /* ------------------ VISIBILITY LOGIC ------------------ */
  useEffect(() => {
    if (isNight === null) return;

    const dismissedAt = localStorage.getItem("meetiee_bar_dismissed");
    if (dismissedAt && Date.now() - Number(dismissedAt) < 86400000) return;

    const timer = setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => setAnimate(true));
    }, 5000);

    return () => clearTimeout(timer);
  }, [isNight]);

  if (!visible || isNight === null) return null;

  return (
    <>
      {/* ---------------- DESKTOP : RIGHT FLOAT WITH SOFT PULSE ---------------- */}
      <div className="hidden md:block fixed right-4 bottom-24 z-50 pointer-events-none">
        <div
          className={`
            pointer-events-auto w-[360px]
            rounded-2xl border border-indigo-500/20
            bg-gradient-to-br from-[#0B1020]/95 via-[#111837]/95 to-[#0B1020]/95
            backdrop-blur-xl
            shadow-[0_20px_60px_-20px_rgba(99,102,241,0.35)]
            transition-all duration-700 ease-out
            ${animate ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
          `}
        >
          {/* Soft pulse glow */}
          <div
            className={`
              absolute inset-0 rounded-2xl
              ${animate ? "animate-meetiee-glow" : ""}
              pointer-events-none
            `}
          />

          <div className="relative p-5 space-y-3">
            <div className="text-xs uppercase tracking-wider text-indigo-400">
              Sponsored
            </div>

            <div className="text-lg font-semibold text-slate-100 leading-snug">
              Meetiee — AI-powered Personal Assistant
            </div>

            <div className="text-sm text-slate-400">
              Smart reminders, follow-ups, and gentle nudges — exactly when they
              matter.
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://meetiee.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  rounded-full bg-gradient-to-r from-indigo-600 to-violet-600
                  px-5 py-2 text-sm font-semibold text-white
                  shadow-md shadow-indigo-500/30
                  hover:scale-[1.04] transition
                "
              >
                ✨ Try Meetiee Free
              </a>

              <button
                onClick={() => {
                  localStorage.setItem(
                    "meetiee_bar_dismissed",
                    Date.now().toString()
                  );
                  setAnimate(false);
                  setTimeout(() => setVisible(false), 400);
                }}
                className="text-slate-500 hover:text-slate-300 text-lg"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- MOBILE : COMPACT & CALM ---------------- */}
      <div className="md:hidden fixed bottom-4 inset-x-0 z-50 flex justify-center pointer-events-none">
        <div
          className={`
            pointer-events-auto w-[92%]
            rounded-xl border border-indigo-500/20
            bg-[#0B1020]/95 backdrop-blur
            px-4 py-3
            transition-all duration-500
            ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
          `}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-indigo-400 font-medium">
                Meetiee — AI Personal Assistant
              </div>
              <div className="text-sm text-slate-100">
                Smart reminders, right on time
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://meetiee.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white"
              >
                Try
              </a>

              <button
                onClick={() => {
                  localStorage.setItem(
                    "meetiee_bar_dismissed",
                    Date.now().toString()
                  );
                  setAnimate(false);
                  setTimeout(() => setVisible(false), 300);
                }}
                className="text-slate-400 text-lg"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
