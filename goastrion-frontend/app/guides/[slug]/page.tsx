//goastrion-frontend/app/guides/[slug]/page.tsx
//goastrion-frontend/app/guides/[slug]/page.tsx

import Link from "next/link";
import GuideLayout from "../components/GuideLayout";
import { sadeSatiGuide } from "../data/sade-sati";
import { dashaGuide } from "../data/dasha";
import { lifeWheelGuide } from "../data/life-wheel";
import { careerAstrologyGuide } from "../data/career-astrology";
import { shubhdinGuide } from "../data/shubhdin";
import { balanceGuide } from "../data/balance";
import type { Guide } from "../components/GuideLayout";

// 🧭 Central guide map
const guideMap: Record<string, Guide> = {
  "sade-sati": sadeSatiGuide,
  dasha: dashaGuide,
  "life-wheel": lifeWheelGuide,
  "career-astrology": careerAstrologyGuide,
  shubhdin: shubhdinGuide,
  balance: balanceGuide,
};

// ✅ Single shared OG image
const OG_IMAGE = "https://goastrion.com/og/guides-default.jpg";

// ----------------------------------------
// ✅ Dynamic Metadata
// ----------------------------------------
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const guide = guideMap[slug];

  // Fallback metadata (404 guide)
  if (!guide) {
    return {
      title: "GoAstrion Guides – Vedic Astrology Insights",
      description:
        "Explore practical astrology guides by GoAstrion — learn about Saturn Sade Sati, Vimshottari Dasha, Life Wheel, ShubhDin, and more.",
      openGraph: {
        title: "GoAstrion Guides – Vedic Astrology Insights",
        description:
          "Explore detailed astrology guides and insights.",
        url: `https://goastrion.com/guides`,
        siteName: "GoAstrion",
        images: [OG_IMAGE],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: "GoAstrion Guides – Vedic Astrology Insights",
        description:
          "Explore detailed astrology guides and insights.",
        images: [OG_IMAGE],
      },
    };
  }

  // Page-specific metadata
  const cleanTitle = guide.title.replace("—", "–");
  const description = guide.intro.slice(0, 160);

  return {
    title: `${cleanTitle} | GoAstrion Guide`,
    description,
    alternates: {
      canonical: `https://goastrion.com/guides/${slug}`,
    },
    openGraph: {
      title: `${cleanTitle} | GoAstrion`,
      description,
      url: `https://goastrion.com/guides/${slug}`,
      siteName: "GoAstrion",
      type: "article",
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: cleanTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${cleanTitle} | GoAstrion`,
      description,
      images: [OG_IMAGE],
    },
  };
}

// ----------------------------------------
// Page Renderer
// ----------------------------------------
export default async function GuidePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const guide = guideMap[slug];

  if (!guide) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center text-center text-slate-300 px-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          Guide Not Found
        </h1>
        <p className="mt-3">
          Please return to{" "}
          <Link href="/guides" className="text-cyan-400 underline">
            GoAstrion Guides
          </Link>
          .
        </p>
      </main>
    );
  }

  return <GuideLayout guide={guide} />;
}
