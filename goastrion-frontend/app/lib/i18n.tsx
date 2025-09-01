"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries } from "./dictionaries";

type Locale = keyof typeof dictionaries;

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nCtx = createContext<Ctx>({
  locale: "en",
  setLocale: () => {},
  t: (k) => k,
});

function get(obj: any, path: string) {
  return path.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // IMPORTANT: start with 'en' (same as SSR) — do NOT read localStorage here
  const [locale, setLocale] = useState<Locale>("en");

  // After mount, read saved locale and apply
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ga_locale") as Locale | null;
      if (saved && saved !== locale) setLocale(saved);
    } catch {/* ignore */}
  }, []);

  // Anytime locale changes, persist it
  useEffect(() => {
    try { localStorage.setItem("ga_locale", locale); } catch {/* ignore */}
  }, [locale]);

  const t = useMemo(() => {
    return (key: string) => get(dictionaries[locale], key) ?? key;
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
