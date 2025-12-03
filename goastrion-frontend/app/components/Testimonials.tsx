// app/components/Testimonials.tsx

export default function Testimonials() {
  const testimonials = [
    {
      name: "Priya Sharma",
      text: "The ShubhDin dates were so accurate — my job switch went smoothly. This app is a blessing!",
      avatar: "https://i.pravatar.cc/100?img=48",
      rating: 5,
    },
    {
      name: "Rahul Verma",
      text: "The chart clarity and Saturn insights helped me understand my career struggles. Super clean UI!",
      avatar: "https://i.pravatar.cc/100?img=12",
      rating: 5,
    },
    {
      name: "Sneha Das",
      text: "GoAstrion explained my planets in a way I never understood before. Highly recommended!",
      avatar: "https://i.pravatar.cc/100?img=32",
      rating: 5,
    },
  ];

  return (
    <section className="mt-28 px-6 sm:px-10 lg:px-20">
      {/* TITLE */}
      <h2 className="text-2xl sm:text-3xl font-semibold mb-12 text-center text-white">
        What Users Say About <span className="text-cyan-300">GoAstrion</span>
      </h2>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="
              group
              p-6
              rounded-2xl
              bg-white/5
              border border-white/10
              backdrop-blur-2xl
              relative overflow-hidden
              shadow-[0_0_15px_rgba(0,0,0,0.1)]
              hover:shadow-[0_4px_35px_rgba(0,255,255,0.17)]
              transition-all duration-300
              hover:scale-[1.03]
              hover:-rotate-[0.3deg]
            "
          >
            {/* Glow gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            {/* Avatar */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-11 h-11 rounded-full border border-white/20 shadow"
              />
              <p className="text-cyan-300 font-semibold">{t.name}</p>
            </div>

            {/* Rating */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, idx) => (
                <span key={idx} className="text-yellow-400 text-lg">★</span>
              ))}
            </div>

            {/* Text */}
            <p className="text-slate-300 text-[15.5px] leading-[1.8]">
              “{t.text}”
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
