// app/guides/components/GuideLayout.tsx
"use client";

import AdSlot from "../../components/AdSlot";
import Link from "next/link";
import {
  GUIDES_TOP_SLOT_ID,
  GUIDES_MID_SLOT_ID,
  GUIDES_END_SLOT_ID,
} from "../../constants/ads";

// ✅ Define interfaces for structure clarity
interface GuideSection {
  heading: string;
  paragraphs: string[];
}

interface GuideCTA {
  title: string;
  text: string;
  link: string;
  button: string;
}

interface Guide {
  title: string;
  intro: string;
  sections?: GuideSection[];
  cta: GuideCTA;
}

export type { Guide };

// ✅ Use the defined type instead of `any`
export default function GuideLayout({ guide }: { guide: Guide }) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 text-slate-200">
      {/* ---------- TITLE + INTRO ---------- */}
      <header>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          {guide.title}
        </h1>
        <p className="text-slate-300 leading-relaxed mb-6">{guide.intro}</p>
      </header>

      {/* ---------- AD #1 ---------- */}
      <div className="my-6">
        <AdSlot slot={GUIDES_TOP_SLOT_ID} minHeight={250} />
      </div>

      {/* ---------- SECTIONS ---------- */}
      {guide.sections?.map((section, i) => (
        <article key={i} className="mt-10">
          <h2 className="text-2xl font-semibold text-cyan-300 mb-2">
            {section.heading}
          </h2>
          <div className="space-y-3 text-slate-300 leading-relaxed">
            {section.paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        </article>
      ))}

      {/* ---------- AD #2 ---------- */}
      <div className="my-10">
        <AdSlot slot={GUIDES_MID_SLOT_ID} minHeight={280} />
      </div>

      {/* ---------- CTA SECTION ---------- */}
      <section className="mt-12 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 md:p-8 text-center">
        <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
          {guide.cta.title}
        </h3>
        <p className="text-slate-300 mb-4">{guide.cta.text}</p>
        <Link
          href={guide.cta.link}
          className="inline-block px-5 py-2 rounded-full bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition"
        >
          {guide.cta.button}
        </Link>
      </section>

      {/* ---------- AD #3 ---------- */}
      <div className="mt-8">
        <AdSlot slot={GUIDES_END_SLOT_ID} minHeight={250} />
      </div>

      {/* ---------- BACK LINK ---------- */}
      <div className="text-center mt-10 text-sm">
        <Link
          href="/guides"
          className="text-cyan-400 underline hover:text-cyan-300"
        >
          ← Back to Guides
        </Link>
      </div>
    </main>
  );
}
