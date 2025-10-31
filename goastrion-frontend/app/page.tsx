// app/page.tsx — Home (SSR guard, Next.js async cookies)
import { cookies } from "next/headers";

import Hero from "./components/Hero";
import Steps from "./components/Steps";
import SkillSpotlight from "./components/SkillSpotlight";
import CTA from "./components/CTA";
import ShubhDinTeaser from "./components/ShubhDinTeaser";
import DomainsTeaser from "./components/DomainsTeaser";
import StructuredData from "./components/StructuredData";
import JumpButton from "./components/JumpButton"; // 🔊 sound + redirect button
import AdSlot from "./components/AdSlot"; // ✅ import your ad slot component

export default async function HomePage() {
  const c = await cookies();

  const authed =
    c.get("ga_auth")?.value === "1" ||
    c.has("access") ||
    c.has("refresh") ||
    c.has("sessionid");

  return (
    <>
      <StructuredData />

      {/* If logged in, show the Jump button */}
      {authed && (
        <div className="text-center mt-12">
          <JumpButton />

          {/* ✅ New AdSense slot (below Jump button) */}
          <div className="mt-10">
            <AdSlot
              slot="1644914885"  // 🔁 replace with your actual AdSense slot ID
              format="auto"
              fullWidthResponsive={true}
              minHeight={280}
              className="mx-auto max-w-4xl"
            />
          </div>
        </div>
      )}

      {/* Hide Hero on mobile (show only on sm and up) */}
      <Hero />
      <div className="hidden sm:block">
        <ShubhDinTeaser />
      </div>
      <Steps />
      <DomainsTeaser />
      <SkillSpotlight />
      <CTA />
    </>
  );
}
