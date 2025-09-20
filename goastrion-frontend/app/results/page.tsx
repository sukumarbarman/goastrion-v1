// app/results/page.tsx
import Container from "../components/Container";
import Link from "next/link";

export default function ResultsSamplePage() {
  return (
    <section className="py-12">
      <Container>
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-white">Sample Report</h1>
            <p className="mt-2 text-slate-400 max-w-2xl">
              This is a demo of what you’ll get after generating your chart. Sections and scores are illustrative.
            </p>
          </div>
          <Link
            href="/create"
            className="rounded-full bg-cyan-500 px-5 py-2.5 text-slate-950 font-semibold hover:bg-cyan-400"
          >
            Create Your Chart
          </Link>
        </div>

        {/* Report shell */}
        <div className="mt-8 grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="rounded-3xl border border-white/10 p-6 bg-[#0F1424]">
            <Section title="Highlights">
              <ul className="space-y-2 text-slate-300">
                <li>• Strong Analytical Ability (82/100)</li>
                <li>• Clear Communication (78/100)</li>
                <li>• Focus & Consistency improving (74/100)</li>
              </ul>
            </Section>

            <Section title="Top Skills">
              <ScoreRow name="Analytical Ability" score={82} />
              <ScoreRow name="Communication" score={78} />
              <ScoreRow name="Focus" score={74} />
              <ScoreRow name="Creativity" score={69} />
              <ScoreRow name="Leadership" score={66} />
            </Section>

            <Section title="Study & Career Suggestions">
              <ul className="list-disc pl-5 text-slate-300 space-y-1">
                <li>STEM + Data-oriented subjects will compound your strengths.</li>
                <li>Join a debate/presentation club to sharpen communication.</li>
                <li>Block 25–30 min deep-work sprints; track distractions.</li>
              </ul>
            </Section>

            <Section title="Planetary Basis (simplified)">
              <p className="text-slate-300">
                Key influences: Jupiter (growth), Mercury (analysis), Moon (flow). Favorable aspects boost reasoning and
                clarity; a mild Saturn aspect asks for steady routines.
              </p>
            </Section>
          </div>

          {/* Right rail */}
          <aside className="space-y-4">
            <Card title="What’s included">
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Skill scores & tiers</li>
                <li>• Actionable study tips</li>
                <li>• Stream & career direction</li>
                <li>• Plain-English planetary summary</li>
              </ul>
            </Card>
            <Card title="Privacy">
              <p className="text-slate-300 text-sm">
                Your data never leaves our servers. We don’t sell or share personal info.
              </p>
            </Card>
            <Link
              href="/create"
              className="block text-center rounded-xl bg-cyan-500 px-5 py-3 text-slate-950 font-semibold hover:bg-cyan-400"
            >
              Generate My Report
            </Link>
          </aside>
        </div>
      </Container>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-5 border-b border-white/5 last:border-0">
      <h2 className="text-white font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function ScoreRow({ name, score }: { name: string; score: number }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="w-48 text-slate-200">{name}</div>
      <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${score}%` }} />
      </div>
      <div className="w-10 text-right text-slate-400 text-sm">{score}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 p-5 bg-[#11162A]">
      <div className="text-white font-medium mb-2">{title}</div>
      {children}
    </div>
  );
}
