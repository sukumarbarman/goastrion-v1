// app/shubhdin/ShubhDinClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import ShubhDinInline from "../components/shubhdin/ShubhDinInline";



type TzId = "IST" | "UTC";
const STORAGE_KEY = "ga_create_state_v1";

export default function ShubhDinClient() {  // ← removed : JSX.Element
  const [tzId, setTzId] = useState<TzId>("IST");
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);

  const [view, setView] = useState<"all" | "single">("all");
  const [goal, setGoal] = useState<string>("job_change");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const st = JSON.parse(raw) as { tzId?: TzId; lat?: string; lon?: string };
      if (st.tzId === "UTC" || st.tzId === "IST") setTzId(st.tzId);
      if (st.lat) setLat(Number(st.lat));
      if (st.lon) setLon(Number(st.lon));
    } catch {/* ignore */}
  }, []);

  const nowUtcIso = useMemo(() => new Date().toISOString(), []);
  const ready = lat !== null && lon !== null;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-white">ShubhDin — Smart Windows</h1>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-slate-300">View</label>
          <select
            className="rounded bg-black/20 border border-white/10 px-2 py-1 text-xs text-slate-200"
            value={view}
            onChange={(e) => setView(e.target.value as "all" | "single")}
          >
            <option value="all">All goals</option>
            <option value="single">Single goal</option>
          </select>

          {view === "single" && (
            <select
              className="rounded bg-black/20 border border-white/10 px-2 py-1 text-xs text-slate-200"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              aria-label="Goal"
            >
              <option value="job_change">Job change</option>
              <option value="promotion">Promotion</option>
              <option value="business_start">Business start</option>
              <option value="business_expand">Business expand</option>
              <option value="startup">Startup</option>
              <option value="property">Property / Home</option>
              <option value="marriage">Marriage</option>
              <option value="new_relationship">New relationship</option>
            </select>
          )}
        </div>
      </div>

      {!ready ? (
        <div className="text-slate-300">
          Please fill the <span className="font-semibold">Create</span> tab first so we can read your{" "}
          <code className="px-1 rounded bg-white/10">lat/lon/tz</code> from the saved state.
        </div>
      ) : (
        <ShubhDinInline
          datetime={nowUtcIso}
          lat={lat!}
          lon={lon!}
          tzId={tzId}
          horizonMonths={18}
          variant="smart"
          displayMode={view}
          goal={view === "single" ? goal : undefined}
        />
      )}
    </div>
  );
}
