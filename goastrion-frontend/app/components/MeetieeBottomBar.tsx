"use client";

import { useEffect, useState } from "react";

export default function MeetieeBottomBar() {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  // ---------------- Day / Night Logic ----------------
  const hour = new Date().getHours();
  const isNight = hour >= 19 || hour < 6;

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

  // ---------------- Visibility Logic ----------------
  useEffect(() => {
    const dismissed = localStorage.getItem("meetiee_bar_dismissed");
    if (!dismissed) {
      const t = setTimeout(() => {
        setVisible(true);
        requestAnimationFrame(() => setAnimate(true));
      }, 6000); // show after 6s
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="
        fixed z-50 pointer-events-none
        bottom-0 inset-x-0
        lg:bottom-1/2 lg:inset-x-auto lg:right-4 lg:translate-y-1/2
      "
    >
      <div
        className={`
          pointer-events-auto
          max-w-xl lg:max-w-sm
          mx-3 lg:mx-0 mb-3 lg:mb-0
          rounded-xl border border-indigo-500/30
          bg-[#0B1020]/95 backdrop-blur
          px-4 py-3 shadow-xl
          transform transition-all duration-500 ease-out
          ${
            animate
              ? "translate-y-0 opacity-100 lg:translate-x-0"
              : "translate-y-8 opacity-0 lg:translate-x-8 lg:translate-y-0"
          }
        `}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="text-sm leading-snug">
            <div className="text-indigo-400 text-xs font-semibold mb-1">
              {copy.badge}
            </div>

            <div className="text-slate-100 font-medium">
              {copy.title}
            </div>

            <div className="text-slate-400">
              {copy.body}
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.setItem("meetiee_bar_dismissed", "1");
              setAnimate(false);
              setTimeout(() => setVisible(false), 300);
            }}
            className="text-slate-400 hover:text-slate-200 text-lg"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>

        <a
          href="https://meetiee.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="
            mt-3 inline-flex w-full items-center justify-center
            rounded-md bg-indigo-600 px-4 py-2
            text-sm font-medium text-white
            hover:bg-indigo-500 transition
          "
        >
          {copy.cta}
        </a>
      </div>
    </div>
  );
}
