// app/components/daily/DailyResults.tsx
"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/app/lib/i18n";

// Match i18n var type (values are string | number)
type KeyArgs = Record<string, string | number>;

/* --------------------------- Types from API --------------------------- */

type Window = { start?: string; end?: string; reason?: string };
type Windows = {
  best?: Window | Record<string, never>;
  green?: Array<{ start: string; end: string }>;
  caution?: Array<{ start: string; end: string }>;
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
  /** server i18n support */
  key?: string;
  args?: KeyArgs; // ← align with i18n var typing
};
type Actions = { do?: ActionItem[]; dont?: ActionItem[] };

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

/** Minimal energy donut */
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

/* ------------------------------ Helpers ------------------------------ */

function dash(str?: string, ascii = false) {
  if (!str) return "";
  return ascii ? str.replace(/\u2013|\u2014|\u2212/g, "-") : str.replace(/-/g, "–");
}

function uniqueByNormalized(lines: string[], limit?: number) {
  const norm = (s: string) =>
    s.toLowerCase().replace(/\s+/g, " ").replace(/[.,;:!—–-]+$/g, "").trim();
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of lines) {
    const k = norm(s);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(s.trim());
    if (limit && out.length >= limit) break;
  }
  return out;
}

function joinWithAnd(items: string[], andWord: string) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} ${andWord} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, ${andWord} ${items[items.length - 1]}`;
}

function formatCautionWindows(wins: Array<{ start: string; end: string }>, ascii = false) {
  const parts = (wins || [])
    .filter((w) => w.start && w.end)
    .slice(0, 2)
    .map((w) => `${dash(w.start, ascii)} ${ascii ? "-" : "–"} ${dash(w.end, ascii)}`);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} and ${parts[1]}`;
}

/** category-code → i18n key suffix */
const CAT_TO_KEY: Record<string, string> = {
  comm: "sensitiveConversations",
  travel: "travel",
  trading: "trading",
  legal: "legal",
  creative: "creative",
  networking: "networking",
  family_kids: "familyKids",
  finance: "finance",
  health: "health",
  tech: "tech",
  /** NEW: map planet-driven caution bucket */
  msp: "msp",
};

