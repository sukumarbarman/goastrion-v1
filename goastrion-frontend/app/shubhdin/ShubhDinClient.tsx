"use client";

import { useEffect, useMemo, useState } from "react";
import ShubhDinInline from "../components/shubhdin/ShubhDinInline";
import { useI18n } from "../lib/i18n";

type TzId = "IST" | "UTC";
const STORAGE_KEY = "ga_create_state_v1";
type ViewMode = "all" | "single";

export default function ShubhDinClient() {
  const { t, get } = useI18n();
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
    } catch {
      /* ignore */
    }
  }, []);

  const nowUtcIso = useMemo(() => new Date().toISOString(), []);
  const ready = lat !== null && lon !== null;

  // Build GOALS with localized labels + localized one-liner tooltips. Memoize on locale changes.
  const GOALS = useMemo(
    () =>
      ([
        { value: "job_change",       label: tf("sd.goals.job_change", "Job change") },
        { value: "promotion",        label: tf("sd.goals.promotion", "Promotion") },
        { value: "business_start",   label: tf("sd.goals.business_start", "Business start") },
        { value: "business_expand",  label: tf("sd.goals.business_expand", "Business expand") },
        { value: "startup",          label: tf("sd.goals.startup", "Startup") },
        { value: "property",         label: tf("sd.goals.property", "Property / Home") },
        { value: "marriage",         label: tf("sd.goals.marriage", "Marriage") },
        { value: "new_relationship", label: tf("sd.goals.new_relationship", "New relationship") },
      ] as Array<{ value: string; label: string; help?: string }>).map((g) => ({
        ...g,
        help:
          (get(`goalHelp.${g.value}`) as string | undefined) ??
          ({
            job_change: "Target interview/offer windows; polish résumé and schedule calls.",
            promotion: "Propose raises or new responsibilities; performance reviews land better.",
            business_start: "Green lights to register, launch, or sign the first paying clients.",
            business_expand: "Windows to hire, open a branch, add products, or scale capacity.",
            startup: "Good moments to prototype, pitch investors, or apply to incubators/grants.",
            property: "Better days for site visits, booking, loan processing, or registration.",
            marriage: "Supportive dates for engagement, wedding plans, and family discussions.",
            new_relationship: "Warm social openings for meeting, dating, and commitment talks.",
          } as Record<string, string>)[g.value],
      })),
    [t, get] // recompute when locale/dict changes
  );

  // Help text for currently selected goal (single view)
  const currentHelp =
    (get(`goalHelp.${goal}`) as string | undefined) ||
    GOALS.find((g) => g.value === goal)?.help;

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

      {view === "single" && currentHelp && (
        <p className="mb-3 text-xs text-slate-300">{currentHelp}</p>
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
          // removed unsupported props: variant, displayMode
          goal={view === "single" ? goal : undefined}
        />
      )}
    </div>
  );
}
