// app/components/api/insightsClient.ts
export type AspectHit = { p1: string; p2: string; name: string };
export type DomainHighlight = {
  planets: string[];
  houses: number[];
  aspects: AspectHit[];
};
export type DomainInsight = {
  key: "Career"|"Finance"|"Health"|"Marriage"|"Education";
  score: number;           // 0–100
  tier: "weak"|"moderate"|"strong"|"excellent";
  chips: string[];         // e.g. "chip.house_presence.career", "chip.benefic_harmony"
  reasons: string[];       // i18n keys (backend emits)
  timeWindows: { title?: string; nextExact?: string|null; window?: string; source?: string }[];
  highlights?: DomainHighlight;
};

export type SkillInsight = {
  key: "Analytical"|"Communication"|"Leadership"|"Creativity"|"Focus"|"Entrepreneurial";
  score: number;           // 0–100
  chips: string[];
  reasons: string[];
};

export type InsightsResponse = {
  input: { datetime: string; lat: number; lon: number; tz_offset_hours: number };
  config: { aspectVersion: string; domainVersion: string };
  context: {
    lagna_deg: number; lagna_sign: string;
    angles?: Record<string, number>;
    planets: Record<string, number>;
    planets_in_houses: Record<string, string[]>;
    aspects: Array<{ p1: string; p2: string; name: string; exact: number; delta: number; score: number; applying: boolean|null }>;
  };
  insights: {
    domains: DomainInsight[];
    skills: SkillInsight[];
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export async function fetchInsights(payload: {
  datetime: string; lat: number; lon: number; tz_offset_hours?: number;
}): Promise<InsightsResponse> {
  const res = await fetch(`${API_BASE}/api/insights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Insights HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}
