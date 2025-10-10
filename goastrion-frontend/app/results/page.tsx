// app/results/page.tsx
import Link from "next/link";
import Image from "next/image";
import Container from "../components/Container";
import PrintButton from "../components/PrintButton";
import AdSlot from "../components/AdSlot"; // ⬅️ NEW

export const metadata = {
  title: "Sample Report · GoAstrion",
  description:
    "Preview a GoAstrion report: Life Wheel (Domains), Skills, ShubhDin good days, MD/AD timing, and Saturn · Sade Sati notes.",
  alternates: { canonical: "https://goastrion.com/results" },
};

type DomainCard = { key: string; title: string; summary: string; score: number };
type Skill = { name: string; note: string };
type Shubh = { date: string; window: string; focus: string; note: string };
type Dasha = { label: string; lord: string; start: string; end: string };

const SAMPLE_NAME = "Sample: Reene";
const SAMPLE_META = {
  dob: "1998-08-15",
  tob: "10:20",
  place: "Kolkata, India",
  tz: "IST (UTC+05:30)",
};

const DOMAINS: DomainCard[] = [
  { key: "career", title: "Career", summary: "Strong 1st/10th/6th houses. Good for analytical & structured roles.", score: 86 },
  { key: "finance", title: "Finance", summary: "Steady habit potential; watch impulse spends during Venus AD.", score: 78 },
  { key: "marriage", title: "Marriage", summary: "Balanced 7th; communication routines improve harmony.", score: 72 },
  { key: "health", title: "Health", summary: "Saturn supports discipline; sleep + walking compound gains.", score: 81 },
];

const SKILLS: Skill[] = [
  { name: "Analytical Thinking", note: "Clear pattern recognition; enjoys breaking problems down." },
  { name: "Communication", note: "Crisp written summaries; benefit from weekly sharing cadence." },
  { name: "Focus & Consistency", note: "Saturn-backed—small routines compound (50–60 min blocks)." },
  { name: "Entrepreneurial Drive", note: "Good bias to action; add a monthly review for traction." },
];

const SHUBHDIN: Shubh[] = [
  { date: "2025-10-11 (Sat)", window: "10:30–13:00", focus: "Study / Interviews", note: "Moon support + clean aspects" },
  { date: "2025-10-14 (Tue)", window: "09:15–11:45", focus: "Launch / Applications", note: "Mercury backed window" },
  { date: "2025-10-18 (Sat)", window: "08:40–12:10", focus: "Travel / Planning", note: "Light Saturn pressure, still fine" },
];

const DASHAS: Dasha[] = [
  { label: "MD (Backdrop)", lord: "Saturn", start: "2023-05-02", end: "2032-05-02" },
  { label: "Current AD", lord: "Venus", start: "2025-03-18", end: "2028-01-17" },
  { label: "Next AD", lord: "Sun", start: "2028-01-17", end: "2028-11-05" },
];

function ScorePill({ score }: { score: number }) {
  const hue = 140 + Math.round((score / 100) * 60); // 140–200
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: `hsl(${hue} 60% 20%)`, color: `hsl(${hue} 80% 85%)` }}
      aria-label={`Score ${score} out of 100`}
    >
      {score}/100
    </span>
  );
}

export default function SampleResultsPage() {
  return (
    <main className="pb-16">
      {/* Hero image */}
      <div className="relative h-56 md:h-72 w-full overflow-hidden border-b border-white/10">
        <Image
          src="/images/goodday.png"
          alt="Smiling young woman checking ShubhDin on GoAstrion"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-transparent to-transparent" />
      </div>

      <Container>
        {/* Header strip (compact) */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-white">Sample Report</h1>
            <div className="ml-auto flex items-center gap-2">
              <PrintButton />
              <Link
                href="/create"
                className="rounded-full border border-cyan-400/60 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-500/25"
              >
                Generate my chart
              </Link>
            </div>
          </div>

          <div className="mt-3 grid md:grid-cols-4 gap-3 text-sm text-slate-300">
            <div><span className="text-slate-400">Name:</span> {SAMPLE_NAME}</div>
            <div><span className="text-slate-400">DOB:</span> {SAMPLE_META.dob}</div>
            <div><span className="text-slate-400">Time:</span> {SAMPLE_META.tob}</div>
            <div><span className="text-slate-400">Place:</span> {SAMPLE_META.place} · {SAMPLE_META.tz}</div>
          </div>
        </div>

        {/* Life Wheel (Domains) */}
        <section className="mt-8">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-white">Life Wheel</h2>
            <span className="rounded-full bg-white/10 text-slate-200 text-xs px-2.5 py-0.5">focus first</span>
          </div>
          <p className="mt-1 text-slate-400 text-sm">Where small efforts pay off big. Scores are illustrative.</p>
          <div className="mt-4 grid md:grid-cols-4 gap-4">
            {DOMAINS.map((d) => (
              <div key={d.key} className="rounded-2xl border border-white/10 bg-[#11162A] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-white font-medium">{d.title}</div>
                  <ScorePill score={d.score} />
                </div>
                <p className="mt-2 text-slate-300 text-sm leading-relaxed">{d.summary}</p>
              </div>
            ))}
          </div>

          {/* Ad: mid placement after Life Wheel (good viewability) */}
          <div className="mt-6">
            <AdSlot slot="6319403551" minHeight={300} />
          </div>
        </section>

        {/* Skills */}
        <section className="mt-8">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-white">Top Skills</h2>
            <span className="rounded-full bg-white/10 text-slate-200 text-xs px-2.5 py-0.5">strengths</span>
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
            <h2 className="text-xl md:text-2xl font-semibold text-white">ShubhDin · Good Days</h2>
            <span className="rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-100 text-xs px-2.5 py-0.5">
              next 2 weeks
            </span>
          </div>
          <div className="mt-3 overflow-auto rounded-2xl border border-white/10">
            <table className="min-w-[600px] w-full text-sm">
              <thead className="bg-black/30 text-slate-300">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Window</th>
                  <th className="text-left p-3">Best for</th>
                  <th className="text-left p-3">Note</th>
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
            Tip: lock one keystone habit (e.g., focused study 50 min) into at least one ShubhDin window each week.
          </p>
        </section>

        {/* MD/AD */}
        <section className="mt-8">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-white">Timing Context · MD / AD</h2>
            <span className="rounded-full bg-white/10 text-slate-200 text-xs px-2.5 py-0.5">backdrop</span>
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
          <h2 className="text-xl font-semibold text-white">Saturn · Sade Sati (Sade Saati / Sadasathi)</h2>
          <p className="mt-2 text-slate-300 text-sm md:text-base">
            We frame Sade Sati as structure, not scare: pruning distractions, building routines, and committing to what
            matters. Pair ShubhDin windows with small, repeatable actions—sleep, study blocks, budgeting—to exit stronger.
          </p>
        </section>

        {/* Ad: end-of-page */}
        <div className="mt-8">
          <AdSlot slot="8653196509" minHeight={280} />
        </div>

        {/* Footer CTA */}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/create"
            className="rounded-full bg-cyan-500 px-5 py-2.5 text-slate-950 font-semibold hover:bg-cyan-400"
          >
            Start free — generate my chart
          </Link>
          <Link
            href="/faq"
            className="rounded-full border border-white/10 px-5 py-2.5 text-slate-200 hover:border-white/20"
          >
            Read FAQs
          </Link>
        </div>
      </Container>
    </main>
  );
}
