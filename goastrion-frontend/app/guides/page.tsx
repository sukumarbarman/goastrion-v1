// app/guides/page.tsx
import Link from "next/link";

export const metadata = { title: "Guides · GoAstrion" };

export default function GuidesPage() {
  return (
    <main className="min-h-[70vh]">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <h1 className="text-3xl md:text-4xl font-semibold text-white">Guides</h1>
        <p className="mt-3 text-slate-300 max-w-2xl">
          Short, practical guides to help you use GoAstrion for better decisions in
          career, finance, marriage, health, and education.
        </p>
        <div className="mt-6">
          <Link
            href="/create"
            className="inline-block px-4 py-2 rounded-lg bg-cyan-500 text-black font-medium hover:bg-cyan-400"
          >
            Generate My Chart
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white">How GoAstrion Works</h2>
          <ol className="mt-4 grid md:grid-cols-3 gap-4 text-slate-300">
            <li className="rounded-xl border border-white/10 p-4 bg-black/10">
              <div className="text-cyan-300 font-semibold">1. Enter Birth Details</div>
              <p className="mt-1 text-sm">
                Date, time, and location help us compute your North-Indian style chart.
              </p>
            </li>
            <li className="rounded-xl border border-white/10 p-4 bg-black/10">
              <div className="text-cyan-300 font-semibold">2. Get Insights</div>
              <p className="mt-1 text-sm">
                We highlight key houses, planets, and aspects that shape focus areas.
              </p>
            </li>
            <li className="rounded-xl border border-white/10 p-4 bg-black/10">
              <div className="text-cyan-300 font-semibold">3. Act with Clarity</div>
              <p className="mt-1 text-sm">
                Follow simple, actionable steps aligned to your strengths and timing.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Topic cards */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <h3 className="text-lg md:text-xl font-semibold text-white">Start with a Topic</h3>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GuideCard
            title="Career"
            blurb="Map strengths to roles, choose skills, and track growth windows."
            href="/domains/career"
          />
          <GuideCard
            title="Finance"
            blurb="Understand earning windows and align money habits with rhythms."
            href="/domains/finance"
          />
          <GuideCard
            title="Marriage"
            blurb="View compatibility factors and build better communication patterns."
            href="/domains/marriage"
          />
          <GuideCard
            title="Health"
            blurb="Create sustainable routines synced with energy and stress cycles."
            href="/domains/health"
          />
        </div>
      </section>

      {/* Quick Q&A */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-4">
          <QA
            q="Do I need exact birth time?"
            a="Closer is better for ascendant and house accuracy. If unknown, try a time window and compare which feels most accurate."
          />
          <QA
            q="Is this predictive?"
            a="We emphasize timing + tendencies, then translate them into practical steps you can control."
          />
          <QA
            q="Will it tell me one job to pick?"
            a="We map strengths to multiple paths and suggest experiments so you can validate quickly."
          />
          <QA
            q="Can I use it for students?"
            a="Yes—use the Education focus to choose subjects and skill tracks with confidence."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx_auto px-4 pb-16">
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 md:p-8 text-center">
          <h4 className="text-xl md:text-2xl font-semibold text-white">
            Ready to see your chart?
          </h4>
          <p className="mt-2 text-slate-200">
            Generate your chart and explore tailored insights in minutes.
          </p>
          <Link
            href="/create"
            className="mt-4 inline-block px-4 py-2 rounded-lg bg-cyan-500 text-black font-medium hover:bg-cyan-400"
          >
            Generate My Chart
          </Link>
        </div>
      </section>
    </main>
  );
}

function GuideCard({
  title,
  blurb,
  href,
}: {
  title: string;
  blurb: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-white/10 bg-black/20 p-5 hover:border-cyan-500/40 transition"
    >
      <div className="text-white font-semibold">{title}</div>
      <p className="mt-2 text-sm text-slate-300">{blurb}</p>
      <div className="mt-3 text-xs text-cyan-300">Open guide →</div>
    </Link>
  );
}

function QA({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 p-5">
      <div className="text-slate-100 font-medium">{q}</div>
      <p className="mt-1 text-sm text-slate-300">{a}</p>
    </div>
  );
}
