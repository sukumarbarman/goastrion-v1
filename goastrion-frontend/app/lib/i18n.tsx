// app/lib/i18n.tsx  ← add get() + dict to the context
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries } from "./locales/dictionaries";

type Locale = keyof typeof dictionaries;

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  get: (key: string) => unknown;                 // ⬅️ add
  dict: typeof dictionaries[Locale];             // ⬅️ optional, but handy
};

const I18nCtx = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (k) => k,
  get: () => undefined,                          // ⬅️ default
  dict: dictionaries.en,                         // ⬅️ default
});

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
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ga_locale", locale);
    } catch {}
  }, [locale]);

  const dict = dictionaries[locale];
  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => {
      const val = getPath(dict, key);
      const str = typeof val === "string" ? val : key;
      return interpolate(str, vars);
    };
  }, [dict]);

  const get = useMemo(() => {
    return (key: string) => getPath(dict, key);   // ⬅️ returns raw value (array/object/string/number)
  }, [dict]);

  return (
    <I18nCtx.Provider value={{ locale, setLocale, t, get, dict }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useI18n() {
  return useContext(I18nCtx);
}
