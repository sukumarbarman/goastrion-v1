// app/profile/_components/ProfileAutoSelect.tsx
"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { apiGet } from "@/app/lib/apiClient";
import * as store from "@/app/lib/chartStore";

// SAME storage key the Create page uses
const CREATE_STORAGE_KEY = "ga_create_state_v1";

type ServerChart = {
  id: number;
  name: string | null;
  birth_datetime: string;  // UTC ISO
  latitude: number;
  longitude: number;
  timezone: string;        // e.g. "Asia/Kolkata"
  place: string | null;
  created_at: string;      // UTC ISO
};

// Convert IANA → tzId used in Create
function ianaToTzId(iana?: string) {
  if (!iana) return "UTC";
  return /kolkata|calcutta/i.test(iana) ? "IST" : "UTC";
}

// Derive local DOB/TOB strings from UTC + IANA
function splitToLocalDobTob(utcIso: string, iana: string) {
  const d = new Date(utcIso);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: iana || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
  const dob = `${parts.year}-${parts.month}-${parts.day}`; // YYYY-MM-DD
  const tob = `${parts.hour}:${parts.minute}`; // HH:MM
  return { dob, tob };
}

function applyServerChartToOverview(c: ServerChart) {
  const tzId = ianaToTzId(c.timezone);
  const { dob, tob } = splitToLocalDobTob(c.birth_datetime, c.timezone);

  const payload = {
    name: c.name || undefined,
    dob,
    tob,
    tzId,
    place: c.place || "",
    lat: String(c.latitude),
    lon: String(c.longitude),
    svg: null,
    summary: null,
    vimshottari: null,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(CREATE_STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

export default function ProfileAutoSelect() {
  const { accessToken } = useAuth();

  useEffect(() => {
    // If Overview already has something to show, don’t override
    try {
      const active = store.getActive?.();
      const createRaw = localStorage.getItem(CREATE_STORAGE_KEY);
      if (active || createRaw) return;
    } catch {}

    let cancelled = false;

    async function run() {
      // Prefer the most-recent server chart if logged in
      if (accessToken) {
        try {
          const rows = await apiGet<ServerChart[]>("/api/astro/charts/", accessToken);
          if (Array.isArray(rows) && rows.length) {
            const latest = [...rows].sort(
              (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
            )[0];
            if (!cancelled) applyServerChartToOverview(latest);
            return;
          }
        } catch {
          /* ignore and fall back to local */
        }
      }

      // Fallback to first local chart if present (local store uses lat/lon)
      try {
        const locals = store.list?.() || [];
        if (locals.length) {
          const x = locals[0];
          const payload = {
            name: x.name || undefined,
            dob: x.dob || "",
            tob: x.tob || "",
            tzId: x.tzId || "IST",
            place: x.place || "",
            lat: String(x.lat ?? ""), // ✔ use local store shape
            lon: String(x.lon ?? ""), // ✔ use local store shape
            svg: null,
            summary: null,
            vimshottari: null,
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem(CREATE_STORAGE_KEY, JSON.stringify(payload));
        }
      } catch {}
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return null;
}
