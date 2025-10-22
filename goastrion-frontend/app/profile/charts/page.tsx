// app/profile/charts/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { apiGet, apiDelete, ApiError } from "@/app/lib/apiClient";
import * as store from "@/app/lib/chartStore";

// SAME storage key the Create page uses
const CREATE_STORAGE_KEY = "ga_create_state_v1";

type ServerChart = {
  id: number;
  name: string | null;
  birth_datetime: string;  // UTC ISO
  latitude: number;
  longitude: number;
  timezone: string;        // IANA
  place: string | null;
  created_at: string;      // UTC ISO
};

function ianaToTzId(iana?: string) {
  if (!iana) return "UTC";
  return /kolkata|calcutta/i.test(iana) ? "IST" : "UTC";
}

function splitToLocalDobTob(utcIso: string, iana: string) {
  const d = new Date(utcIso);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: iana || "UTC",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]));
  const dob = `${parts.year}-${parts.month}-${parts.day}`;
  const tob = `${parts.hour}:${parts.minute}`;
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
  try { localStorage.setItem(CREATE_STORAGE_KEY, JSON.stringify(payload)); } catch {}

  // Optional: also tell chartStore if you expose such API
  try {
    // store.setActive?.({ ...payload });
  } catch {}
}

export default function SavedChartsPage() {
  const { accessToken, refreshAccess } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ServerChart[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Local (logged-out) fallback (local store uses: lat/lon as strings)
  const localCharts = useMemo(() => store.list(), []);

  async function fetchServerCharts(tok: string) {
    const data = await apiGet<ServerChart[]>("/api/astro/charts/", tok);
    return [...(Array.isArray(data) ? data : [])].sort(
      (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
    );
  }

  async function load() {
    setError(null);
    if (!accessToken) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchServerCharts(accessToken);
      setRows(data);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        const nxt = await refreshAccess();
        if (nxt) {
          const data2 = await fetchServerCharts(nxt);
          setRows(data2);
        } else {
          setRows([]);
        }
      } else {
        setRows([]);
        setError("Couldn’t load charts.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const rerun = () => load();
    window.addEventListener("charts:refresh", rerun);
    return () => window.removeEventListener("charts:refresh", rerun);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const onOpen = () => {
    if (!selectedId) return;
    const found = rows.find(r => r.id === selectedId);
    if (found) {
      applyServerChartToOverview(found);
      router.push("/profile"); // jump to Overview
      return;
    }
    // Logged out: open local selection (index-based id)
    const local = localCharts.find((_, idx) => idx + 1 === selectedId);
    if (local) {
      const payload = {
        name: local.name || undefined,
        dob: local.dob || "",
        tob: local.tob || "",
        tzId: local.tzId || "IST",
        place: local.place || "",
        lat: String(local.lat ?? ""), // ✅ local shape
        lon: String(local.lon ?? ""), // ✅ local shape
        svg: null,
        summary: null,
        vimshottari: null,
        savedAt: new Date().toISOString(),
      };
      try { localStorage.setItem(CREATE_STORAGE_KEY, JSON.stringify(payload)); } catch {}
      router.push("/profile");
    }
  };

  const onDelete = async (id: number) => {
    if (!accessToken) return;
    try {
      await apiDelete(`/api/astro/charts/${id}/`, accessToken);
      setRows(prev => prev.filter(x => x.id !== id));
      if (selectedId === id) setSelectedId(null);
      // Let previews refresh
      window.dispatchEvent(new Event("charts:refresh"));
    } catch {
      setError("Couldn’t delete chart.");
    }
  };

  const hasServer = accessToken && rows.length > 0;
  const useLocal = !accessToken && localCharts.length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="py-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Saved Charts</h1>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#141A2A] p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-white text-lg font-semibold">Your Saved Charts</h3>
          <Link href="/create" className="rounded-full bg-cyan-500 px-4 py-2 text-slate-950 font-semibold hover:bg-cyan-400">
            Create new
          </Link>
        </div>

        {error && <div className="mt-3 text-sm text-rose-300">{error}</div>}
        {loading && <div className="mt-3 text-sm text-slate-400">Loading…</div>}

        {/* Server charts (logged in) */}
        {hasServer && (
          <ul className="mt-4 divide-y divide-white/10">
            {rows.map((c) => (
              <li key={c.id} className="py-3 flex items-center gap-3">
                <input
                  type="radio"
                  name="selected-chart"
                  className="accent-cyan-500 shrink-0"
                  checked={selectedId === c.id}
                  onChange={() => setSelectedId(c.id)}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-slate-200 font-medium truncate">
                    {c.name || c.place || "Unnamed chart"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(c.created_at).toLocaleString()} · {c.timezone} · ({c.latitude}, {c.longitude})
                  </div>
                </div>
                <button
                  onClick={() => onDelete(c.id)}
                  className="text-xs rounded-full border border-white/10 px-3 py-1 text-slate-300 hover:border-white/20"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Local charts (logged out) */}
        {useLocal && (
          <ul className="mt-4 divide-y divide-white/10">
            {localCharts.map((x, idx) => (
              <li key={x.id ?? idx} className="py-3 flex items-center gap-3">
                <input
                  type="radio"
                  name="selected-local"
                  className="accent-cyan-500 shrink-0"
                  checked={selectedId === idx + 1}
                  onChange={() => setSelectedId(idx + 1)}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-slate-200 font-medium truncate">
                    {x.name || x.place || "Unnamed chart"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {(x.updatedAt ? new Date(x.updatedAt) : new Date()).toLocaleString()} · {x.tzId || "IST"} · ({x.lat}, {x.lon})
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && !hasServer && !useLocal && (
          <div className="mt-4 text-sm text-slate-400">
            No saved charts yet.
            <div className="mt-2">
              <Link href="/create" className="inline-flex rounded-full bg-cyan-500 px-3 py-1.5 text-slate-950 font-semibold hover:bg-cyan-400">
                Create one
              </Link>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={onOpen}
            disabled={!selectedId}
            className="rounded-full bg-cyan-500 px-5 py-2.5 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-60"
          >
            Open chart
          </button>
          <Link
            href="/profile"
            className="rounded-full border border-white/10 px-5 py-2.5 text-slate-200 hover:border-white/20"
          >
            Back to Overview
          </Link>
        </div>
      </section>
    </div>
  );
}
