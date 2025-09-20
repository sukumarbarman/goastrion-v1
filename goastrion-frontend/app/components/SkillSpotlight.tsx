// app/components/SkillSpotlight.tsx
"use client";

import Container from "./Container";
import SkillCard from "./SkillCard";
import Link from "next/link";
import { useI18n } from "@/app/lib/i18n";

export default function SkillSpotlight() {
  const { t } = useI18n();

  const title = t("skills.title");
  const note = t("skills.note");
  const sampleReport = t("skills.sampleReport");

  const SKILLS = [
    {
      name: t("skills.list.analytical.name"),
      score: 82,
      blurb: t("skills.list.analytical.blurb"),
    },
    {
      name: t("skills.list.communication.name"),
      score: 78,
      blurb: t("skills.list.communication.blurb"),
    },
    {
      name: t("skills.list.leadership.name"),
      score: 66,
      blurb: t("skills.list.leadership.blurb"),
    },
    {
      name: t("skills.list.creativity.name"),
      score: 69,
      blurb: t("skills.list.creativity.blurb"),
    },
    {
      name: t("skills.list.focus.name"),
      score: 74,
      blurb: t("skills.list.focus.blurb"),
    },
    {
      name: t("skills.list.entrepreneurial.name"),
      score: 71,
      blurb: t("skills.list.entrepreneurial.blurb"),
    },
  ];

  return (
    <section className="py-10">
      <Container>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              {title}
            </h2>
            <p
              className="mt-2 text-sm md:text-base text-slate-400 max-w-2xl"
              // note supports inline markup (e.g., colored span)
              dangerouslySetInnerHTML={{ __html: note }}
            />
          </div>

          <Link
            href="/results"
            className="text-sm text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
          >
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
