// app/components/hooks/useInsights.ts
"use client";
import { useEffect, useState } from "react";
import { fetchInsights, type InsightsResponse } from "../api/insightsClient";

export function useInsights(input: { datetime: string; lat: number; lon: number; tz_offset_hours?: number }) {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchInsights(input)
      .then((r) => { if (mounted) setData(r); })
      .catch((e) => { if (mounted) setError(e.message); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [input.datetime, input.lat, input.lon, input.tz_offset_hours]);

  return { data, error, loading };
}
