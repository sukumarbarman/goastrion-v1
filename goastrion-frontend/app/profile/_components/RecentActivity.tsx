//goastrion-frontend/app/profile/_components/RecentActivity.tsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { list } from "@/app/lib/history";
import { useI18n } from "@/app/lib/i18n";

export default function RecentActivity() {
  const { tOr } = useI18n();
  const items = useMemo(() => list().slice(0, 5), []);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between">
        <div className="text-white font-semibold">{tOr("profile.history.title", "Recent activity")}</div>
        <Link href="/profile/history" className="text-sm text-cyan-300 hover:underline">{tOr("common.seeAll", "See all")}</Link>
      </div>
      {!items.length ? (
        <div className="mt-2 text-sm text-slate-400">{tOr("history.empty", "No recent activity yet")}</div>
      ) : (
        <ul className="mt-3 space-y-1 text-sm">
          {items.map((x) => (
            <li key={x.id} className="flex items-center justify-between gap-3 border-b border-white/5 py-1">
              <span className="text-slate-200">{x.title}</span>
              <span className="text-slate-400 text-xs">{new Date(x.ts).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
