// app/page.tsx (or wherever your HomePage lives)
import Hero from "./components/Hero";
import Steps from "./components/Steps";
import SkillSpotlight from "./components/SkillSpotlight";
import CTA from "./components/CTA";

// NEW
import ShubhDinTeaser from "./components/ShubhDinTeaser";
import DomainsTeaser from "./components/DomainsTeaser";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ShubhDinTeaser />     {/* ← Good Day / ShubhDin */}
      <Steps />
      <DomainsTeaser />      {/* ← Life Wheel / Domains */}
      <SkillSpotlight />
      <CTA />
    </>
  );
}
