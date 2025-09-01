import Container from "./Container";

export default function SkillSpotlight() {
  const skills = [
    "Analytical Ability",
    "Communication",
    "Leadership",
    "Creativity",
    "Focus",
    "Entrepreneurial Drive",
  ];

  return (
    <section>
      <Container>
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Skill spotlight
          </h2>
          <p className="mt-2 text-sm md:text-base text-slate-400 max-w-2xl">
            A quick preview of strengths we highlight from your chart.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {skills.map((s, i) => (
            <div
              key={i}
              className="bg-[#141A2A] rounded-2xl p-5 border border-white/5 hover:border-cyan-400/30 transition-all"
            >
              <div className="text-white font-medium">{s}</div>

              {/* pretty bar */}
              <div className="mt-3 h-2 w-full rounded bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                  style={{ width: `${65 + (i % 3) * 10}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Hover to preview. Click in Results for details.
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
