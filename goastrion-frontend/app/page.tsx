// =========================
// app/page.tsx — Home (adds StructuredData, headings, internal links)
// =========================
import Hero from "./components/Hero";
import Steps from "./components/Steps";
import SkillSpotlight from "./components/SkillSpotlight";
import CTA from "./components/CTA";
import ShubhDinTeaser from "./components/ShubhDinTeaser";
import DomainsTeaser from "./components/DomainsTeaser";
import StructuredData from "./components/StructuredData";

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <Hero />
      <ShubhDinTeaser />
      <Steps />
      <DomainsTeaser />
      <SkillSpotlight />
      <CTA />
    </>
  );
}