// app/lib/i18n.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { dictionaries } from "./locales/dictionaries";

type Locale = keyof typeof dictionaries;

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const noopSetLocale: I18nContextValue["setLocale"] = () => {};

const I18nCtx = createContext<I18nContextValue>({
  locale: "en",
  setLocale: noopSetLocale,
  t: (k) => k,
});

/** Safe getter for dot-separated keys. */
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

/** Simple interpolation: replaces {key} with vars[key]. */
function interpolate(template: string, vars?: Record<string, string | number>) {
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
      if (saved) setLocale(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ga_locale", locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => {
      const val = getPath(dictionaries[locale], key);
      const str = typeof val === "string" ? val : key;
      return interpolate(str, vars);
    };
  }, [locale]);

  return (
    <I18nCtx.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nCtx.Provider>
  );
}

// ---- Only ONE hook export below ----
export function useI18n() {
  return useContext(I18nCtx);
}
