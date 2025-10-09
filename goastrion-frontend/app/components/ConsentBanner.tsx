"use client";

import { useEffect, useState } from "react";

type ConsentValue = "granted" | "denied";
type ConsentUpdate = {
  ad_storage?: ConsentValue;
  ad_user_data?: ConsentValue;
  ad_personalization?: ConsentValue;
  analytics_storage?: ConsentValue;
};

// local helper: no global Window augmentation
function gtagPush(...args: unknown[]) {
  const w = window as Window & { dataLayer?: unknown[] };
  if (!Array.isArray(w.dataLayer)) w.dataLayer = [];
  w.dataLayer.push(args);
}

export default function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const decided = typeof window !== "undefined" && localStorage.getItem("ga_consent_decided");
    if (!decided) setOpen(true);
  }, []);

  function allowAds() {
    const payload: ConsentUpdate = {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    };
    gtagPush("consent", "update", payload);
    localStorage.setItem("ga_consent_decided", "accept");
    setOpen(false);
  }

  function denyAds() {
    localStorage.setItem("ga_consent_decided", "deny");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-4xl rounded-t-xl border border-white/10 bg-slate-900/95 p-4 backdrop-blur">
      <p className="text-sm text-slate-200">
        We use cookies for analytics and to show ads. Granting consent may improve ad relevance.
      </p>
      <div className="mt-3 flex gap-2">
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
        <a href="/privacy" className="ml-auto text-sm text-slate-300 underline">
          Privacy Policy
        </a>
      </div>
    </div>
  );
}
