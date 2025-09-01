import Link from "next/link";
import Container from "./Container";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute -top-20 -left-40 h-96 w-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(0,194,255,0.25), transparent)" }}
        />
        <div
          className="absolute -bottom-20 -right-40 h-96 w-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,200,87,0.15), transparent)" }}
        />
      </div>

      <Container>
        <div className="py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-white">
              Chart Your Strengths.<br />Choose the Right Path.
            </h1>
            <p className="mt-4 text-slate-400 max-w-xl">
              GoAstrion reveals your innate skills from your birth chart — helping you study smarter and grow faster.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/create"
                className="rounded-full bg-cyan-500 px-5 py-2.5 text-slate-950 font-semibold hover:bg-cyan-400"
              >
                Create Your Chart
              </Link>
              <Link
                href="/results"
                className="rounded-full border border-white/10 px-5 py-2.5 text-slate-200 hover:border-white/20"
              >
                See Sample Report
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-4 text-xs text-slate-400">
              <span>Secure</span><span className="h-3 w-px bg-white/10" />
              <span>Private</span><span className="h-3 w-px bg-white/10" />
              <span>Fast</span>
            </div>
          </div>
          <div>
            <HeroGraphic />
          </div>
        </div>
      </Container>
    </section>
  );
}

function HeroGraphic() {
  return (
    <div className="relative h-72 md:h-96 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center">
      <div className="absolute inset-8 rounded-3xl border border-white/10" />
      <div className="relative h-56 w-56 rounded-full border border-cyan-400/30" />
      <div className="absolute h-40 w-40 rounded-full border border-white/10" />
      <div className="absolute h-28 w-28 rounded-full border border-white/10" />
      <div
        className="absolute h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_20px_4px_rgba(0,194,255,0.5)]"
        style={{ top: "30%", left: "25%" }}
      />
      <div
        className="absolute h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_16px_4px_rgba(255,200,87,0.45)]"
        style={{ top: "60%", left: "65%" }}
      />
      <div className="absolute bottom-5 right-5 text-xs text-slate-400">SVG preview</div>
    </div>
  );
}
