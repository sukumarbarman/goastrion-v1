//goastrion-frontend/app/components/ConsentBanner.tsx
"use client";

import { useEffect, useState } from "react";

type ConsentValue = "granted" | "denied";
type ConsentUpdate = {
  ad_storage?: ConsentValue;
  ad_user_data?: ConsentValue;
  ad_personalization?: ConsentValue;
  analytics_storage?: ConsentValue;
};

// local helper (kept as-is)
function gtagPush(...args: unknown[]) {
  const w = window as Window & { dataLayer?: unknown[] };
  if (!Array.isArray(w.dataLayer)) w.dataLayer = [];
  w.dataLayer.push(args);
}

export default function ConsentBanner() {
  const [open, setOpen] = useState(false);

  /* ---------------- Restore consent on page load ---------------- */
  useEffect(() => {
    const decided = localStorage.getItem("ga_consent_decided");

    if (decided === "accept") {
      gtagPush("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted",
      });
    } else if (decided === "deny") {
      gtagPush("consent", "update", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "granted",
      });
    } else {
      setOpen(true);
    }
  }, []);

  /* ---------------- Handlers ---------------- */
  function allowAds() {
    const payload: ConsentUpdate = {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    };

    gtagPush("consent", "update", payload);
    localStorage.setItem("ga_consent_decided", "accept");
    setOpen(false);
  }

  function denyAds() {
    const payload: ConsentUpdate = {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
    };

    gtagPush("consent", "update", payload);
    localStorage.setItem("ga_consent_decided", "deny");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] mx-auto max-w-4xl rounded-t-xl border border-white/10 bg-slate-900/95 p-4 backdrop-blur">
      <p className="text-sm text-slate-200">
        We use cookies for analytics and relevant ads. You can accept or reject ad
        cookies at any time.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={allowAds}
          className="rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600"
        >
          Accept
        </button>

        <button
          onClick={denyAds}
          className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
        >
          Reject
        </button>

        <a
          href="/privacy"
          className="ml-auto text-sm text-slate-300 underline"
        >
          Privacy Policy
        </a>
      </div>
    </div>
  );
}
