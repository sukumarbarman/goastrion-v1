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
  tzId?: string;
  lat?: number;
  lon?: number;
  name?: string;
  dob?: string;
  tob?: string;
  place?: string;
  label?: string;
  profileName?: string;
  fullName?: string;
  title?: string;
  person?: { name?: string | null } | null;
};

const PUBLIC_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");
const DAILY_ENDPOINT = PUBLIC_BASE ? `${PUBLIC_BASE}/api/v1/daily` : "/api/v1/daily";

function parseJsonSafe<T>(text: string): T | null {
  const trimmed = text.trim();
  if (!trimmed || !(trimmed.startsWith("{") || trimmed.startsWith("["))) return null;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
}

function formatDobUTC(dtISO: string) {
  try {
    const dt = new Date(dtISO);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(dt);
  } catch {
    return dtISO;
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
  const [payload, setPayload] = useState<DailyPayloadPlus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // ✅ Load from store + localStorage
  useEffect(() => {
    setMounted(true);
    let b: BirthLike | null = (loadBirth() as unknown as BirthLike) || null;

    try {
      const raw = localStorage.getItem("ga_create_state_v1");
      if (raw) {
        const saved = JSON.parse(raw);
        if (!b) b = {} as BirthLike;
        if (saved?.name) b.name = saved.name;
        if (saved?.dob) b.dob = saved.dob;
        if (saved?.tob) b.tob = saved.tob;
        if (saved?.tzId) b.tzId = saved.tzId;
        if (saved?.tz) b.tz = saved.tz;
        if (saved?.place) b.place = saved.place;
        if (saved?.lat) b.lat = parseFloat(saved.lat);
        if (saved?.lon) b.lon = parseFloat(saved.lon);
        if (!b.datetime && saved?.dob && saved?.tob)
          b.datetime = `${saved.dob}T${saved.tob}`;
      }
    } catch (err) {
      console.warn("Failed to parse localStorage birth data:", err);
    }

    setBirth(b);
  }, []);

  const nameLine = useMemo(() => {
    const name = getBirthName(birth);
    return `Name: ${name || "___"}`;
  }, [birth]);

  const dobLine = useMemo(() => {
    if (!birth) return "";
    const tzDisplay =
      birth.tzId && birth.tzId !== "IST" ? birth.tzId : "Asia/Kolkata";

    const formatted =
      birth.dob && birth.tob
        ? `${birth.dob.split("-").reverse().join(" ")} ${birth.tob}`
        : birth.datetime
        ? formatDobUTC(birth.datetime)
        : "—";

    return `DOB: ${formatted} (${tzDisplay})`;
  }, [birth]);

  const todayLine = useMemo(() => {
    const tz = birth?.tz;
    const today = new Date();
    return `Date: ${formatDateEnglish(today, tz)}`;
  }, [birth]);

  async function fetchToday() {
    if (
      !birth?.datetime ||
      typeof birth.lat !== "number" ||
      typeof birth.lon !== "number" ||
      !(birth.tz || birth.tzId)
    ) {
      setError(t("daily.missingBirth.title"));
      return;
    }

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
        headers: { "Content-Type": "application/json", "Accept-Language": locale },
        body: JSON.stringify({
          datetime: birth.datetime,
          lat: birth.lat,
          lon: birth.lon,
          tz: birth.tz || birth.tzId,
          persona: "manager",
        }),
        cache: "no-store",
        signal: ac.signal,
      });

      const text = await res.text();
      const data = parseJsonSafe<DailyApiResp>(text) ?? ({} as DailyApiResp);
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (!data || Object.keys(data).length === 0)
        throw new Error(t("daily.ui.errorGeneric"));
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
    return () => abortRef.current?.abort();
  }, [mounted, birth?.datetime, birth?.lat, birth?.lon, birth?.tz, locale]);

  // Skeleton before hydration
  if (!mounted) {
    return (
      <div className="grid gap-8">
        <header>
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {t("daily.title")}
          </h2>
          <p className="mt-2 text-slate-400">{t("daily.subtitle")}</p>
          <p className="mt-1 text-slate-400">Name: —</p>
          <p className="mt-1 text-slate-400">DOB: —</p>
          <p className="mt-1 text-slate-400">Date: —</p>
        </header>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!birth?.datetime) {
    return (
      <div className="grid gap-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          {t("daily.title")}
        </h2>
        <p className="mt-2 text-slate-400">{t("daily.subtitle")}</p>
        <p className="mt-1 text-slate-400">Name: —</p>
        <p className="mt-1 text-slate-400">DOB: —</p>
        <p className="mt-1 text-slate-400">Date: —</p>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-white font-semibold text-lg mb-1">
            {t("daily.missingBirth.title")}
          </div>
          <p className="text-slate-300">
            {t("daily.missingBirth.desc")}{" "}
            <Link href="/create" className="text-cyan-300 underline">
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
      <header>
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          {t("daily.title")}
        </h2>
        <p className="mt-2 text-slate-400">{t("daily.subtitle")}</p>
        <p className="mt-1 text-xs md:text-sm text-slate-400">{nameLine}</p>
        <p className="mt-1 text-xs md:text-sm text-slate-400">{dobLine}</p>
        <p className="mt-1 text-xs md:text-sm text-slate-400">{todayLine}</p>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchToday}
            disabled={loading}
            className="rounded-full border border-red-500/30 px-3 py-1 text-red-100 hover:border-red-400/50 disabled:opacity-60"
          >
            {t("daily.ui.tryAgain")}
          </button>
        </div>
      )}

      {payload ? (
        <DailyResults data={payload} dobLine={`${nameLine}\n${dobLine}`} />
      ) : (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}
    </div>
  );
}
