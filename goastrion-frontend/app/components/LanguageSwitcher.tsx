"use client";
import { useI18n } from "../lib/i18n";
import { SUPPORTED_LOCALES, LOCALE_LABEL, type Locale } from "../lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      aria-label="Select language"
      className="bg-black/40 border border-white/10 text-slate-200 text-sm rounded-md px-2 py-1
                 hover:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400"
    >
      {SUPPORTED_LOCALES.map((l) => (
        <option key={l} value={l}>
          {LOCALE_LABEL[l]}
        </option>
      ))}
    </select>
  );
}
