// =========================
// app/components/Hero.tsx — Improved design (Mobile optimized)
// =========================
"use client";
import Link from "next/link";
import Container from "./Container";
import { useI18n } from "../lib/i18n";

export default function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-32 -left-40 h-96 w-96 rounded-full blur-3xl opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(0,194,255,0.25), transparent)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-40 h-96 w-96 rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(255,200,87,0.15), transparent)",
          }}
        />
      </div>

      <Container>
        <div
          className="
            py-16 md:py-28
            grid grid-cols-1 md:grid-cols-2
            gap-10 items-center
            relative z-10
          "
        >
          {/* TEXT BLOCK */}
          <div className="max-w-xl order-1">
            {/* Headline */}
            <h1
              id="hero-title"
              className="text-4xl md:text-5xl font-bold leading-tight text-white tracking-tight"
            >
              <span className="relative">
                {t("hero.headline", { default: "Know Your Today !!!" })}
                <span className="absolute -bottom-2 left-0 w-full h-2 bg-cyan-400/20 blur-sm rounded-full animate-pulse" />
              </span>
            </h1>

            {/* Subline */}
            <p className="mt-5 text-lg md:text-xl text-slate-300 leading-relaxed">
              {t("hero.subline", {
                default: "See supportive windows and avoid risky slots.",
              })}
            </p>

            {/* PRIMARY CTA */}
            <div className="mt-8 flex flex-wrap gap-4 order-2">
              <Link
                href="/create"
                prefetch
                className="
                  rounded-full bg-cyan-500 text-slate-950 font-semibold
                  px-6 py-2.5 text-base
                  shadow-[0_0_20px_-6px_rgba(0,200,255,0.6)]
                  hover:bg-cyan-400 transition-all
                "
              >
                Show my best time
              </Link>
            </div>
          </div>

          {/* HERO IMAGE — MOBILE BELOW CTA */}
          <div
            aria-hidden="true"
            className="
              flex justify-center md:justify-end
              order-3 md:order-2
              mt-6 md:mt-0
            "
          >
            <HeroGraphic />
          </div>

          {/* SECONDARY CTA — BELOW IMAGE ON MOBILE */}
          <div className="order-4 md:order-2 mt-2 md:mt-0">
            <Link
              href="/results"
              className="
                rounded-full px-6 py-2.5 text-base text-slate-200
                border border-white/10 hover:border-white/20
                backdrop-blur-sm
              "
            >
              See Sample Report
            </Link>
          </div>

          {/* TRUST BADGES — LAST ON MOBILE */}
          <div className="mt-6 flex items-center gap-5 text-xs text-slate-400 order-5 md:order-2">
            <TrustItem label="Secure" />
            <TrustItem label="Private" />
            <TrustItem label="Fast" />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* TRUST BADGE ITEM */
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
    <div className="relative flex justify-center items-center select-none">
      {/* Soft aura */}
      <div
        className="
          absolute h-80 w-80 md:h-[420px] md:w-[420px]
          rounded-full bg-cyan-400/20 blur-3xl opacity-40 -z-10
        "
      />

      {/* MAIN IMAGE — now mobile optimized */}
      <img
        src="/images/hero-astro.webp"
        alt="Astrology Illustration"
        className="
          relative
          w-44 sm:w-52 md:w-80
          drop-shadow-[0_0_35px_rgba(0,200,255,0.35)]
          animate-fadeUp z-20
        "
      />

      {/* Glow ring */}
      <div
        className="
          absolute rounded-full border border-cyan-400/30 opacity-70
          animate-[ping_3.5s_ease_infinite] blur-[0.3px] z-0
        "
        style={{ height: "115%", width: "115%" }}
      />

      {/* Floating planets */}
      <div
        className="
          absolute h-3 w-3 bg-cyan-300 rounded-full animate-bounce
          shadow-[0_0_16px_4px_rgba(0,200,255,0.4)] z-10
        "
        style={{ top: "18%", left: "72%" }}
      />

      <div
        className="
          absolute h-2 w-2 bg-amber-300 rounded-full animate-pulse
          shadow-[0_0_14px_3px_rgba(255,200,87,0.45)] z-10
        "
        style={{ bottom: "20%", left: "22%" }}
      />
    </div>
  );
}
