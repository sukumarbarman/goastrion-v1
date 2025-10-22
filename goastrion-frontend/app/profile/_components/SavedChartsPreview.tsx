// goastrion-frontend/app/profile/_components/SavedChartsPreview.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/app/lib/i18n";
import { useAuth } from "@/app/context/AuthContext";
import { apiGet, ApiError } from "@/app/lib/apiClient";
import * as store from "@/app/lib/chartStore";

type ServerSavedChart = {
  id: number;
  name: string | null;
  birth_datetime: string; // UTC ISO
  latitude: number;
  longitude: number;
  timezone: string;
  place: string | null;
  created_at: string; // UTC ISO
};

function getHttpStatus(err: unknown): number | undefined {
  if (err instanceof ApiError) return err.status;
  if (typeof err === "object" && err !== null && "status" in err) {
    const s = (err as { status?: unknown }).status;
    return typeof s === "number" ? s : undefined;
  }
  return undefined;
}

export default function SavedChartsPreview() {
  const { tOr } = useI18n();
  const { accessToken, refreshAccess } = useAuth();

  // Fallback to local store when logged out
  const local3 = useMemo(() => store.list().slice(0, 3), []);

  const [rows, setRows] = useState<ServerSavedChart[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!accessToken) {
      setRows(null); // will show local fallback
      return;
    }
    setLoading(true);
    try {
      const data = await apiGet<ServerSavedChart[]>("/api/astro/charts/", accessToken);
      const top3 = [...(Array.isArray(data) ? data : [])]
        .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
        .slice(0, 3);
      setRows(top3);
    } catch (e) {
      const status = getHttpStatus(e);
      if (status === 401) {
        const nxt = await refreshAccess();
        if (nxt) {
          const data2 = await apiGet<ServerSavedChart[]>("/api/astro/charts/", nxt);
          const top3 = [...(Array.isArray(data2) ? data2 : [])]
            .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
            .slice(0, 3);
          setRows(top3);
        } else {
          setRows(null);
        }
      } else {
        setRows(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const rerun = () => void load();

    // Optimistic append for instant UI
    const onAppend = (ev: Event) => {
      const ce = ev as CustomEvent<ServerSavedChart>;
      if (!ce || typeof ce !== "object" || !("detail" in ce)) return;
      const c = ce.detail;
      if (!c) return;
      setRows(prev => {
        const next = prev ? [c, ...prev] : [c];
        const dedup = new Map(next.map(x => [x.id, x]));
        return [...dedup.values()]
          .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
          .slice(0, 3);
      });
    };

    window.addEventListener("charts:refresh", rerun);
    window.addEventListener("charts:append", onAppend);

    return () => {
      window.removeEventListener("charts:refresh", rerun);
      window.removeEventListener("charts:append", onAppend);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const title = tOr("profile.saved.title", "Saved charts");
  const seeAll = tOr("common.seeAll", "See all");
  const empty = tOr("profile.saved.empty", "No saved charts yet.");
  const manage = tOr("common.manage", "Manage");
  const openCreate = tOr("profile.results.preview.actions.openCreate", "Open in Create");

  const showRows = rows ?? null;
  const fallbackRows = !rows && !accessToken ? local3 : [];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between">
        <div className="text-white font-semibold">{title}</div>
        <Link href="/profile/charts" className="text-sm text-cyan-300 hover:underline">
          {seeAll}
        </Link>
      </div>

      {loading ? (
        <div className="mt-2 text-sm text-slate-400">Loading…</div>
      ) : showRows && showRows.length > 0 ? (
        <ul className="mt-3 divide-y divide-white/5">
          {showRows.map(c => (
            <li key={c.id} className="py-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-slate-200 font-medium truncate">
                  {c.name || c.place || "Unnamed Chart"}
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(c.created_at).toLocaleString()}
                </div>
              </div>
              <Link href="/profile/charts" className="text-sm text-cyan-300 hover:underline">
                {manage}
              </Link>
            </li>
          ))}
        </ul>
      ) : fallbackRows.length > 0 ? (
        <ul className="mt-3 divide-y divide-white/5">
          {fallbackRows.map(x => (
            <li key={x.id} className="py-2 flex items-center justify-between gap-3">
              <div>
                <div className="text-slate-200 font-medium">
                  {x.name || `${x.place} · ${x.dob}`}
                </div>
                <div className="text-xs text-slate-400">
                  {tOr("saved.item.updated", "Updated {datetime}")
                    .replace("{datetime}", new Date(x.updatedAt).toLocaleString())}
                </div>
              </div>
              <Link href="/profile/charts" className="text-sm text-cyan-300 hover:underline">
                {manage}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 text-sm text-slate-400">
          {empty}
          <div className="mt-2">
            <Link
              href="/create"
              className="inline-flex rounded-full bg-cyan-500 px-3 py-1.5 text-slate-950 font-semibold hover:bg-cyan-400"
            >
              {openCreate}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
