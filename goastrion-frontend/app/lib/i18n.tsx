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


/* i18n helpers */
function planetLabel(eng: string, t: (k: string) => string) {
  // normalize to lower for lookup; accept any case from SVG
  const key = eng.toLowerCase();
  const map: Record<string, string> = {
    sun: t("planets.sun"),
    moon: t("planets.moon"),
    mars: t("planets.mars"),
    mercury: t("planets.mercury"),
    jupiter: t("planets.jupiter"),
    venus: t("planets.venus"),
    saturn: t("planets.saturn"),
    rahu: t("planets.rahu"),
    ketu: t("planets.ketu"),
  };
  return map[key] || eng;
}

function localizeSvgPlanets(svg: string, t: (k: string) => string) {
  // Match: >   Sun   <  (allowing any whitespace), case-insensitive.
  // Also works when the text is in a <tspan> ... </tspan> since it's still >text< somewhere.
  const names = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
  const pattern = new RegExp(`(>)(\\s*)(${names.join("|")})(\\s*)(<)`, "gi");

  return svg.replace(pattern, (_m, gt, pre, name, post, lt) => {
    const localized = planetLabel(String(name), t);
    return `${gt}${pre}${localized}${post}${lt}`;
  });
}
