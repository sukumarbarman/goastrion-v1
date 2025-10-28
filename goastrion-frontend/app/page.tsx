// app/page.tsx — Home (SSR guard, Next.js async cookies)
// app/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Hero from "./components/Hero";
import Steps from "./components/Steps";
import SkillSpotlight from "./components/SkillSpotlight";
import CTA from "./components/CTA";
import ShubhDinTeaser from "./components/ShubhDinTeaser";
import DomainsTeaser from "./components/DomainsTeaser";
import StructuredData from "./components/StructuredData";

export default async function HomePage() {
  const c = await cookies();

  const authed =
    c.get("ga_auth")?.value === "1" ||
    c.has("access") ||
    c.has("refresh") ||
    c.has("sessionid");

  if (authed) redirect("/daily");   // 🔁 changed from "/profile" → "/daily"

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
