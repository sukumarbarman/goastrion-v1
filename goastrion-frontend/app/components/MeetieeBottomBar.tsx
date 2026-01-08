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

    const showTimer = setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => setAnimate(true));
    }, 6000);

    return () => clearTimeout(showTimer);
  }, [isNight]);

  if (!visible || isNight === null) return null;

  const copy = isNight
    ? {
        badge: "Sponsored • Night Focus",
        title: "End your day calmly. Tomorrow stays on track.",
        body: (
          <>
            GoAstrion shows the right time ahead.{" "}
            <span className="text-slate-300 font-medium">
              Meetiee AI Assistant
            </span>{" "}
            gently reminds you when it matters.
          </>
        ),
        cta: "🌙 Try Meetiee Free",
      }
    : {
        badge: "Sponsored • Smart Timing",
        title: "Perfect timing matters — even for meetings",
        body: (
          <>
            Plan your actions with GoAstrion.{" "}
            <span className="text-slate-300 font-medium">
              Meetiee AI Assistant
            </span>{" "}
            makes sure you never miss the right moment.
          </>
        ),
        cta: "Try Meetiee Free",
      };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50">
      <div
        className={`
          mx-3 mb-3 rounded-xl border border-indigo-500/30
          bg-[#0B1020]/95 backdrop-blur px-4 py-3 shadow-xl
          transform transition-all duration-500
          ${animate ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
        `}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="text-sm">
            <div className="text-indigo-400 text-xs font-semibold mb-1">
              {copy.badge}
            </div>
            <div className="text-slate-100 font-medium">{copy.title}</div>
            <div className="text-slate-400">{copy.body}</div>
          </div>

          <button
            onClick={() => {
              localStorage.setItem(
                "meetiee_bar_dismissed",
                Date.now().toString()
              );
              setAnimate(false);
              setTimeout(() => setVisible(false), 300);
            }}
            className="text-slate-400 hover:text-slate-200 text-lg"
          >
            ✕
          </button>
        </div>

        <a
          href="https://meetiee.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          {copy.cta}
        </a>
      </div>
    </div>
  );
}
