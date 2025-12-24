// app/components/Visitors.tsx

export default function Visitors() {
  return (
    <section className="mt-24 text-center px-6">
      <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
        Trusted by <span className="text-cyan-300">2,49,000+</span> People
      </h2>

      <p className="text-slate-300 max-w-xl mx-auto text-[16.5px]">
        Users across India and abroad rely on GoAstrion every day to plan their
        horoscope timings, ShubhDin, and major life decisions with clarity.
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
          { label: "User Rating", value: "4.7★" },
          { label: "Avg Session Time", value: "13+ min" },
          { label: "Charts Generated", value: "16 lakh+" },
        ].map((item, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-lg"
          >
            <p className="text-3xl font-bold text-cyan-300">{item.value}</p>
            <p className="text-slate-400 text-sm mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
