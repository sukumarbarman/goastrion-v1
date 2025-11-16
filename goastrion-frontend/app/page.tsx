// app/page.tsx — Home
import { cookies } from "next/headers";

import Hero from "./components/Hero";
import Steps from "./components/Steps";
import SkillSpotlight from "./components/SkillSpotlight";
import CTA from "./components/CTA";
import ShubhDinTeaser from "./components/ShubhDinTeaser";
import DomainsTeaser from "./components/DomainsTeaser";
import StructuredData from "./components/StructuredData";

// ⭐ Page-level Metadata (CRITICAL for AdSense)
export const metadata = {
  title:
    "GoAstrion – Free Vedic Birth Chart, ShubhDin & Astrology Timing Insights",
  description:
    "Generate your free Vedic birth chart instantly. Explore ShubhDin, life domains, Saturn phases, skills, and personalized timing insights based on authentic Vedic astrology.",
  alternates: {
    canonical: "https://goastrion.com/",
  },
  openGraph: {
    title:
      "GoAstrion – Free Vedic Birth Chart, ShubhDin & Astrology Timing Insights",
    description:
      "Check your good and cautious times using Vedic astrology. Explore your birth chart, domains, skills, Saturn phases, and more.",
    url: "https://goastrion.com/",
    images: [
      {
        url: "https://goastrion.com/og/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "GoAstrion Homepage",
      },
    ],
    type: "website",
    siteName: "GoAstrion",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "GoAstrion – Free Vedic Birth Chart, ShubhDin & Astrology Timing Insights",
    images: ["https://goastrion.com/og/og-home.jpg"],
  },
};

// ⭐ Small inline components (no need for separate files)
const SectionDivider = () => (
  <div className="my-14 h-px w-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"></div>
);

const HeroGlow = () => (
  <div className="absolute -top-10 left-0 right-0 mx-auto h-24 w-72 blur-3xl bg-cyan-500/10 pointer-events-none"></div>
);

export default async function HomePage() {
  return (
    <>
      <StructuredData />

      {/* ⭐ Soft glow behind hero section */}
      <div className="relative">
        <HeroGlow />
        <Hero />
      </div>

      <SectionDivider />

      <div className="hidden sm:block">
        <ShubhDinTeaser />
      </div>

      <SectionDivider />

      <Steps />

      <SectionDivider />

      <DomainsTeaser />

      <SectionDivider />

      <SkillSpotlight />

      <SectionDivider />

      {/* ⭐ Long-form justified content */}
      <section
        className="
          px-6 sm:px-10 lg:px-20
          mt-16 mb-24
          max-w-4xl mx-auto
          leading-relaxed longform
        "
        style={{ WebkitHyphens: "auto", MozHyphens: "auto", hyphens: "auto" }}
      >
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-white">
          Your Birth Chart, ShubhDin, and Life Predictions — All in One Place
        </h2>

        <div className="sm:text-justify text-left">
          <p className="mb-5 text-[16.5px] leading-[1.9] text-slate-300">
            GoAstrion is your all-in-one Vedic astrology platform designed to help you
            make better decisions in career, finance, marriage, education, and other key
            areas of life. Unlike traditional horoscope apps, GoAstrion uses modern
            algorithms, accurate Swiss-Ephemeris calculations, and clean predictive
            models to generate a highly detailed and reliable birth chart. Everything you
            see — from your ascendant and moon sign to planetary strengths, timelines,
            ShubhDin windows, and Vimshottari Dasha cycles — is calculated using the
            authentic sidereal (Lahiri) method.
          </p>

          <p className="mb-5 text-[16.5px] leading-[1.9] text-slate-300">
            Whether you are planning a new job, checking marriage compatibility,
            preparing for an exam, starting a business, or trying to understand an
            upcoming planetary shift, GoAstrion gives you the clarity you need. Explore
            your daily predictions, career skills, life domains, and Saturn’s influence
            in a clean, easy-to-read format — without the generic horoscope lines found
            everywhere else.
          </p>

          <p className="mb-5 text-[16.5px] leading-[1.9] text-slate-300">
            The <strong className="text-cyan-300">ShubhDin</strong> feature is one of our
            most loved tools. It provides auspicious and inauspicious dates using Vedic
            rules, lunar tithis, nakshatras, and your personal birth chart. It helps you
            pick the best dates for commitments like job changes, investments, business
            launches, travel, celebrations, and personal events. For deeper clarity,
            explore your Saturn (Sade Sati) timeline, Vimshottari Dasha cycles, and
            yearly planetary transits — all neatly organized and easy for everyday users
            to understand.
          </p>

          <p className="mb-5 text-[16.5px] leading-[1.9] text-slate-300">
            GoAstrion is built to be fast, simple, and accessible. You don’t need any
            astrology knowledge — the platform highlights what matters and explains it in
            clear, friendly language. Our mission is to combine ancient Vedic wisdom with
            modern technology so you can navigate life with more confidence and
            awareness.
          </p>

          <p className="text-[16.5px] leading-[1.9] text-slate-300">
            Generate your free birth chart now, explore your strengths and timelines, and
            see how GoAstrion transforms astrology into a meaningful, practical guide for
            modern life.
          </p>
        </div>
      </section>

      <CTA />
    </>
  );
}
