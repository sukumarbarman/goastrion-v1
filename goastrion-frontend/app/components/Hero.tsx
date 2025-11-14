// =========================
// app/components/Hero.tsx — Improved design
// =========================
"use client";
import Link from "next/link";
import Container from "./Container";
import { useI18n } from "../lib/i18n";

export default function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      {/* Background glow layers */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-32 -left-40 h-96 w-96 rounded-full blur-3xl opacity-50"
          style={{
            background: "radial-gradient(circle, rgba(0,194,255,0.25), transparent)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-40 h-96 w-96 rounded-full blur-3xl opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(255,200,87,0.15), transparent)",
          }}
        />
      </div>

      <Container>
        <div className="py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="max-w-xl">
            {/* Headline */}
            <h1
              id="hero-title"
              className="text-4xl md:text-5xl font-bold leading-tight text-white tracking-tight"
            >
              <span className="relative">
                {t("hero.headline", { default: "Know Your Today !!!" })}

                {/* Animated highlight */}
                <span className="absolute -bottom-2 left-0 w-full h-2 bg-cyan-400/20 blur-sm rounded-full animate-pulse" />
              </span>
            </h1>

            {/* Subline */}
            <p className="mt-5 text-lg md:text-xl text-slate-300 leading-relaxed">
              {t("hero.subline", {
                default: "See supportive windows and avoid risky slots.",
              })}
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/create"
                prefetch
                aria-label={t("hero.createBtn", { default: "Create Your Chart" })}
                className="
                  rounded-full bg-cyan-500 text-slate-950 font-semibold
                  px-6 py-2.5 text-base
                  shadow-[0_0_20px_-6px_rgba(0,200,255,0.6)]
                  hover:bg-cyan-400 transition-all
                "
              >
                {t("hero.createBtn", { default: "Create Your Chart" })}
              </Link>

              <Link
                href="/results"
                aria-label={t("hero.sampleBtn", { default: "See Sample Report" })}
                className="
                  rounded-full px-6 py-2.5 text-base text-slate-200
                  border border-white/10 hover:border-white/20
                  backdrop-blur-sm
                "
              >
                {t("hero.sampleBtn", { default: "See Sample Report" })}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex items-center gap-5 text-xs text-slate-400">
              <TrustItem label={t("hero.badgeSecure", { default: "Secure" })} />
              <TrustItem label={t("hero.badgePrivate", { default: "Private" })} />
              <TrustItem label={t("hero.badgeFast", { default: "Fast" })} />
            </div>
          </div>

          {/* Graphic */}
          <div aria-hidden="true" className="flex justify-center md:justify-end">
            <HeroGraphic />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* Small SVG trust-badge item */
function TrustItem({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill="none"
        className="text-cyan-300"
      >
        <path
          d="M8.5 13.5l-3-3 1.2-1.2 1.8 1.8 4.3-4.3 1.2 1.2-5.5 5.5z"
          fill="currentColor"
        />
      </svg>
      {label}
    </span>
  );
}

function HeroGraphic() {
  return (
    <div
      className="
        relative h-72 md:h-96 w-full max-w-sm
        rounded-3xl border border-white/10
        bg-gradient-to-b from-white/5 to-transparent
        flex items-center justify-center
        animate-slowspin
      "
    >
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
    </div>
  );
}
