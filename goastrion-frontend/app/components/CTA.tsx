import Container from "./Container";

export default function CTA() {
  return (
    <section className="mt-12">
      <Container>
        <div className="rounded-3xl border border-white/10 p-6 md:p-10 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-white text-xl font-semibold">Start free. No signup required.</h3>
            <p className="text-slate-400 text-sm">Generate your first chart in seconds.</p>
          </div>
          <button className="rounded-full bg-cyan-500 px-5 py-2.5 text-slate-950 font-semibold hover:bg-cyan-400">
            Create Your Chart
          </button>
        </div>
      </Container>
    </section>
  );
}
