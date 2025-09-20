// app/components/hooks/useInsights.ts
"use client";
import { useEffect, useState } from "react";
import { fetchInsights, type InsightsResponse } from "../api/insightsClient";

type InsightsInput = {
  datetime: string;
  lat: number;
  lon: number;
  tz_offset_hours?: number;
};

export function useInsights(input: InsightsInput) {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Destructure to avoid referencing `input` in the effect body
  const { datetime, lat, lon, tz_offset_hours } = input;

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const req: InsightsInput = { datetime, lat, lon, tz_offset_hours };

    fetchInsights(req)
      .then((r) => { if (mounted) setData(r); })
      .catch((e) => { if (mounted) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [datetime, lat, lon, tz_offset_hours]);

  return { data, error, loading };
}
