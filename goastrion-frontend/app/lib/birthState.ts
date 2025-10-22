// app/lib/birthState.ts
"use client";

export type TzId = "IST" | "UTC";

export type PersistedCreateState = {
  name?: string;
  dob: string;   // YYYY-MM-DD
  tob: string;   // HH:MM (24h)
  tzId: TzId;    // IST | UTC
  place: string;
  lat: string;   // store as string
  lon: string;   // store as string
  svg: string | null;
  summary: Record<string, string> | null;
  vimshottari: unknown | null;
  savedAt?: string; // ISO
};

export const STORAGE_KEY = "ga_create_state_v1";

export const IANA_BY_TZID: Record<TzId, string> = {
  IST: "Asia/Kolkata",
  UTC: "UTC",
};

const TZ_HOURS: Record<TzId, number> = { IST: 5.5, UTC: 0 };

export function tzHoursToOffset(h: number) {
  const sign = h >= 0 ? "+" : "-";
  const abs = Math.abs(h);
  const hh = Math.floor(abs);
  const mm = Math.round((abs - hh) * 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${sign}${pad(hh)}:${pad(mm)}`;
}

export function localCivilToUtcIso(
  dob: string,
  tob: string,
  tzId: TzId
): { dtIsoUtc: string; tzHours: number } {
  const tzHours = TZ_HOURS[tzId];
  const offset = tzHoursToOffset(tzHours);
  const localTagged = `${dob}T${tob}:00${offset}`;
  const dtIsoUtc = new Date(localTagged).toISOString();
  return { dtIsoUtc, tzHours };
}

export function loadCreateState(): PersistedCreateState | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedCreateState;
  } catch {
    return null;
  }
}

export function saveCreateState(state: PersistedCreateState) {
  try {
    if (typeof window === "undefined") return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearCreatePreview() {
  const prev = loadCreateState();
  if (!prev) return;
  const trimmed: PersistedCreateState = {
    ...prev,
    svg: null,
    summary: null,
    vimshottari: null,
    savedAt: new Date().toISOString(),
  };
  saveCreateState(trimmed);
}

export function deriveDailyPayloadFromCreate() {
  const s = loadCreateState();
  if (!s || !s.dob || !s.tob || !s.lat || !s.lon) return null;
  const { dtIsoUtc, tzHours } = localCivilToUtcIso(s.dob, s.tob, s.tzId);
  return {
    datetime: dtIsoUtc,
    lat: parseFloat(s.lat),
    lon: parseFloat(s.lon),
    tz: IANA_BY_TZID[s.tzId] || "Asia/Kolkata",
    tz_offset_hours: tzHours,
    name: s.name || undefined,
  } as const;
}
