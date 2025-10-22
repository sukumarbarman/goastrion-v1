// app/components/SavedChartsPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import LoginModal from "@/app/components/LoginModal";
import { apiGet, apiDelete, ApiError } from "@/app/lib/apiClient";

type SavedChart = {
  id: number;
  name: string | null;
  birth_datetime: string;
  latitude: number;
  longitude: number;
  timezone: string;
  place: string | null;
  created_at: string;
};

/** Safely extract HTTP status from unknown errors */
function getStatusFromUnknown(err: unknown): number | undefined {
  if (err instanceof ApiError) return err.status;
  if (typeof err === "object" && err !== null && "status" in err) {
    const s = (err as { status?: unknown }).status;
    if (typeof s === "number") return s;
  }
  return undefined;
}

/** Augment WindowEventMap with our custom events */
declare global {
  interface WindowEventMap {
    "charts:append": CustomEvent<SavedChart>;
    "charts:refresh": Event;
  }
}

export default function SavedChartsPanel() {
  const { accessToken, refreshAccess } = useAuth();
  const [charts, setCharts] = useState<SavedChart[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");
  const [showLogin, setShowLogin] = useState(false);

  const loggedIn = !!accessToken;

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!accessToken) return;
      setLoading(true);
      setErr("");
      try {
        const data = await apiGet<SavedChart[]>("/api/astro/charts/", accessToken);
        const sorted = [...(Array.isArray(data) ? data : [])].sort(
          (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
        );
        if (alive) setCharts(sorted);
      } catch (e: unknown) {
        const status = getStatusFromUnknown(e);
        if (status === 401) {
          const nxt = await refreshAccess();
          if (nxt) {
            const data2 = await apiGet<SavedChart[]>("/api/astro/charts/", nxt);
            const sorted2 = [...(Array.isArray(data2) ? data2 : [])].sort(
              (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
            );
            if (alive) setCharts(sorted2);
          } else {
            if (alive) setErr("Please log in again.");
          }
        } else {
          if (alive) setErr(e instanceof Error ? e.message : String(e));
          if (alive) setCharts([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    const onRefresh = () => {
      void load();
    };

    const onAppend = (e: WindowEventMap["charts:append"]) => {
      const c = e.detail;
      setCharts((prev) => {
        const next = prev ? [c, ...prev] : [c];
        const dedup = new Map(next.map((x) => [x.id, x]));
        return [...dedup.values()].sort(
          (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
        );
      });
    };

    window.addEventListener("charts:refresh", onRefresh);
    window.addEventListener("charts:append", onAppend);

    return () => {
      alive = false;
      window.removeEventListener("charts:refresh", onRefresh);
      window.removeEventListener("charts:append", onAppend);
    };
  }, [accessToken, refreshAccess]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this saved chart?")) return;
    setErr("");
    try {
      if (!accessToken) throw new Error("Not authenticated");
      await apiDelete(`/api/astro/charts/${id}/`, accessToken);
      setCharts((old) => (old ? old.filter((c) => c.id !== id) : old));
    } catch (e: unknown) {
      const status = getStatusFromUnknown(e);
      if (status === 401) {
        const nxt = await refreshAccess();
        if (!nxt) {
          setErr("Please log in again.");
          return;
        }
        try {
          await apiDelete(`/api/astro/charts/${id}/`, nxt);
          setCharts((old) => (old ? old.filter((c) => c.id !== id) : old));
          return;
        } catch (ee: unknown) {
          setErr(ee instanceof Error ? ee.message : String(ee));
          return;
        }
      }
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#141A2A] p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-white text-lg font-semibold">Your Saved Charts</h3>
        {!loggedIn && (
          <button
            onClick={() => setShowLogin(true)}
            className="rounded-full bg-cyan-500 px-4 py-2 text-slate-950 font-semibold hover:bg-cyan-400"
          >
            Log in
          </button>
        )}
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {err && (
        <div className="mt-3 text-sm rounded-md bg-red-600/20 border border-red-500/40 text-red-200 px-3 py-2">
          {err}
        </div>
      )}

      {!loggedIn ? (
        <p className="mt-3 text-slate-400 text-sm">
          Log in to view and manage charts saved to your account.
        </p>
      ) : loading ? (
        <p className="mt-3 text-slate-400 text-sm">Loading…</p>
      ) : charts && charts.length > 0 ? (
        <ul className="mt-4 divide-y divide-white/10">
          {charts.map((c) => (
            <li key={c.id} className="py-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-white font-medium truncate">
                  {c.name || "Unnamed Chart"}
                </div>
                <div className="text-slate-400 text-xs mt-0.5">
                  {c.place || "—"} · {new Date(c.created_at).toLocaleString()}
                </div>
                <div className="text-slate-500 text-xs mt-0.5">
                  {c.birth_datetime} · {c.timezone} · ({c.latitude.toFixed(4)}, {c.longitude.toFixed(4)})
                </div>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="shrink-0 rounded-full border border-white/10 text-slate-200 px-3 py-1.5 hover:border-white/20 text-sm"
                title="Delete this saved chart"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-slate-400 text-sm">You haven’t saved any charts yet.</p>
      )}
    </section>
  );
}
