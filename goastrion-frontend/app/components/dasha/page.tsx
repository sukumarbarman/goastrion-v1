// app/components/dasha/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Container from "../Container";
import { useI18n } from "../../lib/i18n";
import type { DashaTimeline } from "./types";

// Lazy-load to match usage elsewhere
const DashaSection = dynamic(() => import("./DashaSection"), { ssr: false });

// Same key used by CreateChartClient
const STORAGE_KEY = "ga_create_state_v1";

export default function DashaPageClient() {
  const { t } = useI18n();
  const [v, setV] = useState<DashaTimeline | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { vimshottari?: DashaTimeline | null };
      if (saved?.vimshottari && Array.isArray(saved.vimshottari.mahadashas)) {
        setV(saved.vimshottari);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          {t("dasha.sectionTitle")}
        </h1>
        <p className="mt-1 text-slate-400">
          {t("dasha.subtitle") ?? "Your Vimshottari Mahadasha & Antardasha timeline"}
        </p>
      </div>

      {!v ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-slate-200">
          {t("dasha.noData") ?? "No timeline found. Please generate a chart first on the Create page."}
          <div className="mt-3">
            <Link
              href="/create"
              className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm hover:border-white/20"
            >
              {t("dasha.backToCreate") ?? "Go to Create"}
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-visible">
          <DashaSection v={v} />
        </div>
      )}
    </Container>
  );
}
