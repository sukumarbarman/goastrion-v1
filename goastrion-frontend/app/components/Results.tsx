"use client";

import { useMemo, useState } from "react";
import Container from "./Container";

const FOCI = ["Ascendant", "Education", "Career", "Health", "Finance"] as const;
type FocusKey = typeof FOCI[number];
type EntitySel = { type: "planet" | "house"; id: string } | null;

function Pill({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm transition-all border ${
        active
          ? "bg-cyan-500/20 border-cyan-400 text-cyan-200"
          : "border-white/10 text-slate-300 hover:border-white/20"
      }`}
    >
      {children}
    </button>
  );
}

export default function Results() {
  const [focus, setFocus] = useState<FocusKey>("Ascendant");
  const [active, setActive] = useState<EntitySel>(null);
  const mapped = useMemo(() => mapFocusToEntities(focus), [focus]);

  return (
    <section>
      <Container>
        {/* Summary */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Your results
          </h2>
          <p className="mt-2 text-sm md:text-base text-slate-400 max-w-2xl">
            Interactive chart with contextual insights. Click houses or planets
            to pin details.
          </p>
        </div>

        {/* Summary bar */}
        <div className="bg-[#141A2A] rounded-2xl p-4 border border-white/5 flex flex-wrap items-center gap-3 mb-4">
          <div className="text-slate-200 text-sm">
            DOB 2001-06-14 • 07:42 • Kolkata • Ascendant: Leo • Moon: Libra
          </div>
          <div className="ml-auto flex gap-2">
            <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200">
              Save
            </button>
            <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200">
              Share
            </button>
          </div>
        </div>

        {/* Focus chips */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {FOCI.map((f) => (
            <Pill key={f} active={f === focus} onClick={() => setFocus(f)}>
              {f}
            </Pill>
          ))}
          <span className="ml-auto text-xs text-slate-400">
            Legend: ● Planet ■ House — Aspect
          </span>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="bg-[#141A2A] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-200">Chart (preview)</div>
              <div className="flex gap-2 text-xs">
                <button className="rounded-full border border-white/10 px-2 py-1 text-slate-200">
                  Grid
                </button>
                <button className="rounded-full border border-white/10 px-2 py-1 text-slate-200">
                  Wheel
                </button>
                <button className="rounded-full border border-white/10 px-2 py-1 text-slate-200">
                  Download
                </button>
              </div>
            </div>

            {/* Simple 12-house grid placeholder */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                const focused = mapped.houses.includes(h);
                const selected = active?.type === "house" && active.id === String(h);
                return (
                  <div
                    key={h}
                    onClick={() => setActive({ type: "house", id: String(h) })}
                    className={`aspect-square rounded-xl border relative overflow-hidden cursor-pointer ${
                      selected
                        ? "border-cyan-400 shadow-[0_0_0_3px_rgba(0,194,255,0.25)]"
                        : focused
                        ? "border-cyan-400/60 bg-cyan-500/10"
                        : "border-white/10"
                    }`}
                  >
                    <div className="absolute top-1 left-1 text-[10px] text-slate-400">
                      H{h}
                    </div>
                    {/* Example planet dot */}
                    <div className="absolute right-2 bottom-2 h-2 w-2 rounded-full bg-white/40"></div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 text-xs text-slate-400">
              Focus: {focus}. Highlighted houses:{" "}
              {mapped.houses.join(", ") || "-"}.
            </div>
          </div>

          {/* Insights */}
          <div className="bg-[#141A2A] rounded-2xl p-4 border border-white/5">
            <InsightTabs mapped={mapped} active={active} />
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="mt-8 rounded-2xl border border-white/10 p-4 flex items-center justify-between">
          <div className="text-slate-200">Want expert guidance on this chart?</div>
          <button className="rounded-full bg-cyan-500 px-4 py-2 text-slate-950 font-semibold hover:bg-cyan-400">
            Book Appointment
          </button>
        </div>
      </Container>
    </section>
  );
}

function InsightTabs({
  mapped,
  active,
}: {
  mapped: ReturnType<typeof mapFocusToEntities>;
  active: EntitySel;
}) {
  const [tab, setTab] = useState<
    "Skills" | "Study" | "Career" | "Today" | "PlanetHouse"
  >("Skills");

  return (
    <div>
      <div className="flex items-center gap-2 text-sm mb-3">
        {(["Skills", "Study", "Career", "Today", "PlanetHouse"] as const).map(
          (t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-full border ${
                tab === t
                  ? "border-cyan-400 text-cyan-200 bg-cyan-500/15"
                  : "border-white/10 text-slate-300"
              }`}
            >
              {t === "PlanetHouse" ? "Planet/House" : t}
            </button>
          )
        )}
      </div>

      {tab === "Skills" && <SkillList />}
      {tab === "Study" && <StudyList />}
      {tab === "Career" && <CareerList />}
      {tab === "Today" && <TodayList />}
      {tab === "PlanetHouse" && (
        <PlanetHouseDetails mapped={mapped} active={active} />
      )}
    </div>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded bg-white/10 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function SkillList() {
  const data = [
    { k: "Analytical Ability", v: 82 },
    { k: "Communication", v: 76 },
    { k: "Leadership", v: 69 },
  ];
  return (
    <div className="space-y-4">
      {data.map((s) => (
        <div key={s.k} className="rounded-xl border border-white/10 p-3">
          <div className="flex items-center justify-between text-slate-200 text-sm mb-2">
            <span>{s.k}</span>
            <span className="text-slate-400">{s.v}%</span>
          </div>
          <Bar value={s.v} />
          <p className="mt-2 text-xs text-slate-400">
            Why: Strong Mercury aspects support rapid pattern recognition.
          </p>
        </div>
      ))}
    </div>
  );
}

