// app/lib/insightsClient.ts
export type PersistedCreate = {
  dob: string;
  tob: string;
  tzId: "IST" | "UTC";
  lat: string;
  lon: string;
  svg?: string | null;
};

const STORAGE_KEY = "ga_create_state_v1";

/** Load the chart inputs saved by the Create page (client-side only). */
export function loadCreateState(): PersistedCreate | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedCreate;
  } catch {
    return null;
  }
}

/* ===== Insights client (browser -> Next proxy -> backend) ===== */

export type InsightsRequest = {
  datetime: string;
  lat: number;
  lon: number;
  tz_offset_hours: number;
};

export type DomainItem = {
  key: string;
  score: number;
  tier?: string;
  chips?: string[];
  reasons?: string[];
  timeWindows?: Array<unknown>;
  highlights?: {
    planets?: string[];
    houses?: number[];
    aspects?: { p1: string; p2: string; name: string }[];
  };
};

export type SkillItem = { key: string; score: number; chips?: string[] };

export type InsightsResponse = {
  context?: { planets_in_houses?: Record<string, string[]> };
  insights?: { domains?: DomainItem[]; skills?: SkillItem[] };
};

/**
 * Always call the Next proxy. Never hit 127.0.0.1 or private IPs from the browser.
 * The server route /api/insights will forward to the real backend using BACKEND_URL.
 */
export async function fetchInsights(payload: InsightsRequest): Promise<InsightsResponse> {
  const res = await fetch("/app-api/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    // Surface a helpful error (and your server route will log details server-side)
    throw new Error(`insights ${res.status}: ${text.slice(0, 200)}`);
  }

  // Parse manually to give nicer error messages if JSON is malformed
  try {
    return JSON.parse(text) as InsightsResponse;
  } catch {
    throw new Error("insights: invalid JSON response");
  }
}
