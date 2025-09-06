"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries } from "./dictionaries";

type Locale = keyof typeof dictionaries;

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const noopSetLocale = (_l: Locale) => {};

const I18nCtx = createContext<I18nContextValue>({
  locale: "en",
  setLocale: noopSetLocale,
  t: (k) => k,
});

/** Safe getter for dot-separated keys, without using `any`. */
function getPath(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const part of path.split(".")) {
    if (cur && typeof cur === "object" && part in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return cur;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Start with 'en' (same as SSR) — do NOT read localStorage here synchronously
  const [locale, setLocale] = useState<Locale>("en");

  // After mount, read saved locale and apply (no dependency on `locale`, so no lint warning)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ga_locale") as Locale | null;
      if (saved) setLocale(saved);
    } catch {
      /* ignore */
    }
  }, []);

  // Anytime locale changes, persist it
  useEffect(() => {
    try {
      localStorage.setItem("ga_locale", locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const t = useMemo(() => {
    return (key: string) => {
      const val = getPath(dictionaries[locale], key);
      return typeof val === "string" ? val : key;
    };
  }, [locale]);

  return (
    <I18nCtx.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useI18n() {
  return useContext(I18nCtx);
}
