// goastrion-frontend/app/profile/_components/BirthDetailsCard.tsx
"use client";

import Link from "next/link";
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
  const b = pickBirth();

  if (!b) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="text-white font-semibold mb-2">
          {tOr("profile.birth.title", "Birth details")}
        </div>
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

  const name = b.name ?? "—";
  const tzId = b.tzId ?? "IST";
  const dob = b.dob ?? "—";
  const tob = b.tob ?? "—";
  const place = b.place ?? "—";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between">
        <div className="text-white font-semibold">
          {tOr("profile.birth.title", "Birth details")}
        </div>
        <Link href="/create" className="text-sm text-cyan-300 hover:underline">
          {tOr("profile.account.actions.editBirth", "Edit birth details")}
        </Link>
      </div>
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
