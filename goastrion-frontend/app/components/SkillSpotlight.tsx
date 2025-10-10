// =========================
// app/components/SkillSpotlight.tsx — unchanged; ensure <h2> present
// =========================
"use client";
import Container from "./Container";
import SkillCard from "./SkillCard";
import Link from "next/link";
import { useI18n } from "../lib/i18n";

export default function SkillSpotlight() {
  const { t } = useI18n();

  const title = t("skills.title", { default: "Skill Spotlight" });
  const note = t("skills.note", { default: "Your top abilities from natal placements." });
  const sampleReport = t("skills.sampleReport", { default: "See sample report" });

  const SKILLS = [
    { name: t("skills.list.analytical.name", { default: "Analytical" }), score: 82, blurb: t("skills.list.analytical.blurb", { default: "Pattern‑finding & logic." }) },
    { name: t("skills.list.communication.name", { default: "Communication" }), score: 78, blurb: t("skills.list.communication.blurb", { default: "Clear writing & speaking." }) },
    { name: t("skills.list.leadership.name", { default: "Leadership" }), score: 66, blurb: t("skills.list.leadership.blurb", { default: "Direct, organize, inspire." }) },
    { name: t("skills.list.creativity.name", { default: "Creativity" }), score: 69, blurb: t("skills.list.creativity.blurb", { default: "Ideas & aesthetics." }) },
    { name: t("skills.list.focus.name", { default: "Focus" }), score: 74, blurb: t("skills.list.focus.blurb", { default: "Deep work stamina." }) },
    { name: t("skills.list.entrepreneurial.name", { default: "Entrepreneurial" }), score: 71, blurb: t("skills.list.entrepreneurial.blurb", { default: "Build & ship." }) },
  ];

  return (
    <section className="py-10" aria-labelledby="skills-title">
      <Container>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 id="skills-title" className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-2xl" dangerouslySetInnerHTML={{ __html: note }} />
          </div>

          <Link href="/results" className="text-sm text-cyan-400 hover:text-cyan-300 underline underline-offset-4">
            {sampleReport}
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {SKILLS.map((s) => (
            <SkillCard key={s.name} name={s.name} score={s.score} blurb={s.blurb} />
          ))}
        </div>
      </Container>
    </section>
  );
}
