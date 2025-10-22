"use client";

export type HistoryItem = {
  id: string;
  type: string; // e.g., 'daily.opened', 'chart.saved'
  title: string; // localized string at write-time
  chartId?: string;
  ts: string; // ISO
  meta?: Record<string, unknown>;
};

const KEY = "ga_history_v1";
const MAX = 200;

function canUseLS() { return typeof window !== "undefined"; }
function nowIso() { return new Date().toISOString(); }
function uuid() { return "h-" + Math.random().toString(36).slice(2) + Date.now().toString(36); }

export function log(item: Omit<HistoryItem, "id" | "ts"> & { ts?: string }) {
  if (!canUseLS()) return;
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as HistoryItem[]) : [];
    arr.unshift({ id: uuid(), ts: item.ts || nowIso(), ...item });
    if (arr.length > MAX) arr.length = MAX;
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch {}
}

export function list(): HistoryItem[] {
  if (!canUseLS()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function clear() {
  if (!canUseLS()) return false;
  try {
    localStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}