/** get topics from dont.text/category + overview, then localize & de-dupe */
function buildCautionTopics(
  t: (k: string) => string,
  donts?: ActionItem[],
  overview?: string[]
) {
  const topics: string[] = [];
  const seen = new Set<string>();

  const add = (label?: string) => {
    const t0 = (label || "").trim();
    if (!t0) return;
    const k = t0.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      topics.push(t0);
    }
  };

  (donts || []).forEach((d) => {
    const raw = (d.text || "").trim();
    const m = /^Avoid\s+(.+?)(?:\s+\d{2}:\d{2}\s*[–-]\s*\d{2}:\d{2})?\.?$/i.exec(raw);
    const topic = (m?.[1] || "")
      .replace(/\s{2,}/g, " ")
      .trim()
      .replace(/^\-+|\-+$/g, "");
    if (topic) add(topic);
  });

  (donts || []).forEach((d) => {
    if (d.category) add(d.category);
  });

  (overview || [])
    .filter((s) => /^don't:\s*/i.test(s))
    .map((s) => s.replace(/^don't:\s*/i, "").trim())
    .forEach((txt) => {
      const m = /^Avoid\s+(.+?)(?:\s+\d{2}:\d{2}\s*[–-]\s*\d{2}:\d{2})?\.?$/i.exec(txt);
      const topic = (m?.[1] || txt).replace(/\s{2,}/g, " ").trim();
      if (topic) add(topic);
    });

  const translated = topics.map((label) => {
    const lc = label.toLowerCase();

    if (CAT_TO_KEY[label]) return t(`daily.ui.topics.${CAT_TO_KEY[label]}`);

    if (lc === "sensitive conversations")
      return t("daily.ui.sensitiveConversations") || t("daily.ui.topics.sensitiveConversations");
    if (lc === "travel") return t("daily.ui.travel") || t("daily.ui.topics.travel");
    if (lc === "paperwork/contracts") return t("daily.ui.topics.legal");
    if (lc === "doomscrolling and impulsive posts") return t("daily.ui.topics.doomscroll");

    return label;
  });

  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const out: string[] = [];
  const seen2 = new Set<string>();
  for (const s of translated) {
    const k = norm(s);
    if (!k || seen2.has(k)) continue;
    seen2.add(k);
    out.push(s);
  }

  return out.slice(0, 4);
}

function energySentence(
  t: (k: string, vars?: KeyArgs) => string,
  e: number
) {
  if (e <= 60) return t("daily.ui.energy.sentences.low", { val: e });
  if (e <= 70) return t("daily.ui.energy.sentences.solid", { val: e });
  if (e <= 80) return t("daily.ui.energy.sentences.strong", { val: e });
  return t("daily.ui.energy.sentences.peak", { val: e });
}

/** Localize “do” bullets using server key/args when available */
function buildGoodTimes(
  t: (k: string) => string,
  tOr: (k: string, fb: string, vars?: KeyArgs) => string,
  data: DailyPayload,
  ascii = false
) {
  const best =
    data.windows?.best && Object.keys(data.windows.best).length > 0
      ? data.windows.best
      : undefined;

  // If we have a best window, build a normalized span string that respects ascii/en-dash.
  const spanSep = ascii ? "-" : "–";
  const bestSpan =
    best?.start && best?.end
      ? `${dash(best.start, ascii)} ${spanSep} ${dash(best.end, ascii)}`
      : "";

  const doItems = (data.actions?.do || []) as ActionItem[];

  const fromActionsLocalized =
    doItems.map((a) => {
      const fb = (a.text || "").trim();
      if (a.key) {
        return (tOr(`daily.phrases.${a.key}`, fb, a.args) || fb).trim();
      }
      if (/^[A-Z0-9_]+$/.test(fb)) {
        return (tOr(`daily.phrases.${fb}`, fb, a.args) || fb).trim();
      }
      return fb;
    }) ?? [];

  const fromSummary = (data.overview?.summary || [])
    .filter((s) => /^do:\s*/i.test(s))
    .map((s) => s.replace(/^do:\s*/i, "").trim());

  const fromHighlights = data.domain_highlights || [];

  const merged = uniqueByNormalized(
    [...fromActionsLocalized, ...fromSummary, ...fromHighlights],
    6
  );

  // Avoid duplicating a bullet that already contains the exact best span.
  const filtered = merged.filter((b) => (bestSpan ? !b.includes(bestSpan) : true));

  return { best, bullets: filtered, bestLine: "" };
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

  // Use dobLine in an accessible (non-visual) way to keep prop useful and lint-clean.
  const srDobLine = dobLine ? <span className="sr-only">{dobLine}</span> : null;

  const energyVal = data.overview?.energy ?? 0;
  const energyText = useMemo(() => energySentence(t, energyVal), [energyVal, t]);
  const { best, bullets } = useMemo(
    () => buildGoodTimes(t, tOr, data, asciiFallback),
    [t, tOr, data, asciiFallback]
  );

  const cautionWindows = data.windows?.caution ?? [];
  const cautionWhen = formatCautionWindows(cautionWindows, asciiFallback);

  const cautionTopics = buildCautionTopics(t, data.actions?.dont, data.overview?.summary);
  const andWord = t("daily.ui.and");
  const avoidWord = t("daily.ui.avoid");
  const cautionSentence = cautionWhen
    ? `${avoidWord} ${cautionWhen}${
        cautionTopics.length ? ` — ${joinWithAnd(cautionTopics, andWord)}.` : "."
      }`
    : `${avoidWord} ${
        cautionTopics.length
          ? joinWithAnd(cautionTopics, andWord)
          : t("daily.ui.sensitiveConversations") || "sensitive conversations"
      }.`;

  // Localized “optional” remedies line
  const optionalText = useMemo(() => {
    const ok = data.remedies?.optional_key;
    const oa = data.remedies?.optional_args || {};
    const baseFallback = oa.text || data.remedies?.optional || "";
    const msp = oa.msp || "";
    const period = (oa.period as string) || "generic";

    let base =
      ok === "REMEDY_OPTIONAL_DYNAMIC" && msp
        ? tOr(`daily.optional.${msp}.${period}`, baseFallback)
        : baseFallback;

    const addons: string[] = [];
    if (oa.has_travel_caution) {
      addons.push(t("daily.optionalAddons.travel"));
      addons.push(t("daily.optionalAddons.detox"));
    } else if (msp === "Rahu") {
      addons.push(t("daily.optionalAddons.detox"));
    }
    if (msp === "Rahu" || msp === "Saturn") {
      addons.push(t("daily.optionalAddons.roadSafety"));
    }

    base = base?.trim().replace(/\s*\.*\s*$/, ".");
    const tail = addons.map((a) => a.trim().replace(/\s*\.*\s*$/, ".")).join(" ");
    return [base, tail].filter(Boolean).join(" ");
  }, [data.remedies?.optional_key, data.remedies?.optional_args, data.remedies?.optional, t, tOr]);

  return (
    <div className="grid gap-6">
      {/* Invisible accessibility helper (consumes dobLine to keep lint happy) */}
      {srDobLine}

      {/* Energy strip */}
      <Card className="flex items-center justify-between flex-wrap gap-4">
        <EnergyGauge value={energyVal} />
        <div className="min-w-[220px] max-w-xl text-right">
          <div className="text-slate-400 text-xs mb-1">{t("daily.ui.today")}</div>
          <div className="text-slate-100 font-medium">{energyText}</div>
        </div>
      </Card>

      {/* Two-column content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Good times */}
        <Card tone="good">
          <SectionTitle>{t("daily.ui.sections.goodTimes")}</SectionTitle>
          <div className="space-y-2">
            {best?.start && best?.end ? (
              <div className="text-slate-50 font-semibold text-lg">
                ✅ {dash(best.start, asciiFallback)} {asciiFallback ? "-" : "–"} {dash(best.end, asciiFallback)}
                {best.reason && (
                  <span className="text-slate-300 font-normal text-sm"> • {dash(best.reason, asciiFallback)}</span>
                )}
              </div>
            ) : (
              <div className="text-slate-400">—</div>
            )}
            <ul className="list-none space-y-1 text-sm">
              {bullets.length ? (
                bullets.map((l, i) => <li key={`do-${i}`}>✅ {dash(l, asciiFallback)}</li>)
              ) : (
                <li className="text-slate-400">—</li>
              )}
            </ul>
          </div>
        </Card>

        {/* Caution */}
        <Card tone="warn">
          <SectionTitle>{t("daily.ui.sections.caution")}</SectionTitle>
          <div className="text-sm text-amber-100">⚠️ {dash(cautionSentence, asciiFallback)}</div>

          {cautionTopics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {cautionTopics.map((tpc, i) => (
                <span
                  key={`ct-${i}`}
                  className="rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-100 px-2 py-0.5 text-xs"
                >
                  {dash(tpc, asciiFallback)}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3">
            <div className="text-xs text-amber-200 mb-1">{t("daily.ui.avoidWindows")}</div>
            <div className="flex flex-wrap gap-1.5">
              {(data.windows?.caution || []).map((w, i) => (
                <span
                  key={`cw-${i}`}
                  className="rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-100 px-2 py-0.5 text-xs"
                >
                  {w.start} {asciiFallback ? "-" : "–"} {w.end}
                </span>
              ))}
              {!data.windows?.caution?.length && <span className="text-amber-200/70">—</span>}
            </div>
          </div>
        </Card>

        {/* Remedies */}
        <Card className="md:col-span-2">
          <SectionTitle>{t("daily.ui.sections.remedies")}</SectionTitle>
          <div className="grid sm:grid-cols-4 gap-4 text-slate-200">
            {/* Wear */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-start gap-3">
              <span
                className="mt-0.5 h-3.5 w-3.5 rounded-full border border-white/30"
                title={data.remedies?.wear}
                style={{ background: "rgba(255,255,255,0.35)" }}
              />
              <div>
                <div className="text-slate-400 text-xs mb-1">{t("daily.ui.remedies.wear")}</div>
                <div className="font-medium">{data.remedies?.wear || "—"}</div>
              </div>
            </div>

            {/* Say */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="text-slate-400 text-xs mb-1">{t("daily.ui.remedies.say")}</div>
              <div className="font-medium">{data.remedies?.say?.text || "—"}</div>
              {data.remedies?.say?.secular_alt && (
                <div className="text-slate-400 text-xs mt-1">
                  {t("daily.ui.remedies.alt")}: {data.remedies.say.secular_alt}
                </div>
              )}
            </div>

            {/* Puja (now localized deity label) */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="text-slate-400 text-xs mb-1">{t("daily.ui.remedies.puja")}</div>
              <div className="font-medium">
                {data.remedies?.puja?.deity
                  ? tOr(`daily.ui.deities.${data.remedies.puja.deity}`, data.remedies.puja.deity)
                  : "—"}
              </div>
              {data.remedies?.puja?.suggestion && (
                <div className="text-slate-400 text-xs mt-1">{data.remedies.puja.suggestion}</div>
              )}
            </div>

            {/* “Do” (optional) */}
            {!hideDoInRemedies && data.remedies?.do?.label && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="text-slate-400 text-xs mb-1">{t("daily.ui.remedies.do")}</div>
                <div className="font-medium">{data.remedies?.do?.label}</div>
                {data.remedies?.do?.window?.start && data.remedies?.do?.window?.end && (
                  <div className="text-slate-400 text-xs mt-1">
                    {dash(data.remedies.do.window.start, asciiFallback)} {asciiFallback ? "-" : "–"}{" "}
                    {dash(data.remedies.do.window.end, asciiFallback)}
                  </div>
                )}
                {data.remedies?.do?.note && (
                  <div className="text-slate-400 text-xs mt-1">{data.remedies.do.note}</div>
                )}
              </div>
            )}
          </div>

          {optionalText && (
            <div className="text-slate-400 text-sm mt-3">
              {t("daily.ui.remedies.optionalPrefix")} {optionalText}
            </div>
          )}
          {data.remedies?.disclaimer && (
            <div className="text-slate-500 text-xs mt-1">{t("daily.ui.remedies.disclaimer")}</div>
          )}

          {/* ❌ Removed the “Copy plan” button as requested */}
        </Card>

        {/* Debug / Why */}
        {data.why && (
          <Card className="md:col-span-2">
            <button
              type="button"
              className="w-full text-left flex items-center justify-between"
              onClick={() => setShowWhy((v) => !v)}
            >
              <SectionTitle>{t("daily.ui.debug.title")}</SectionTitle>
              <span className="text-slate-400 text-sm">
                {showWhy ? t("daily.ui.debug.hide") : t("daily.ui.debug.show")}
              </span>
            </button>

            {showWhy && (
              <div className="mt-2 grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-slate-300 text-xs mb-1">{t("daily.ui.debug.tspmsp")}</div>
                  <div className="text-slate-200">
                    tsp: <b>{data.why.tsp || "-"}</b>, msp: <b>{data.why.msp || "-"}</b>
                  </div>
                  <div className="text-slate-300 text-xs mt-2 mb-1">{t("daily.ui.debug.mdad")}</div>
                  <div className="text-slate-200">{`MD: ${data.why.md ?? "-"}`}, {`AD: ${data.why.ad ?? "-"}`}</div>
                  <div className="text-slate-300 text-xs mt-2 mb-1">{t("daily.ui.debug.tagsSupport")}</div>
                  <ul className="list-disc pl-5 text-slate-200">
                    {(data.why.tags_support ?? []).map((x, i) => (
                      <li key={`ts-${i}`}>{dash(x, asciiFallback)}</li>
                    ))}
                  </ul>
                  <div className="text-slate-300 text-xs mt-2 mb-1">{t("daily.ui.debug.tagsStress")}</div>
                  <ul className="list-disc pl-5 text-slate-200">
                    {(data.why.tags_stress ?? []).map((x, i) => (
                      <li key={`tst-${i}`}>{dash(x, asciiFallback)}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-300 text-xs mb-1">{t("daily.ui.debug.supportPct")}</div>
                    <ul className="space-y-1 text-slate-200">
                      {Object.entries(data.why.support ?? {}).map(([k, v]) => (
                        <li key={`s-${k}`} className="flex justify-between">
                          <span>{k}</span>
                          <span className="text-slate-400">{Math.round(v)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-slate-300 text-xs mb-1">{t("daily.ui.debug.stressPct")}</div>
                    <ul className="space-y-1 text-slate-200">
                      {Object.entries(data.why.stress ?? {}).map(([k, v]) => (
                        <li key={`t-${k}`} className="flex justify-between">
                          <span>{k}</span>
                          <span className="text-slate-400">{Math.round(v)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
