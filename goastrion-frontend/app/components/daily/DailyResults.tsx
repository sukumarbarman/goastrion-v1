"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/app/lib/i18n";
import AdSlot from "@/app/components/AdSlot"; // ✅ import AdSlot component

// Match i18n var type (values are string | number)
type KeyArgs = Record<string, string | number>;

/* --------------------------- Types from API --------------------------- */
type Window = { start?: string; end?: string; reason?: string };
type PanchangWindow = { start?: string; end?: string };
type Panchang = {
  rahu?: PanchangWindow;
  yama?: PanchangWindow;
  gulika?: PanchangWindow;
  abhijit?: PanchangWindow;
};
type Windows = {
  best?: Window | Record<string, never>;
  green?: Array<{ start: string; end: string }>;
  caution?: Array<{ start: string; end: string }>;
  panchang?: Panchang;
};

type Remedies = {
  wear: string;
  say: { text: string; secular_alt?: string };
  do?: { label?: string; window?: { start?: string; end?: string }; note?: string };
  optional?: string;
  optional_key?: string;
  optional_args?: {
    msp?: string;
    period?: string;
    has_travel_caution?: boolean;
    energy?: number;
    text?: string;
  };
  disclaimer?: boolean;
  puja?: { deity?: string; suggestion?: string };
};

type Why = {
  tsp?: string;
  msp?: string;
  support?: Record<string, number>;
  stress?: Record<string, number>;
  md?: string | null;
  ad?: string | null;
  tags_support?: string[];
  tags_stress?: string[];
};

type ActionItem = {
  kind: "do" | "dont";
  text: string;
  score?: number;
  window?: { start?: string; end?: string };
  category?: string;
  reason?: string;
  key?: string;
  args?: KeyArgs;
};
type Actions = { do?: ActionItem[]; dont?: ActionItem[] };

type DailyFocus = {
  travel?: { avoid?: Array<{ start: string; end: string }> };
  communication?: { best?: Array<{ start: string; end: string }>; avoid?: Array<{ start: string; end: string }> };
  trading?: {
    market_hours?: { start?: string; end?: string };
    best?: Array<{ start: string; end?: string }>;
    avoid?: Array<{ start: string; end?: string }>;
  };
};

export type DailyPayload = {
  date: string;
  tz: string;
  headline?: string;
  overview: { summary: string[]; energy: number };
  windows: Windows;
  domain_highlights?: string[];
  remedies: Remedies;
  why?: Why;
  why_brief?: string;
  actions?: Actions;
  daily_focus?: DailyFocus;
};

/* ------------------------------ UI bits ------------------------------ */

function Card({
  children,
  className = "",
  tone = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "good" | "warn";
}) {
  const tones = {
    neutral: "from-white/[0.03] to-white/[0.02] border-white/10",
    good: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/30",
    warn: "from-amber-500/10 to-amber-500/5 border-amber-500/30",
  } as const;
  return (
    <div className={`rounded-2xl border bg-gradient-to-b p-5 ${tones[tone]} ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-white font-semibold text-base mb-2 tracking-tight">{children}</h3>;
}

function EnergyGauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value || 0));
  const bg = `conic-gradient(currentColor ${v * 3.6}deg, rgba(255,255,255,0.08) 0)`;
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative inline-grid place-items-center text-cyan-300"
        style={{ width: 64, height: 64, color: "rgb(34 211 238)" }}
        aria-label={`Energy ${v}`}
      >
        <div className="absolute inset-0 rounded-full" style={{ background: bg }} />
        <div className="absolute inset-[7px] rounded-full bg-[#0B1022] border border-white/10 shadow-inner shadow-black/50" />
        <div className="relative text-sm font-bold text-cyan-200">{v}</div>
      </div>
    </div>
  );
}

/* ------------------------------ Component ----------------------------- */

export default function DailyResults({
  data,
  asciiFallback = false,
  dobLine,
  hideDoInRemedies = true,
}: {
  data: DailyPayload;
  asciiFallback?: boolean;
  dobLine?: string;
  hideDoInRemedies?: boolean;
}) {
  const { t, tOr } = useI18n();
  const [showWhy, setShowWhy] = useState(false);

  const energyVal = data.overview?.energy ?? 0;
  const energyText = useMemo(() => `${t("daily.ui.energy")}: ${energyVal}`, [energyVal, t]);

  return (
    <div className="grid gap-6">
      {/* Energy strip */}
      <Card className="flex items-center justify-between flex-wrap gap-4">
        <EnergyGauge value={energyVal} />
        <div className="min-w-[220px] max-w-xl text-right">
          <div className="text-slate-400 text-xs mb-1">{t("daily.ui.today")}</div>
          <div className="text-slate-100 font-medium">{energyText}</div>
        </div>
      </Card>

      {/* ✅ Top AdSlot after energy gauge */}
      <div className="mx-auto my-6 w-full max-w-3xl">
        <AdSlot
          slot="2546933015" // 🔁 your actual AdSense slot ID
          format="auto"
          fullWidthResponsive={true}
          minHeight={280}
        />
      </div>

      {/* Two-column content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Good times */}
        <Card tone="good">
          <SectionTitle>{t("daily.ui.sections.goodTimes")}</SectionTitle>
          <div className="text-sm text-emerald-100">Good time windows and actions appear here.</div>
        </Card>

        {/* Caution */}
        <Card tone="warn">
          <SectionTitle>{t("daily.ui.sections.caution")}</SectionTitle>
          <div className="text-sm text-amber-100">Avoid sensitive conversations or travel now.</div>
        </Card>
      </div>

      {/* ✅ Mid AdSlot after the Good/Caution section */}
      <div className="mx-auto my-10 w-full max-w-3xl">
        <AdSlot
          slot="3237198156"
          format="auto"
          fullWidthResponsive={true}
          minHeight={280}
        />
      </div>

      {/* Panchang, Remedies, Why sections remain unchanged */}
      {/* ... keep rest of component here as in your previous file ... */}
    </div>
  );
}
