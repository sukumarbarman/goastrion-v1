// app/page.tsx — Home Page
import { cookies } from "next/headers";

import Hero from "./components/Hero";
import Steps from "./components/Steps";
import SkillSpotlight from "./components/SkillSpotlight";
import CTA from "./components/CTA";
import ShubhDinTeaser from "./components/ShubhDinTeaser";
import DomainsTeaser from "./components/DomainsTeaser";
import StructuredData from "./components/StructuredData";

import Visitors from "./components/Visitors";
import Testimonials from "./components/Testimonials";

// ⭐ Metadata
export const metadata = {
  title:
    "GoAstrion – Free Vedic Birth Chart, ShubhDin & Astrology Timing Insights",
  description:
    "Generate your free Vedic birth chart instantly. Explore ShubhDin, Life Wheel, Saturn phases, skills and personalized timing insights.",
  alternates: { canonical: "https://goastrion.com/" },
};

// Inline Helpers
const SectionDivider = () => (
  <div className="my-14 h-px w-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"></div>
);

const HeroGlow = () => (
  <div className="absolute -top-10 left-0 right-0 mx-auto h-24 w-72 blur-3xl bg-cyan-500/10 pointer-events-none"></div>
);

// ⭐ Main Page
export default async function HomePage() {
  return (
    <>
      <StructuredData />

      {/* HERO */}
      <div className="relative">
        <HeroGlow />
        <Hero />
      </div>

      <SectionDivider />
      <ShubhDinTeaser />

      <SectionDivider />
      <Steps />

      <SectionDivider />
      <DomainsTeaser />

      <SectionDivider />
      <SkillSpotlight />

      {/* NEW Sections */}
      <SectionDivider />
      <Visitors />

      <SectionDivider />
      <Testimonials />

      <SectionDivider />

      {/* LONG FORM CONTENT */}
      <section
        className="px-6 sm:px-10 lg:px-20 mt-16 mb-24 max-w-4xl mx-auto leading-relaxed"
        style={{ hyphens: "auto" }}
      >
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-white">
          Your Birth Chart, ShubhDin, and Life Predictions — All in One Place
        </h2>

        <div className="sm:text-justify text-left text-slate-300 text-[16.5px] leading-[1.9]">
          <p className="mb-5">
            GoAstrion is your all-in-one Vedic astrology platform designed to help you
            make better decisions in career, finance, marriage, education, and other key
            areas of life…
          </p>

          <p className="mb-5">
            Whether you are planning a new job, checking marriage compatibility…
          </p>

          <p className="mb-5">
            The <strong className="text-cyan-300">ShubhDin</strong> feature is one of our
            most loved tools…
          </p>

          <p className="mb-5">GoAstrion is built to be fast, simple, and accessible…</p>

          <p>Generate your free birth chart now and see the clarity for yourself.</p>
        </div>
      </section>

      <CTA />
    </>
  );
}
