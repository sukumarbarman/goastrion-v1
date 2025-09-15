export type PersistedCreate = {
  dob: string;
  tob: string;
  tzId: "IST" | "UTC";
  lat: string;
  lon: string;
  svg?: string | null;
};

const STORAGE_KEY = "ga_create_state_v1";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export function loadCreateState(): PersistedCreate | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function fetchInsights(payload: {
  datetime: string; lat: number; lon: number; tz_offset_hours: number;
}) {
  const res = await fetch(`${API_BASE}/api/insights`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
