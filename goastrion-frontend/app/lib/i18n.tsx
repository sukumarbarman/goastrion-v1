// goastrion-frontend/app/lib/i18n.tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries } from "./locales/dictionaries";

/** Dictionaries + Locale types */
export type Dictionaries = typeof dictionaries;
export type Locale = keyof Dictionaries; // "en" | "hi" | "bn" | "ta" | "te" | "kn" | "es" | "pt" | "fr"
type KeyArgs = Record<string, string | number>;
type ServerKey = { key: string; args?: KeyArgs };

/** Single source of truth for supported locales + labels */
export const SUPPORTED_LOCALES: ReadonlyArray<Locale> = [
  "en",
  "hi",
  "bn",
  "ta",
  "te",
  "kn",
  "es",
  "pt",
  "fr",
] as const;

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  bn: "বাংলা",
  ta: "தமிழ்",
  te: "తెలుగు",
  kn: "ಕನ್ನಡ",
  es: "Español",
  pt: "Português",
  fr: "Français",
} as const;

/** RTL helpers (kept generic if you add Arabic/Hebrew later) */
export const isRtl = (l: string) => ["ar", "fa", "he", "ur"].some((x) => l?.toLowerCase().startsWith(x));
export const dirFor = (l: string) => (isRtl(l) ? "rtl" : "ltr");

/** Clamp any incoming string to a valid Locale */
export function clampLocale(input: string | null | undefined): Locale {
  return (input && SUPPORTED_LOCALES.includes(input as Locale) ? (input as Locale) : DEFAULT_LOCALE);
}

/** Try to match an arbitrary BCP-47 tag to a supported Locale */
function matchSupportedLocale(tag: string | null | undefined): Locale | null {
  if (!tag) return null;
  const lc = tag.toLowerCase();

  // 1) exact match
  const exact = SUPPORTED_LOCALES.find((l) => l.toLowerCase() === lc);
  if (exact) return exact;

  // 2) base-language match (e.g., fr-CA -> fr, es-419 -> es)
  const base = lc.split("-")[0];
  const baseHit = SUPPORTED_LOCALES.find((l) => l.toLowerCase() === base);
  if (baseHit) return baseHit;

  return null;
}

/** Resolve initial locale on client: localStorage -> <html lang> -> navigator.languages -> DEFAULT */
function resolveInitialLocale(): Locale {
  try {
    // localStorage
    const saved = localStorage.getItem("ga_locale");
    if (saved) {
      const clamped = clampLocale(saved);
      if (clamped) return clamped;
    }

    // <html lang>
    const htmlLang = typeof document !== "undefined" ? document.documentElement.getAttribute("lang") : null;
    const fromHtml = matchSupportedLocale(htmlLang);
    if (fromHtml) return fromHtml;

    // Browser preference list
    if (typeof navigator !== "undefined") {
      const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]).filter(Boolean);
      for (const lang of langs) {
        const hit = matchSupportedLocale(lang);
        if (hit) return hit;
      }
    }
  } catch {
    /* noop */
  }
  return DEFAULT_LOCALE;
}

/** Public context shape */
type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: KeyArgs) => string;
  tOr: (key: string, fallback: string, vars?: KeyArgs) => string;
  tx: (entry: string | ServerKey) => string;
  get: (key: string) => unknown;
  dict: Dictionaries[Locale];
  dir: "ltr" | "rtl";
};

const I18nCtx = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (k) => k,
  tOr: (_k, fb) => fb,
  tx: (e) => (typeof e === "string" ? e : e.key),
  get: () => undefined,
  dict: dictionaries[DEFAULT_LOCALE],
  dir: "ltr",
});

/** Robust path resolver with array-index support (e.g. "a.b.0.c") */
function getPath(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const part of path.split(".")) {
    if (cur == null) return undefined;
    if (Array.isArray(cur)) {
      const idx = Number(part);
      if (!Number.isInteger(idx) || idx < 0 || idx >= cur.length) return undefined;
      cur = cur[idx];
    } else if (typeof cur === "object" && part in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return cur;
}

/** Interpolates {placeholders} with provided vars */
function interpolate(template: string, vars?: KeyArgs) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : `{${k}}`
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, _setLocale] = useState<Locale>(DEFAULT_LOCALE);

  // Resolve initial locale on mount (client)
  useEffect(() => {
    const initial = resolveInitialLocale();
    _setLocale(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist locale + sync across tabs
  useEffect(() => {
    try {
      localStorage.setItem("ga_locale", locale);
    } catch {}
  }, [locale]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ga_locale" && typeof e.newValue === "string") {
        const next = clampLocale(e.newValue);
        _setLocale(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Keep <html dir> and <html lang> in sync
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("dir", dirFor(locale));
      document.documentElement.setAttribute("lang", locale);
    }
  }, [locale]);

  // Guard before setting
  const setLocale = (l: Locale) => _setLocale(clampLocale(l));

  /** Active + fallback dicts */
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  const fallbackDict = dictionaries[DEFAULT_LOCALE];

  /** Resolve key → string with fallback, else echo key */
  const resolveToString = useMemo(() => {
    return (key: string): string => {
      const localVal = getPath(dict, key);
      if (typeof localVal === "string") return localVal;
      const fbVal = getPath(fallbackDict, key);
      if (typeof fbVal === "string") return fbVal;
      return key;
    };
  }, [dict, fallbackDict]);

  /** t(): translate key -> string (+ interpolate) */
  const t = useMemo(() => {
    return (key: string, vars?: KeyArgs) => interpolate(resolveToString(key), vars);
  }, [resolveToString]);

  /** tOr(): translate or use caller's fallback string */
  const tOr = useMemo(() => {
    return (key: string, fallback: string, vars?: KeyArgs) => {
      const localVal = getPath(dict, key);
      const fbVal = getPath(fallbackDict, key);
      const str =
        typeof localVal === "string"
          ? (localVal as string)
          : typeof fbVal === "string"
          ? (fbVal as string)
          : fallback;
      return interpolate(str, vars);
    };
  }, [dict, fallbackDict]);

  /** tx(): translate server object { key, args } or raw string key */
  const tx = useMemo(() => {
    return (entry: string | ServerKey) => {
      if (typeof entry === "string") return t(entry);
      const { key, args } = entry || {};
      if (!key) return "";
      return t(key, args);
    };
  }, [t]);

  /** get(): raw fetch (object/array/string/number) with fallback locale */
  const get = useMemo(() => {
    return (key: string) => {
      const localVal = getPath(dict, key);
      return localVal !== undefined ? localVal : getPath(fallbackDict, key);
    };
  }, [dict, fallbackDict]);

  const dir = dirFor(locale);

  return (
    <I18nCtx.Provider value={{ locale, setLocale, t, tOr, tx, get, dict, dir }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useI18n() {
  return useContext(I18nCtx);
}
