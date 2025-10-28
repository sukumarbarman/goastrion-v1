// app/components/daily/DailyClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import DailyResults, { type DailyPayload } from "./DailyResults";
import { loadBirth } from "@/app/lib/birthStore";
import { useI18n } from "@/app/lib/i18n";

type TimeWindow = { start: string; end: string; reason?: string | null };
type WindowsBlock = {
  best?: TimeWindow | null;
  green?: TimeWindow[];
  caution?: TimeWindow[];
  panchang?: {
    rahu?: { start?: string; end?: string };
    yama?: { start?: string; end?: string };
    gulika?: { start?: string; end?: string };
    abhijit?: { start?: string; end?: string };
  };
};
type Remedies = { wear?: string | null };

type DailyPayloadPlus = DailyPayload & {
  headline?: string;
  headline_i18n?: string[];
  windows?: WindowsBlock;
  remedies?: Remedies;
};

type DailyApiResp = DailyPayloadPlus & { error?: string };

type BirthLike = {
  datetime?: string;
  tz?: string;
  lat?: number;
  lon?: number;
  name?: string;
  label?: string;
  profileName?: string;
  fullName?: string;
  title?: string;
  person?: { name?: string | null } | null;
};

// Prefer absolute base for local dev (NEXT_PUBLIC_API_BASE), otherwise rely on nginx proxy (/api/*) in prod
const PUBLIC_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");
const DAILY_ENDPOINT = PUBLIC_BASE ? `${PUBLIC_BASE}/api/v1/daily` : "/api/v1/daily";

/** Safe JSON parse that returns null on failure or non-JSON text */
function parseJsonSafe<T>(text: string): T | null {
  const trimmed = text.trim();
  if (!trimmed || !(trimmed.startsWith("{") || trimmed.startsWith("["))) return null;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
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
  const { t, locale } = useI18n();

  const [mounted, setMounted] = useState(false);
  const [birth, setBirth] = useState<BirthLike | null>(null);

  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<DailyPayloadPlus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Abort in-flight fetches if component unmounts or deps change
  const abortRef = useRef<AbortController | null>(null);

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

    // Cancel any previous request
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);
    setPayload(null);

    try {
      const url = `${DAILY_ENDPOINT}?locale=${encodeURIComponent(locale)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale, // optional; backend also reads ?locale=
        },
        body: JSON.stringify({
          datetime: birth.datetime,
          lat: birth.lat,
          lon: birth.lon,
          tz: birth.tz,
          persona: "manager",
        }),
        cache: "no-store",
        signal: ac.signal,
      });

      // Safe JSON parse (avoid "Unexpected token <" when an HTML error page comes back)
      const text = await res.text();
      const data = parseJsonSafe<DailyApiResp>(text) ?? ({} as DailyApiResp);

      if (!res.ok) {
        const snippet = text ? text.slice(0, 160) : "";
        const msg = data.error || `HTTP ${res.status}${snippet ? ` — ${snippet}` : ""}`;
        throw new Error(msg);
      }

      // In rare case of empty JSON body on success, surface a friendly error
      if (!data || Object.keys(data).length === 0) {
        throw new Error(t("daily.ui.errorGeneric"));
      }

      setPayload(data);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : t("daily.ui.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!mounted || !birth?.datetime) return;
    void fetchToday();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, birth?.datetime, birth?.lat, birth?.lon, birth?.tz, locale]);

  if (!mounted) {
    return (
      <div className="grid gap-8">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              {t("daily.title")}
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-400">{t("daily.subtitle")}</p>
            <p className="mt-1 text-xs md:text-sm text-slate-400">{t("daily.ui.dobLabel")}: —</p>
            <p className="mt-1 text-xs md:text-sm text-slate-400">Date: —</p>
          </div>
        </header>
        <div className="grid gap-6">
          <SkeletonCard />
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

  return (
    <div className="grid gap-8" aria-busy={loading}>
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">{t("daily.title")}</h2>
          <p className="mt-2 text-sm md:text-base text-slate-400">{t("daily.subtitle")}</p>
          <p className="mt-1 text-xs md:text-sm text-slate-400" title={`UTC: ${formatDobUTC(birth.datetime)}`}>
            {dobLine}
          </p>
          <p className="mt-1 text-xs md:text-sm text-slate-400">{todayLine}</p>
        </div>
      </header>

      {/* Main content only */}
      <div className="grid gap-4">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchToday}
              disabled={loading}
              className="rounded-full border border-red-500/30 px-3 py-1 text-red-100 hover:border-red-400/50 disabled:opacity-60"
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
    </div>
  );
}
