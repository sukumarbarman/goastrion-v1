// app/lib/birthStore.ts
export type BirthData = {
  datetime: string;   // ISO with Z/offset (UTC is fine)
  lat: number;
  lon: number;
  tz: string;         // IANA, e.g. "Asia/Kolkata" or "UTC"
};

const KEY = "ga:birth";

export function saveBirth(b: BirthData) {
  try { localStorage.setItem(KEY, JSON.stringify(b)); } catch {}
}

export function loadBirth(): BirthData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (!v?.datetime || typeof v.lat !== "number" || typeof v.lon !== "number" || !v.tz) return null;
    return v as BirthData;
  } catch { return null; }
}

export function clearBirth() {
  try { localStorage.removeItem(KEY); } catch {}
}