function StudyList() {
  const items = [
    { t: "Computer Science", d: "Analytical + structured problem solving." },
    { t: "Economics", d: "Pattern recognition and systems thinking." },
  ];
  return (
    <div className="space-y-3">
      {items.map((x) => (
        <div key={x.t} className="rounded-xl border border-white/10 p-3">
          <div className="text-slate-200 text-sm font-medium">{x.t}</div>
          <div className="text-xs text-slate-400">{x.d}</div>
        </div>
      ))}
    </div>
  );
}

function CareerList() {
  const items = [
    { t: "Software Engineer", c: 0.86 },
    { t: "Data Analyst", c: 0.78 },
  ];
  return (
    <div className="space-y-3">
      {items.map((x) => (
        <div
          key={x.t}
          className="rounded-xl border border-white/10 p-3 flex items-center justify-between"
        >
          <div>
            <div className="text-slate-200 text-sm font-medium">{x.t}</div>
            <div className="text-xs text-slate-400">
              Confidence: {(x.c * 100).toFixed(0)}%
            </div>
          </div>
          <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200">
            What to build next
          </button>
        </div>
      ))}
    </div>
  );
}

function TodayList() {
  return (
    <div className="rounded-xl border border-white/10 p-3 text-sm text-slate-300">
      Daily pointers will appear here.
    </div>
  );
}

function PlanetHouseDetails({
  mapped,
  active,
}: {
  mapped: ReturnType<typeof mapFocusToEntities>;
  active: EntitySel;
}) {
  const header = active
    ? active.type === "house"
      ? `House ${active.id}`
      : `Planet ${active.id}`
    : "Focused set";
  return (
    <div>
      <div className="text-slate-200 font-medium mb-2">{header}</div>
      <div className="text-xs text-slate-400 mb-3">
        Houses: {mapped.houses.join(", ") || "-"} • Planets:{" "}
        {mapped.planets.join(", ") || "-"}
      </div>
      <div className="space-y-3">
        {mapped.houses.map((h) => (
          <div key={`H${h}`} className="rounded-xl border border-white/10 p-3">
            <div className="text-slate-200 text-sm font-medium">House {h}</div>
            <div className="text-xs text-slate-400">
              Meaning: contextual blurb (education/career/etc.).
            </div>
          </div>
        ))}
        {mapped.planets.map((p) => (
          <div key={p} className="rounded-xl border border-white/10 p-3">
            <div className="text-slate-200 text-sm font-medium">Planet {p}</div>
            <div className="text-xs text-slate-400">
              Dignity, aspects, and role in current focus.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function mapFocusToEntities(f: FocusKey) {
  switch (f) {
    case "Ascendant":
      return { houses: [1], planets: ["Ruler"], aspects: [] };
    case "Education":
      return { houses: [2, 4, 5, 9], planets: ["Mercury", "Jupiter"], aspects: [] };
    case "Career":
      return { houses: [6, 10, 11], planets: ["Sun", "Saturn", "Mars"], aspects: [] };
    case "Health":
      return { houses: [6, 8, 12], planets: ["Saturn", "Mars"], aspects: [] };
    case "Finance":
      return { houses: [2, 11], planets: ["Venus", "Jupiter"], aspects: [] };
  }
}
