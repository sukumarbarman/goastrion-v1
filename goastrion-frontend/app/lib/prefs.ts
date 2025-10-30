//goastrion-frontend/app/lib/prefs.ts
"use client";

export type Landing = "daily" | "profile";
export type TimeFormat = "12h" | "24h";
export type DateFormat = "DD-MM-YYYY" | "YYYY-MM-DD";

export type Prefs = {
  locale?: string;
  landing?: Landing;
  timeFormat?: TimeFormat;
  dateFormat?: DateFormat;
  dailyReminder?: boolean;
};

const KEY = "ga_prefs_v1";

function canUseLS() { return typeof window !== "undefined"; }

export function loadPrefs(): Prefs {
  if (!canUseLS()) return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Prefs) : {};
  } catch {
    return {};
  }
}

export function savePrefs(next: Prefs) {
  if (!canUseLS()) return false;
  try {
    const cur = loadPrefs();
    localStorage.setItem(KEY, JSON.stringify({ ...cur, ...next }));
    return true;
  } catch {
    return false;
  }
}
