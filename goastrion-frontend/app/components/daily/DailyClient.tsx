// app/components/daily/DailyClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DailyResults, { type DailyPayload } from "./DailyResults";
import { loadBirth } from "@/app/lib/birthStore";
import { useI18n } from "@/app/lib/i18n";

type TimeWindow = { start: string; end: string; reason?: string | null };
type WindowsBlock = {
  best?: TimeWindow | null;
  green?: TimeWindow[];
  caution?: TimeWindow[];
};
type Remedies = { wear?: string | null };

type DailyPayloadPlus = DailyPayload & {
  headline?: string;
  headline_i18n?: string[];
  windows?: WindowsBlock;
  remedies?: Remedies;
};

type BirthLike = {
  datetime?: string;
  tz?: string;
  lat?: number;
  lon?: number;
  // optional name-y fields we might have stored
  name?: string;
  label?: string;
  profileName?: string;
  fullName?: string;
  title?: string;
  person?: { name?: string | null } | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

/* dash helper to render clean en-dashes */
function dash(str?: string, ascii = false) {
  if (!str) return "";
  return ascii ? str.replace(/\u2013|\u2014|\u2212/g, "-") : str.replace(/-/g, "–");
}

function formatDobLocal(dtISO: string, tz?: string) {
  try {
    const dt = new Date(dtISO);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: tz || "UTC",
    }).format(dt);
  } catch {
    return dtISO;
  }
}

function formatDobUTC(dtISO: string) {
  try {
    const dt = new Date(dtISO);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    }).format(dt);
  } catch {
    return dtISO;
  }
}

/** Always-English date like "22 Oct 2025" (no localization) */
function formatDateEnglish(dt: Date, tz?: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      timeZone: tz || undefined,
    }).format(dt);
  } catch {
    return dt.toISOString().slice(0, 10);
  }
}

