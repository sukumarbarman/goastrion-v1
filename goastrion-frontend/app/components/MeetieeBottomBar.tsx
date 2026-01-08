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

  const copy = isNight
    ? {
        badge: "Sponsored • Night Focus",
        title: "End your day calmly",
        body: "Meetiee gently reminds you at the right moment.",
        cta: "Try Meetiee Free",
      }
    : {
        badge: "Sponsored • Smart Timing",
        title: "Perfect timing matters",
        body: "Meetiee AI ensures you never miss the right moment.",
        cta: "Try Meetiee Free",
      };

  return (
    <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center pointer-events-none">
      <div
        className={`
          pointer-events-auto w-[95%] max-w-5xl
          rounded-2xl border border-indigo-500/20
          bg-gradient-to-br from-[#0B1020]/95 via-[#111837]/95 to-[#0B1020]/95
          backdrop-blur-xl
          shadow-[0_0_50px_-15px_rgba(99,102,241,0.45)]
          transition-all duration-1000 ease-out
          ${animate
            ? "opacity-100 translate-y-0 scale-100 blur-0"
            : "opacity-0 translate-y-10 scale-[0.97] blur-md"}
        `}
      >
        {/* -------- DESKTOP VERSION -------- */}
        <div className="hidden md:flex items-center justify-between px-6 py-4 gap-6">
          <div>
            <div className="text-xs uppercase tracking-wider text-indigo-400 mb-1">
              {copy.badge}
            </div>

            <div className="text-lg font-semibold text-slate-100">
              {copy.title}
            </div>

            <div className="text-sm text-slate-400 max-w-2xl">
              {copy.body}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://meetiee.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                rounded-full bg-gradient-to-r from-indigo-600 to-violet-600
                px-6 py-2 text-sm font-semibold text-white
                shadow-lg shadow-indigo-500/30
                hover:scale-[1.05] hover:shadow-indigo-500/50
                transition
              "
            >
              ✨ {copy.cta}
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
              className="text-slate-500 hover:text-slate-300 text-xl"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>

        {/* -------- MOBILE COMPACT VERSION -------- */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 gap-3">
          <div>
            <div className="text-xs text-indigo-400 font-medium">
              {copy.badge}
            </div>
            <div className="text-sm text-slate-100 font-medium">
              {copy.title}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://meetiee.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                rounded-full bg-indigo-600 px-4 py-1.5
                text-xs font-semibold text-white
                shadow-md
              "
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
                setTimeout(() => setVisible(false), 400);
              }}
              className="text-slate-400 text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
