// =========================
// app/components/Hero.tsx — localized, keyword-rich, accessible
// =========================
"use client";
import Link from "next/link";
import Container from "./Container";
import { useI18n } from "../lib/i18n";

export default function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      {/* Background glow (decorative) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute -top-20 -left-40 h-96 w-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(0,194,255,0.25), transparent)" }}
        />
        <div
          className="absolute -bottom-20 -right-40 h-96 w-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,200,87,0.15), transparent)" }}
        />
      </div>

      <Container>
        <div className="py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center relative z-10">
          <div>
            {/* Headline (H1 is critical for SEO) */}
            <h1 id="hero-title" className="text-4xl md:text-5xl font-bold leading-tight text-white">
              {t("hero.headline", {
                default:
                  "Know Your Today !!!",
              })}
            </h1>

            {/* Subline = meta description mirror */}
            <p className="mt-4 text-lg md:text-xl text-slate-300 max-w-xl">
              {t("hero.subline", {
                default:
                  "See supportive windows and avoid risky slots.",
              })}
            </p>

            {/* Support line with internal keyword links
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-xl">
              {t("hero.support.before", { default: "Start with a free" })}{" "}
              <Link href="/chart" className="underline underline-offset-4 hover:text-cyan-300">
                {t("hero.support.chart", { default: "birth chart" })}
              </Link>
              {" • "}
              <Link href="/saturn" className="underline underline-offset-4 hover:text-cyan-300">
                {t("hero.support.saturn", { default: "Saturn/Sade Sati" })}
              </Link>
            </p>
            */}
            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <Link
                href="/create"
                className="rounded-full bg-cyan-500 px-5 py-2.5 text-slate-950 font-semibold hover:bg-cyan-400"
                aria-label={t("hero.createBtn", { default: "Create Your Chart" })}
                prefetch
              >
                {t("hero.createBtn", { default: "Create Your Chart" })}
              </Link>
              <Link
                href="/results"
                className="rounded-full border border-white/10 px-5 py-2.5 text-slate-200 hover:border-white/20"
                aria-label={t("hero.sampleBtn", { default: "See Sample Report" })}
              >
                {t("hero.sampleBtn", { default: "See Sample Report" })}
              </Link>
            </div>

            {/* Badges */}
            <div className="mt-6 flex items-center gap-4 text-xs text-slate-400">
              <span>{t("hero.badgeSecure", { default: "Secure" })}</span>
              <span className="h-3 w-px bg-white/10" />
              <span>{t("hero.badgePrivate", { default: "Private" })}</span>
              <span className="h-3 w-px bg-white/10" />
              <span>{t("hero.badgeFast", { default: "Fast" })}</span>
            </div>
          </div>

          {/* Graphic — mark as decorative for a11y */}
          <div aria-hidden>
            <HeroGraphic />
          </div>
        </div>
      </Container>
    </section>
  );
}

function HeroGraphic() {
  return (
    <div className="relative h-72 md:h-96 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center">
      <div className="absolute inset-8 rounded-3xl border border-white/10" />
      <div className="relative h-56 w-56 rounded-full border border-cyan-400/30" />
      <div className="absolute h-40 w-40 rounded-full border border-white/10" />
      <div className="absolute h-28 w-28 rounded-full border border-white/10" />
      <div
        className="absolute h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_20px_4px_rgba(0,194,255,0.5)]"
        style={{ top: "30%", left: "25%" }}
      />
      <div
        className="absolute h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_16px_4px_rgba(255,200,87,0.45)]"
        style={{ top: "60%", left: "65%" }}
      />
      <div className="absolute bottom-5 right-5 text-xs text-slate-400">SVG preview</div>
    </div>
  );
}
