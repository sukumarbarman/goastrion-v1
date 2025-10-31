"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Container from "../Container";
import { useI18n } from "../../lib/i18n";
import type { DashaTimeline } from "./types";

const DashaSection = dynamic(() => import("./DashaSection"), { ssr: false });

const STORAGE_KEY = "ga_create_state_v1";

// 🕒 Helper for DOB + TOB
function formatDobTime(dob?: string, tob?: string, tzId?: string) {
  if (!dob) return "";
  try {
    const dateObj = new Date(`${dob}T${tob || "00:00"}`);
    const local = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(dateObj);
    const tzLabel = tzId ? ` (${tzId})` : "";
    return `${local}${tzLabel}`;
  } catch {
    return `${dob}${tob ? `, ${tob}` : ""}${tzId ? ` (${tzId})` : ""}`;
  }
}

export default function DashaPageClient() {
  const { t } = useI18n();

  // ✅ Safe fallback translation helper
  const tOr = (key: string, fallback: string) => {
    const out = t(key);
    return out === key ? fallback : out;
  };

  const [data, setData] = useState<{
    name?: string;
    dob?: string;
    tob?: string;
    tzId?: string;
    vimshottari?: DashaTimeline | null;
  } | null>(null);

  const [timeline, setTimeline] = useState<DashaTimeline | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      setData(saved);

      if (saved?.vimshottari && Array.isArray(saved.vimshottari.mahadashas)) {
        setTimeline(saved.vimshottari);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const name = data?.name || "";
  const dobLine = useMemo(() => {
    if (!data?.dob) return "";
    const formatted = formatDobTime(data.dob, data.tob, data.tzId);
    return `DOB: ${formatted}`;
  }, [data]);

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          {tOr("dasha.sectionTitle", "Vimshottari — Timeline")}
        </h1>

        {/* 👇 Display Name and DOB always */}
        <div className="mt-2 text-xs md:text-sm text-slate-400 leading-relaxed">
          <p>Name: {name || "___"}</p>
          {dobLine && <p>{dobLine}</p>}
        </div>

        <p className="mt-3 text-slate-400">
          {tOr(
            "dasha.subtitle",
            "Your Vimshottari Mahadasha & Antardasha timeline"
          )}
        </p>
      </div>

      {!timeline ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-slate-200">
          {tOr(
            "dasha.noData",
            "No timeline found. Please generate a chart first on the Create page."
          )}
          <div className="mt-3">
            <Link
              href="/create"
              className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm hover:border-white/20"
            >
              {tOr("dasha.backToCreate", "Go to Create")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-visible">
          <DashaSection v={timeline} />
        </div>
      )}
    </Container>
  );
}
