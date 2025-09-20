// app/components/Steps.tsx
"use client";
import Container from "./Container";
import { useI18n } from "../lib/i18n";

export default function Steps() {
  const { t } = useI18n();

  const ITEMS = [
    { t: t("steps.1.title"), d: t("steps.1.desc") },
    { t: t("steps.2.title"), d: t("steps.2.desc") },
    { t: t("steps.3.title"), d: t("steps.3.desc") },
  ];

  return (
    <section className="py-10">
      <Container>
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          {t("steps.heading")}
        </h2>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {ITEMS.map((it, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 p-5 bg-[#11162A]"
            >
              <div className="text-xs text-slate-400">
                {t("steps.stepLabel", { num: i + 1 })}
              </div>
              <div className="mt-1 text-white font-medium">{it.t}</div>
              <p className="mt-2 text-slate-400 text-sm">{it.d}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
