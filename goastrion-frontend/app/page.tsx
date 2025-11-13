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
