// app/lib/chartStore.ts
"use client";

import {
  IANA_BY_TZID,
  TzId,
  localCivilToUtcIso,
  saveCreateState,
  PersistedCreateState,
} from "./birthState";

export type SavedChart = {
  id: string;
  name?: string;
  dob: string; // YYYY-MM-DD
  tob: string; // HH:MM
  tzId: TzId; // IST|UTC
  place: string;
  lat: string; // store as string
  lon: string; // store as string
  tags?: string[]; // e.g., ["Self"]
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

const LIST_KEY = "ga_saved_charts_v1";
const ACTIVE_KEY = "ga_active_chart_id_v1";

function nowIso() {
  return new Date().toISOString();
}
function canUseLS() {
  return typeof window !== "undefined";
}

function uuid(): string {
  // Prefer Web Crypto if available (typed without `any`)
  const g = globalThis as unknown as {
    crypto?: { randomUUID?: () => string };
  };
  if (typeof g.crypto?.randomUUID === "function") {
    return g.crypto.randomUUID();
  }
  // Fallback
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function list(): SavedChart[] {
  if (!canUseLS()) return [];
  try {
    const raw = localStorage.getItem(LIST_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SavedChart[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveList(arr: SavedChart[]) {
  if (!canUseLS()) return false;
  try {
    localStorage.setItem(LIST_KEY, JSON.stringify(arr));
    return true;
  } catch {
    return false;
  }
}

export function add(
  item: Omit<SavedChart, "id" | "createdAt" | "updatedAt">
): SavedChart {
  const arr = list();
  const newItem: SavedChart = {
    ...item,
    id: uuid(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  arr.unshift(newItem);
  saveList(arr);
  const active = getActiveId();
  if (!active) setActive(newItem.id);
  return newItem;
}

export function update(id: string, patch: Partial<SavedChart>): SavedChart | null {
  const arr = list();
  const idx = arr.findIndex((x) => x.id === id);
  if (idx < 0) return null;
  const next = { ...arr[idx], ...patch, id, updatedAt: nowIso() } as SavedChart;
  arr[idx] = next;
  saveList(arr);
  return next;
}

export function remove(id: string) {
  const arr = list();
  const idx = arr.findIndex((x) => x.id === id);
  if (idx < 0) return false;
  arr.splice(idx, 1);
  saveList(arr);
  if (getActiveId() === id) {
    setActive(arr[0]?.id || "");
  }
  return true;
}

export function get(id: string): SavedChart | null {
  return list().find((x) => x.id === id) || null;
}

export function getActiveId(): string | null {
  if (!canUseLS()) return null;
  try {
    return localStorage.getItem(ACTIVE_KEY) || null;
  } catch {
    return null;
  }
}

export function setActive(id: string | "") {
  if (!canUseLS()) return false;
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function getActive(): SavedChart | null {
  const id = getActiveId();
  if (!id) return null;
  return get(id);
}

// Build a Daily-ready payload from the Active saved chart
export function deriveDailyPayloadFromActive() {
  const s = getActive();
  if (!s) return null;
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

/**
 * Sync helpers so opening a saved chart in /create pre-fills the editor
 */
export function writeCreateStateFromSavedChartId(id: string): boolean {
  const s = get(id);
  if (!s) return false;

  const next: PersistedCreateState = {
    name: s.name,
    dob: s.dob,
    tob: s.tob,
    tzId: s.tzId,
    place: s.place,
    lat: s.lat,
    lon: s.lon,
    svg: null,
    summary: null,
    vimshottari: null,
    savedAt: new Date().toISOString(),
  };
  return saveCreateState(next);
}

export function setActiveAndSyncCreate(id: string) {
  setActive(id);
  writeCreateStateFromSavedChartId(id);
}