/** Try to pull a displayable name from the birth object (supports multiple shapes) */
function getBirthName(birth: BirthLike | null | undefined): string {
  const name =
    birth?.name ??
    birth?.label ??
    birth?.profileName ??
    birth?.fullName ??
    birth?.title ??
    birth?.person?.name ??
    "";
  return (typeof name === "string" ? name : "").trim();
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${className}`}>
      <div className="h-4 w-40 bg-white/10 rounded mb-3" />
      <div className="h-3 w-full bg-white/5 rounded mb-2" />
      <div className="h-3 w-3/5 bg-white/5 rounded" />
    </div>
  );
}

export default function DailyClient() {
  const { t, tx, locale } = useI18n();

  const [mounted, setMounted] = useState(false);
  const [birth, setBirth] = useState<BirthLike | null>(null);

  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<DailyPayloadPlus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const b = loadBirth();
    setBirth((b as unknown as BirthLike) || null);
  }, []);

  const dobLine = useMemo(() => {
    if (!birth?.datetime) return "";
    const local = formatDobLocal(birth.datetime, birth.tz);
    const tzLabel = birth.tz ? ` (${birth.tz})` : " (UTC)";
    const name = getBirthName(birth);
    const namePart = name ? `${name} — ` : "";
    return `${t("daily.ui.dobLabel")}: ${namePart}${local}${tzLabel}`;
  }, [birth, t]);

  // Force English date string (e.g., "22 Oct 2025"), still respecting birth.tz for day boundary
  const todayLine = useMemo(() => {
    const tz = birth?.tz;
    const today = new Date();
    return `Date: ${formatDateEnglish(today, tz)}`;
  }, [birth]);

  async function fetchToday() {
    if (!birth?.datetime || typeof birth.lat !== "number" || typeof birth.lon !== "number" || !birth.tz) {
      setError(t("daily.missingBirth.title"));
      return;
    }
    setLoading(true);
    setError(null);
    setPayload(null);
    try {
      const url = `${API_BASE}/api/v1/daily?locale=${encodeURIComponent(locale)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({
          datetime: birth.datetime,
          lat: birth.lat,
          lon: birth.lon,
          tz: birth.tz,
          persona: "manager",
        }),
      });
      const data: DailyPayloadPlus & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setPayload(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("daily.ui.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!mounted || !birth?.datetime) return;
    void fetchToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, birth?.datetime, locale]); // refetch if language changes

  // Prefer backend's structured headline_i18n if present; fall back to plain string
  const headlineText = useMemo(() => {
    if (!payload) return loading ? t("daily.ui.loading") : "—";
    if (payload.headline) return payload.headline;
    const parts = payload.headline_i18n ?? [];
    if (Array.isArray(parts) && parts.length) {
      return parts.map(tx).filter(Boolean).join(" ; ");
    }
    return "—";
  }, [payload, tx, t, loading]);

  // ------------------ render ------------------

  if (!mounted) {
    return (
      <div className="grid gap-8">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              {t("daily.title")}
            </h2>
            {/* subtitle directly after title */}
            <p className="mt-2 text-sm md:text-base text-slate-400">{t("daily.subtitle")}</p>
            <p className="mt-1 text-xs md:text-sm text-slate-400">{t("daily.ui.dobLabel")}: —</p>
            <p className="mt-1 text-xs md:text-sm text-slate-400">Date: —</p>
          </div>
        </header>
        <div className="grid lg:grid-cols-3 gap-6">
          <SkeletonCard className="lg:col-span-2" />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!birth?.datetime) {
    return (
      <div className="grid gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">{t("daily.title")}</h2>
          {/* subtitle directly after title */}
          <p className="mt-2 text-sm md:text-base text-slate-400">{t("daily.subtitle")}</p>
          <p className="mt-1 text-xs md:text-sm text-slate-400">{t("daily.ui.dobLabel")}: —</p>
          <p className="mt-1 text-xs md:text-sm text-slate-400">Date: —</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-white font-semibold text-lg mb-1">{t("daily.missingBirth.title")}</div>
          <p className="text-slate-300">
            {t("daily.missingBirth.desc")}{" "}
            <Link href="/create" className="text-cyan-300 hover:text-cyan-200 underline">
              {t("daily.missingBirth.cta")}
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  const best = payload?.windows?.best ?? null;
  const green: TimeWindow[] = payload?.windows?.green ?? [];
  const caution: TimeWindow[] = payload?.windows?.caution ?? [];
  const wear = payload?.remedies?.wear ?? null;

  return (
    <div className="grid gap-8">
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">{t("daily.title")}</h2>

          {/* subtitle directly after title */}
          <p className="mt-2 text-sm md:text-base text-slate-400">{t("daily.subtitle")}</p>

          {/* then DOB and Date */}
          <p
            className="mt-1 text-xs md:text-sm text-slate-400"
            title={`UTC: ${formatDobUTC(birth.datetime)}`}
          >
            {dobLine}
          </p>
          <p className="mt-1 text-xs md:text-sm text-slate-400">{todayLine}</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={fetchToday}
                className="rounded-full border border-red-500/30 px-3 py-1 text-red-100 hover:border-red-400/50"
              >
                {t("daily.ui.tryAgain")}
              </button>
            </div>
          )}

          {payload ? (
            <DailyResults data={payload} dobLine={dobLine} />
          ) : (
            <div className="grid gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.02] p-5">
            <div className="text-sm text-slate-300 mb-2">{t("daily.ui.headline")}</div>
            <div className="text-slate-100 font-medium">{headlineText}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.02] p-5">
            <div className="text-sm text-slate-300 mb-2">{t("daily.ui.windowsToday")}</div>

            {best?.start && best?.end ? (
              <div className="mb-3">
                <div className="text-xs text-slate-400 mb-1">{t("daily.ui.best")}</div>
                <div className="text-slate-50 font-medium">
                  {dash(best.start)} – {dash(best.end)}
                </div>
                {best.reason && <div className="text-xs text-slate-400 mt-0.5">{dash(best.reason)}</div>}
              </div>
            ) : (
              <div className="text-slate-400 text-sm mb-3">{t("daily.ui.best")}: —</div>
            )}

            <div className="text-xs text-slate-400 mb-1">{t("daily.ui.green")}</div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {green.map((w, i) => (
                <span
                  key={`g-${i}`}
                  className="rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 px-2 py-0.5"
                >
                  {dash(w.start)} – {dash(w.end)}
                </span>
              ))}
              {!green.length && <span className="text-slate-500">—</span>}
            </div>

            <div className="text-xs text-slate-400 mb-1">{t("daily.ui.caution")}</div>
            <div className="flex flex-wrap gap-1.5">
              {caution.map((w, i) => (
                <span
                  key={`c-${i}`}
                  className="rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-200 px-2 py-0.5"
                >
                  {dash(w.start)} – {dash(w.end)}
                </span>
              ))}
              {!caution.length && <span className="text-slate-500">—</span>}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.02] p-5">
            <div className="text-sm text-slate-300 mb-2">{t("daily.ui.wear")}</div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3.5 w-3.5 rounded-full border"
                style={{ background: "#fff3", borderColor: "#fff4" }}
                title={wear || undefined}
              />
              <div className="text-slate-100">{wear || "—"}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
