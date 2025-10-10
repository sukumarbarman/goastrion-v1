"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries } from "./locales/dictionaries";

/** Base types */
type Dictionaries = typeof dictionaries;
type Locale = keyof Dictionaries;
type KeyArgs = Record<string, string | number>;
type ServerKey = { key: string; args?: KeyArgs };

/** Public context shape */
type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;

  /** translate by string key */
  t: (key: string, vars?: KeyArgs) => string;

  /** translate with inline fallback if key missing */
  tOr: (key: string, fallback: string, vars?: KeyArgs) => string;

  /** translate server objects like { key, args } */
  tx: (entry: string | ServerKey) => string;

  /** raw access (object/array/string/number) */
  get: (key: string) => unknown;

  /** expose the active dictionary */
  dict: Dictionaries[Locale];
};

/** Defaults */
const FALLBACK_LOCALE: Locale = "en";

const I18nCtx = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (k) => k,
  tOr: (_k, fb) => fb,
  tx: (e) => (typeof e === "string" ? e : e.key),
  get: () => undefined,
  dict: dictionaries.en,
});

/** Utility: robust path resolver with array-index support (e.g. "a.b.0.c") */
function getPath(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  const parts = path.split(".");
  for (const part of parts) {
    if (cur == null) return undefined;

    if (Array.isArray(cur)) {
      const idx = Number(part);
      if (!Number.isInteger(idx) || idx < 0 || idx >= cur.length) return undefined;
      cur = cur[idx];
      continue;
    }

    if (typeof cur === "object" && part in (cur as Record<string, unknown>)) {
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
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ga_locale") as Locale | null;
      if (saved && saved in dictionaries) setLocale(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ga_locale", locale);
    } catch {}
  }, [locale]);

  /** Active + fallback dicts */
  const dict = dictionaries[locale] ?? dictionaries[FALLBACK_LOCALE];
  const fallbackDict = dictionaries[FALLBACK_LOCALE];

  /** Resolve key to string (with fallback locale and final key echo if missing) */
  const resolveToString = (key: string): string => {
    const localVal = getPath(dict, key);
    if (typeof localVal === "string") return localVal;

    const fbVal = getPath(fallbackDict, key);
    if (typeof fbVal === "string") return fbVal;

    // last resort: echo the key
    return key;
  };

  /** t(): translate key -> string (+ interpolate) */
  const t = useMemo(() => {
    return (key: string, vars?: KeyArgs) => interpolate(resolveToString(key), vars);
  }, [dict]);

  /** tOr(): translate or use caller's fallback string */
  const tOr = useMemo(() => {
    return (key: string, fallback: string, vars?: KeyArgs) => {
      const localVal = getPath(dict, key);
      const str =
        typeof localVal === "string"
          ? localVal
          : (typeof getPath(fallbackDict, key) === "string"
              ? (getPath(fallbackDict, key) as string)
              : fallback);
      return interpolate(str, vars);
    };
  }, [dict]);

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
      if (localVal !== undefined) return localVal;
      return getPath(fallbackDict, key);
    };
  }, [dict]);

  return (
    <I18nCtx.Provider value={{ locale, setLocale, t, tOr, tx, get, dict }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useI18n() {
  return useContext(I18nCtx);
}
