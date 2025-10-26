// app/shubhdin/page.tsx
"use client";

import Container from "@/app/components/Container";
import ShubhDinClient from "./ShubhDinClient";
import { useI18n } from "@/app/lib/i18n";
import { Suspense } from "react";

export default function Page() {
  const { t } = useI18n();
  const tOr = (k: string, fb: string) => (t(k) === k ? fb : t(k));

  return (
    <Container>
      <div className="px-4 md:px-6 pt-6">
        {/* Always-visible heading */}
        <header className="mb-4" aria-labelledby="sd-h1">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 border border-cyan-400/40 px-3 py-1 text-cyan-100 text-xs font-medium">
            {tOr("home.shubhdin.badge", "Next 2 yrs")}
          </div>

          <h1 id="sd-h1" className="mt-2 text-2xl md:text-3xl font-semibold text-white">
            {tOr("sd.page.title", "ShubhDin — Next 2 yrs")}
          </h1>

          <p className="mt-2 text-slate-300">
            {tOr(
              "sd.page.sub",
              "Pick the right month, not just a date — data-backed Vedic windows for promotions, job change, property, marriage and more."
            )}
          </p>
        </header>

        {/* Protect body with Suspense so we never show a blank area */}
        <Suspense
          fallback={<div className="text-slate-300">Loading…</div>}
        >
          <ShubhDinClient />
        </Suspense>
      </div>
    </Container>
  );
}
