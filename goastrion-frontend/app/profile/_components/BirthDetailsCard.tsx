// goastrion-frontend/app/profile/_components/BirthDetailsCard.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/app/lib/i18n";
import { getActive, type SavedChart } from "@/app/lib/chartStore";
import { loadCreateState, type PersistedCreateState } from "@/app/lib/birthState";

type BirthSource =
  | Pick<SavedChart, "name" | "dob" | "tob" | "place" | "tzId">
  | Pick<PersistedCreateState, "name" | "dob" | "tob" | "place" | "tzId">;

function pickBirth(): BirthSource | null {
  return (getActive() as BirthSource | null) ?? (loadCreateState() as BirthSource | null);
}

export default function BirthDetailsCard() {
  const { tOr } = useI18n();

  // undefined = not mounted yet (SSR + first client pass use the same markup)
  const [birth, setBirth] = useState<BirthSource | null | undefined>(undefined);

  useEffect(() => {
    // Read from client storage only after mount to avoid SSR/CSR mismatch
    setBirth(pickBirth());
  }, []);

  const Header = (
    <div className="flex items-center justify-between mb-2">
      <div className="text-white font-semibold">
        {tOr("profile.birth.title", "Birth details")}
      </div>

      {/* Keep the right side stable during hydration:
         - while birth === undefined (SSR/first client render), render a placeholder
         - once mounted, show the real action */}
      {birth ? (
        <Link href="/create" className="text-sm text-cyan-300 hover:underline">
          {tOr("profile.account.actions.editBirth", "Edit birth details")}
        </Link>
      ) : (
        <span className="text-sm text-transparent select-none">Edit</span>
      )}
    </div>
  );

  // Skeleton while hydrating (SSR markup == client first render)
  if (birth === undefined) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        {Header}
        <div className="mt-3 grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm animate-pulse">
          <div className="h-4 bg-white/10 rounded w-1/2" />
          <div className="h-4 bg-white/10 rounded w-2/3" />
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
          <div className="h-4 bg-white/10 rounded w-1/4" />
        </div>
      </div>
    );
  }

  // No saved birth details
  if (!birth) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        {Header}
        <p className="text-sm text-slate-400 mb-3">
          {tOr("profile.birth.status.missing", "Birth details missing")}
        </p>
        <Link
          href="/create"
          className="inline-flex rounded-full bg-cyan-500 px-4 py-2 text-slate-950 font-semibold hover:bg-cyan-400"
        >
          {tOr("profile.birth.add", "Add birth details")}
        </Link>
      </div>
    );
  }

  // Have details
  const name = birth.name ?? "—";
  const tzId = birth.tzId ?? "IST";
  const dob = birth.dob ?? "—";
  const tob = birth.tob ?? "—";
  const place = birth.place ?? "—";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      {Header}
      <div className="mt-3 grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <span className="text-slate-400">
            {tOr("profile.birth.name.label", "Name (optional)")}:{" "}
          </span>
          <span className="text-slate-200">{name}</span>
        </div>
        <div>
          <span className="text-slate-400">{tOr("create.dob", "Date of birth")}: </span>
          <span className="text-slate-200">{dob}</span>
        </div>
        <div>
          <span className="text-slate-400">{tOr("create.tob", "Time of birth")}: </span>
          <span className="text-slate-200">{tob}</span>
        </div>
        <div>
          <span className="text-slate-400">{tOr("create.place", "Place")}: </span>
          <span className="text-slate-200">{place}</span>
        </div>
        <div>
          <span className="text-slate-400">{tOr("create.timezone", "Timezone")}: </span>
          <span className="text-slate-200">{tzId}</span>
        </div>
      </div>
    </div>
  );
}
