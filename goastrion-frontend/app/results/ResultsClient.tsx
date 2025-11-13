// app/results/ResultsClient.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import Container from "../components/Container";
import PrintButton from "../components/PrintButton";
import AdSlot from "../components/AdSlot";
import { useI18n } from "../lib/i18n";
import { RESULTS_MID_SLOT_ID, RESULTS_END_SLOT_ID  } from "../constants/ads";

type DomainCard = { key: string; title: string; summary: string; score: number };
type Skill = { name: string; note: string };
type Shubh = { date: string; window: string; focus: string; note: string };
type Dasha = { label: string; lord: string; start: string; end: string };

function ScorePill({ score, aria }: { score: number; aria: string }) {
  const hue = 140 + Math.round((score / 100) * 60); // 140–200
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: `hsl(${hue} 60% 20%)`, color: `hsl(${hue} 80% 85%)` }}
      aria-label={aria}
    >
      {score}/100
    </span>
  );
}

export default function ResultsClient() {
  const { t } = useI18n();
  const tf = (k: string, fb: string) => (t(k) === k ? fb : t(k));

  const SAMPLE_NAME = tf("resultsPage.sample.nameValue", "Sample: Reene");
  const SAMPLE_META = {
    dob: "1998-08-15",
    tob: "10:20",
    place: tf("resultsPage.sample.placeValue", "Kolkata, India"),
    tz: tf("resultsPage.sample.tzValue", "IST (UTC+05:30)"),
  };

  const DOMAINS: DomainCard[] = [
    {
      key: "career",
      title: tf("resultsPage.domains.career.title", "Career"),
      summary: tf(
        "resultsPage.domains.career.summary",
        "Strong 1st/10th/6th houses. Good for analytical & structured roles."
      ),
      score: 86,
    },
    {
      key: "finance",
      title: tf("resultsPage.domains.finance.title", "Finance"),
      summary: tf(
        "resultsPage.domains.finance.summary",
        "Steady habit potential; watch impulse spends during Venus AD."
      ),
      score: 78,
    },
    {
      key: "marriage",
      title: tf("resultsPage.domains.marriage.title", "Marriage"),
      summary: tf(
        "resultsPage.domains.marriage.summary",
        "Balanced 7th; communication routines improve harmony."
      ),
      score: 72,
    },
    {
      key: "health",
      title: tf("resultsPage.domains.health.title", "Health"),
      summary: tf(
        "resultsPage.domains.health.summary",
        "Saturn supports discipline; sleep + walking compound gains."
      ),
      score: 81,
    },
  ];

  const SKILLS: Skill[] = [
    {
      name: tf("resultsPage.skills.analytical.name", "Analytical Thinking"),
      note: tf(
        "resultsPage.skills.analytical.note",
        "Clear pattern recognition; enjoys breaking problems down."
      ),
    },
    {
      name: tf("resultsPage.skills.communication.name", "Communication"),
      note: tf(
        "resultsPage.skills.communication.note",
        "Crisp written summaries; benefit from weekly sharing cadence."
      ),
    },
    {
      name: tf("resultsPage.skills.focus.name", "Focus & Consistency"),
      note: tf(
        "resultsPage.skills.focus.note",
        "Saturn-backed—small routines compound (50–60 min blocks)."
      ),
    },
    {
      name: tf("resultsPage.skills.entrepreneurship.name", "Entrepreneurial Drive"),
      note: tf(
        "resultsPage.skills.entrepreneurship.note",
        "Good bias to action; add a monthly review for traction."
      ),
    },
  ];

  const SHUBHDIN: Shubh[] = [
    {
      date: tf("resultsPage.shubhdin.row1.date", "2025-10-11 (Sat)"),
      window: tf("resultsPage.shubhdin.row1.window", "10:30–13:00"),
      focus: tf("resultsPage.shubhdin.row1.focus", "Study / Interviews"),
      note: tf("resultsPage.shubhdin.row1.note", "Moon support + clean aspects"),
    },
    {
      date: tf("resultsPage.shubhdin.row2.date", "2025-10-14 (Tue)"),
      window: tf("resultsPage.shubhdin.row2.window", "09:15–11:45"),
      focus: tf("resultsPage.shubhdin.row2.focus", "Launch / Applications"),
      note: tf("resultsPage.shubhdin.row2.note", "Mercury backed window"),
    },
    {
      date: tf("resultsPage.shubhdin.row3.date", "2025-10-18 (Sat)"),
      window: tf("resultsPage.shubhdin.row3.window", "08:40–12:10"),
      focus: tf("resultsPage.shubhdin.row3.focus", "Travel / Planning"),
      note: tf("resultsPage.shubhdin.row3.note", "Light Saturn pressure, still fine"),
    },
  ];

  const DASHAS: Dasha[] = [
    {
      label: tf("resultsPage.dasha.mdBackdrop", "MD (Backdrop)"),
      lord: tf("resultsPage.dasha.mdLord", "Saturn"),
      start: "2023-05-02",
      end: "2032-05-02",
    },
    {
      label: tf("resultsPage.dasha.currentAd", "Current AD"),
      lord: tf("resultsPage.dasha.currentLord", "Venus"),
      start: "2025-03-18",
      end: "2028-01-17",
    },
    {
      label: tf("resultsPage.dasha.nextAd", "Next AD"),
      lord: tf("resultsPage.dasha.nextLord", "Sun"),
      start: "2028-01-17",
      end: "2028-11-05",
    },
  ];

  return (
    <main className="pb-16">
      {/* Hero image */}
      <div className="relative h-56 md:h-72 w-full overflow-hidden border-b border-white/10">
        <Image
          src="/images/goodday.png"
          alt={tf(
            "resultsPage.hero.alt",
            "Smiling young woman checking ShubhDin on GoAstrion"
          )}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-transparent to-transparent" />
      </div>

      <Container>
        {/* Header strip */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-white">
              {tf("resultsPage.title", "Sample Report")}
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <PrintButton />
              <Link
                href="/create"
                className="rounded-full border border-cyan-400/60 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-500/25"
              >
                {tf("resultsPage.cta.generate", "Generate my chart")}
              </Link>
            </div>
          </div>

          <div className="mt-3 grid md:grid-cols-4 gap-3 text-sm text-slate-300">
            <div>
              <span className="text-slate-400">{tf("resultsPage.labels.name", "Name")}:</span>{" "}
              {SAMPLE_NAME}
            </div>
            <div>
              <span className="text-slate-400">{tf("resultsPage.labels.dob", "DOB")}:</span>{" "}
              {SAMPLE_META.dob}
            </div>
            <div>
              <span className="text-slate-400">{tf("resultsPage.labels.time", "Time")}:</span>{" "}
              {SAMPLE_META.tob}
            </div>
            <div>
              <span className="text-slate-400">{tf("resultsPage.labels.place", "Place")}:</span>{" "}
              {SAMPLE_META.place} · {SAMPLE_META.tz}
            </div>
          </div>
        </div>

        {/* Life Wheel (Domains) */}
        <section className="mt-8">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              {tf("resultsPage.lifeWheel.heading", "Life Wheel")}
            </h2>
            <span className="rounded-full bg-white/10 text-slate-200 text-xs px-2.5 py-0.5">
              {tf("resultsPage.lifeWheel.badge", "focus first")}
            </span>
          </div>
          <p className="mt-1 text-slate-400 text-sm">
            {tf(
              "resultsPage.lifeWheel.sub",
              "Where small efforts pay off big. Scores are illustrative."
            )}
          </p>
          <div className="mt-4 grid md:grid-cols-4 gap-4">
            {DOMAINS.map((d) => (
              <div key={d.key} className="rounded-2xl border border-white/10 bg-[#11162A] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-white font-medium">{d.title}</div>
                  <ScorePill
                    score={d.score}
                    aria={tf("resultsPage.scoreAria", "Score {score} out of 100").replace(
                      "{score}",
                      String(d.score)
                    )}
                  />
                </div>
                <p className="mt-2 text-slate-300 text-sm leading-relaxed">{d.summary}</p>
              </div>
            ))}
          </div>

          {/* Ad: mid placement */}
          <div className="mt-6">
           <AdSlot slot={RESULTS_MID_SLOT_ID} fullWidthResponsive minHeight={280}/>
          </div>
        </section>

        {/* Skills */}
        <section className="mt-8">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              {tf("resultsPage.skills.heading", "Top Skills")}
            </h2>
            <span className="rounded-full bg-white/10 text-slate-200 text-xs px-2.5 py-0.5">
              {tf("resultsPage.skills.badge", "strengths")}
            </span>
          </div>
          <div className="mt-3 grid md:grid-cols-2 gap-4">
            {SKILLS.map((s) => (
              <div key={s.name} className="rounded-xl border border-white/10 bg-black/10 p-4">
                <div className="text-slate-200 font-medium">{s.name}</div>
                <p className="text-slate-400 text-sm mt-1">{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ShubhDin */}
        <section className="mt-8">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              {tf("resultsPage.shubhdin.heading", "ShubhDin · Good Days")}
            </h2>
            <span className="rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-100 text-xs px-2.5 py-0.5">
              {tf("resultsPage.shubhdin.badge", "next 2 weeks")}
            </span>
          </div>
          <div className="mt-3 overflow-auto rounded-2xl border border-white/10">
            <table className="min-w-[600px] w-full text-sm">
              <thead className="bg-black/30 text-slate-300">
                <tr>
                  <th className="text-left p-3">{tf("resultsPage.table.date", "Date")}</th>
                  <th className="text-left p-3">{tf("resultsPage.table.window", "Window")}</th>
                  <th className="text-left p-3">{tf("resultsPage.table.bestFor", "Best for")}</th>
                  <th className="text-left p-3">{tf("resultsPage.table.note", "Note")}</th>
                </tr>
              </thead>
              <tbody>
                {SHUBHDIN.map((g) => (
                  <tr key={g.date} className="border-t border-white/10">
                    <td className="p-3">{g.date}</td>
                    <td className="p-3">{g.window}</td>
                    <td className="p-3">{g.focus}</td>
                    <td className="p-3 text-slate-400">{g.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {tf(
              "resultsPage.shubhdin.tip",
              "Tip: lock one keystone habit (e.g., focused study 50 min) into at least one ShubhDin window each week."
            )}
          </p>
        </section>

        {/* MD/AD */}
        <section className="mt-8">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              {tf("resultsPage.dasha.heading", "Timing Context · MD / AD")}
            </h2>
            <span className="rounded-full bg-white/10 text-slate-200 text-xs px-2.5 py-0.5">
              {tf("resultsPage.dasha.badge", "backdrop")}
            </span>
          </div>
          <div className="mt-3 grid md:grid-cols-3 gap-4">
            {DASHAS.map((d) => (
              <div key={d.label} className="rounded-xl border border-white/10 bg-black/10 p-4">
                <div className="text-slate-300 text-sm">{d.label}</div>
                <div className="text-white font-medium mt-1">{d.lord}</div>
                <div className="text-slate-400 text-xs mt-1">
                  {d.start} → {d.end}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Saturn note */}
        <section className="mt-8 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-5">
          <h2 className="text-xl font-semibold text-white">
            {tf("resultsPage.saturn.heading", "Saturn · Sade Sati (Sade Saati / Sadasathi)")}
          </h2>
          <p className="mt-2 text-slate-300 text-sm md:text-base">
            {tf(
              "resultsPage.saturn.copy",
              "We frame Sade Sati as structure, not scare: pruning distractions, building routines, and committing to what matters. Pair ShubhDin windows with small, repeatable actions—sleep, study blocks, budgeting—to exit stronger."
            )}
          </p>
        </section>

        {/* Ad: end-of-page */}
        <div className="mt-8">
          <AdSlot slot={RESULTS_END_SLOT_ID} fullWidthResponsive minHeight={280}/>
        </div>

        {/* Footer CTA */}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/create"
            className="rounded-full bg-cyan-500 px-5 py-2.5 text-slate-950 font-semibold hover:bg-cyan-400"
          >
            {tf("resultsPage.footer.startFree", "Start free — generate my chart")}
          </Link>
          <Link
            href="/faq"
            className="rounded-full border border-white/10 px-5 py-2.5 text-slate-200 hover:border-white/20"
          >
            {tf("resultsPage.footer.readFaqs", "Read FAQs")}
          </Link>
        </div>
      </Container>
    </main>
  );
}
