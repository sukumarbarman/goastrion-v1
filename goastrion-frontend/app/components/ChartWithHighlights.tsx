// app/shubhdin/ShubhDinClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import ShubhDinInline from "../components/shubhdin/ShubhDinInline";
import { useI18n } from "../lib/i18n";

type TzId = "IST" | "UTC";
const STORAGE_KEY = "ga_create_state_v1";
type ViewMode = "all" | "single";

export default function ShubhDinClient() {
  const { t } = useI18n();
  const tf = (k: string, fb: string) => (t(k) === k ? fb : t(k));

  const [tzId, setTzId] = useState<TzId>("IST");
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);

  const [view, setView] = useState<ViewMode>("all");
  const [goal, setGoal] = useState<string>("job_change");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const st = JSON.parse(raw) as { tzId?: TzId; lat?: string; lon?: string };
      if (st.tzId === "UTC" || st.tzId === "IST") setTzId(st.tzId);
      if (st.lat) setLat(Number(st.lat));
      if (st.lon) setLon(Number(st.lon));
    } catch { /* ignore */ }
  }, []);

  const nowUtcIso = useMemo(() => new Date().toISOString(), []);
  const ready = lat !== null && lon !== null;

  const GOALS: Array<{ value: string; label: string; help: string }> = [
    {
      value: "job_change",
      label: tf("sd.goals.job_change", "Job change"),
      help:  tf("sd.goalHelp.job_change", "Target interview/offer windows; polish résumé and schedule calls."),
    },
    {
      value: "promotion",
      label: tf("sd.goals.promotion", "Promotion"),
      help:  tf("sd.goalHelp.promotion", "Propose raises or new responsibilities; performance reviews land better."),
    },
    {
      value: "business_start",
      label: tf("sd.goals.business_start", "Business start"),
      help:  tf("sd.goalHelp.business_start", "Green lights to register, launch, or sign the first paying clients."),
    },
    {
      value: "business_expand",
      label: tf("sd.goals.business_expand", "Business expand"),
      help:  tf("sd.goalHelp.business_expand", "Windows to hire, open a branch, add products, or scale capacity."),
    },
    {
      value: "startup",
      label: tf("sd.goals.startup", "Startup"),
      help:  tf("sd.goalHelp.startup", "Good moments to prototype, pitch investors, or apply to incubators/grants."),
    },
    {
      value: "property",
      label: tf("sd.goals.property", "Property / Home"),
      help:  tf("sd.goalHelp.property", "Better days for site visits, booking, loan processing, or registration."),
    },
    {
      value: "marriage",
      label: tf("sd.goals.marriage", "Marriage"),
      help:  tf("sd.goalHelp.marriage", "Supportive dates for engagement, wedding plans, and family discussions."),
    },
    {
      value: "new_relationship",
      label: tf("sd.goals.new_relationship", "New relationship"),
      help:  tf("sd.goalHelp.new_relationship", "Warm social openings for meeting, dating, and commitment talks."),
    },
  ];

  const selected = GOALS.find((g) => g.value === goal);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-white">
          {tf("sd.title", "ShubhDin — Smart Windows")}
        </h1>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-slate-300">
            {tf("sd.view.label", "View")}
          </label>

          <select
            className="rounded bg-black/20 border border-white/10 px-2 py-1 text-xs text-slate-200"
            value={view}
            onChange={(e) => setView(e.target.value as ViewMode)}
            aria-label={tf("sd.view.aria", "Select view mode")}
          >
            <option value="all">{tf("sd.view.all", "All goals")}</option>
            <option value="single">{tf("sd.view.single", "Single goal")}</option>
          </select>

          {view === "single" && (
            <div className="flex items-center gap-2">
              <select
                className="rounded bg-black/20 border border-white/10 px-2 py-1 text-xs text-slate-200"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                aria-label={tf("sd.goal.aria", "Select goal")}
              >
                {GOALS.map((g) => (
                  <option key={g.value} value={g.value} title={g.help}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {view === "single" && selected && (
        <p
          className="mt-1 text-xs text-slate-300"
          aria-live="polite"
          data-testid="goal-help"
        >
          {selected.help}
        </p>
      )}

      {!ready ? (
        <div className="text-slate-300">
          {tf(
            "sd.prompt_fill_create",
            "Please fill the Create tab first so we can read your lat/lon/tz from the saved state."
          )}
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
