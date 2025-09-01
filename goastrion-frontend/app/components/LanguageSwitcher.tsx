"use client";
import { useI18n } from "../lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const Pill = ({ code, label }: { code: "en" | "hi" | "bn"; label: string }) => (
    <button
      onClick={() => setLocale(code)}
      className={`px-2 py-1 rounded-full border text-xs
        ${locale === code
          ? "border-cyan-400 text-cyan-200"
          : "border-white/10 text-slate-300 hover:border-white/20"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-1">
      <Pill code="en" label="EN" />
      <Pill code="hi" label="HI" />
      <Pill code="bn" label="BN" />
    </div>
  );
}
