//goastrion-frontend/app/components/Dashboard.tsx
import Container from "./Container";

export default function Dashboard() {
  return (
    <section>
      <Container>
        <div className="mb-6 flex items-center justify-between">
          <div className="text-slate-300 text-sm">Welcome back, A.</div>
          <div className="flex gap-2">
            <button className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-200">
              Create New Chart
            </button>
            <button className="rounded-full bg-cyan-500 px-3 py-1.5 text-sm text-slate-950 font-semibold hover:bg-cyan-400">
              Book Appointment
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* My Charts */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-medium">My Charts</div>
              <div className="text-xs text-slate-400">Sort: Newest</div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#141A2A] rounded-2xl p-4 border border-white/5"
                >
                  <div className="text-slate-200 text-sm font-medium">
                    Chart {i}
                  </div>
                  <div className="text-xs text-slate-400">
                    Asc: Leo • Moon: Libra • 12 Aug
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200">
                      View
                    </button>
                    <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200">
                      Share
                    </button>
                    <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200">
                      Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments */}
          <div>
            <div className="text-white font-medium mb-2">Appointments</div>
            <div className="bg-[#141A2A] rounded-2xl p-4 border border-white/5 space-y-3">
              <div className="border border-white/10 rounded-xl p-3 text-sm text-slate-300">
                Tue, 12 Sep — 6:00 PM IST • Career Focus • Confirmed
              </div>
              <div className="border border-white/10 rounded-xl p-3 text-sm text-slate-300">
                No other bookings.{" "}
                <span className="text-cyan-300">Book now</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
