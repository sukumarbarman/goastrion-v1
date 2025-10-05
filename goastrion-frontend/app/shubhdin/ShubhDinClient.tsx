// app/shubhdin/ShubhDinClient.tsx
"use client";

import { useEffect, useState } from "react";
import ShubhDinResults, { ShubhDinResponse } from "../components/ShubhDinResults";

type TzId = "IST" | "UTC";
const STORAGE_KEY = "ga_create_state_v1";
const TZ_HOURS: Record<TzId, number> = { IST: 5.5, UTC: 0 };

function localCivilToUtcIso(dob: string, tob: string, tzId: TzId) {
  const [Y, M, D] = dob.split("-").map(Number);
  const [h, m] = tob.split(":").map(Number);
  const ms = Date.UTC(Y, (M ?? 1) - 1, D ?? 1, (h ?? 0), (m ?? 0)) - (TZ_HOURS[tzId] ?? 0) * 3600_000;
  return new Date(ms).toISOString();
}

export default function ShubhDinClient() {
  const [data, setData] = useState<ShubhDinResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    try {
      setErr(null);
      setLoading(true);
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) throw new Error("Please fill the Create tab first.");

      const st = JSON.parse(raw) as {
        dob?: string; tob?: string; tzId?: TzId; lat?: string; lon?: string;
      };
      if (!st.dob || !st.tob || !st.tzId || !st.lat || !st.lon) {
        throw new Error("Missing birth details. Re-generate your chart.");
      }

      const dtIsoUtc = localCivilToUtcIso(st.dob, st.tob, st.tzId);
      const tz = st.tzId === "IST" ? "Asia/Kolkata" : "UTC";

      const resp = await fetch("/api/shubhdin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: dtIsoUtc,
          lat: Number(st.lat),
          lon: Number(st.lon),
          tz,
          horizon_months: 18,
        }),
      });

      if (!resp.ok) throw new Error(await resp.text());
      setData(await resp.json());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to run ShubhDin.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { run(); }, []); // auto-run; or remove and render a "Run" button

  if (loading) return <div className="text-slate-300">Running ShubhDin…</div>;
  if (err) return <div className="text-rose-300">Error: {err}</div>;
  if (!data) return null;
  return <ShubhDinResults data={data} />;
}
