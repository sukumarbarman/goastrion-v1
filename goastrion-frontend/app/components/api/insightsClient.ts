// app/components/api/insightsClient.ts

export type SkillInsight = {
  key: string;
  name: string;
  score: number; // 0–100
  reason?: string | null;
};

export type DomainInsight = {
  id: string;
  title: string;
  score: number; // 0–100
  note?: string | null;
};

export type InsightsPayload = {
  summary?: string | null;
  skills?: SkillInsight[];
  domains?: DomainInsight[];
  error?: string;
};

type InsightsApiResp = InsightsPayload & { error?: string };

const PUBLIC_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");
const INSIGHTS_ENDPOINT = PUBLIC_BASE
  ? `${PUBLIC_BASE}/api/v1/insights`
  : "/api/v1/insights";

/** Safe JSON parse that returns null for non-JSON or invalid JSON text */
function parseJsonSafe<T>(text: string): T | null {
  const trimmed = text.trim();
  if (!trimmed || !(trimmed.startsWith("{") || trimmed.startsWith("["))) return null;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
}

export type InsightsRequest = {
  datetime: string; // ISO
  lat: number;
  lon: number;
  tz: string; // IANA, e.g., "Asia/Kolkata"
  locale?: string; // e.g., "en"
  persona?: string; // optional persona flag
};

/**
 * Fetch insights from the backend.
 * Throws an Error on non-2xx HTTP or when backend returns an error field.
 */
export async function fetchInsights(req: InsightsRequest): Promise<InsightsPayload> {
  const { datetime, lat, lon, tz, locale, persona } = req;

  const url =
    `${INSIGHTS_ENDPOINT}` +
    (locale ? `?locale=${encodeURIComponent(locale)}` : "");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(locale ? { "Accept-Language": locale } : {}),
    },
    body: JSON.stringify({
      datetime,
      lat,
      lon,
      tz,
      ...(persona ? { persona } : {}),
    }),
    cache: "no-store",
  });

  const txt = await res.text();
  const data = parseJsonSafe<InsightsApiResp>(txt);

  if (!res.ok) {
    const snippet = txt ? ` — ${txt.slice(0, 160)}` : "";
    const msg = (data && data.error) || `Insights HTTP ${res.status}${snippet}`;
    throw new Error(msg);
  }

  if (!data) {
    // 2xx with empty or invalid JSON
    throw new Error("Insights: empty response");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}
