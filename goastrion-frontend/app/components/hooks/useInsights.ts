// app/components/hooks/useInsights.ts
"use client";

import { useEffect, useState } from "react";
import { fetchInsights, type InsightsPayload } from "../api/insightsClient";

type InsightsInput = {
  datetime: string;
  lat: number;
  lon: number;
  /** Optional legacy offset (hours). We map this to an IANA tz for the API. */
  tz_offset_hours?: number;
};

/** Minimal mapping: prefer IST; otherwise fall back to UTC */
function offsetToIana(offset?: number): string {
  if (typeof offset !== "number") return "Asia/Kolkata"; // default for your app
  if (Math.abs(offset - 5.5) < 1e-6) return "Asia/Kolkata";
  if (Math.abs(offset - 0) < 1e-6) return "UTC";
  return "UTC";
}

export function useInsights(input: InsightsInput) {
  const [data, setData] = useState<InsightsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { datetime, lat, lon, tz_offset_hours } = input;

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const tz = offsetToIana(tz_offset_hours);

    fetchInsights({ datetime, lat, lon, tz })
      .then((r) => { if (mounted) setData(r); })
      .catch((e) => { if (mounted) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [datetime, lat, lon, tz_offset_hours]);

  return { data, error, loading };
}
