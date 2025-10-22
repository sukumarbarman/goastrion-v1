// app/components/SaveChartButton.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { apiPost, ApiError } from "@/app/lib/apiClient";

export type ChartPayload = {
  name?: string;
  birth_datetime: string;
  latitude: number;
  longitude: number;
  timezone: string;
  place?: string;
};

export type SavedChart = ChartPayload & {
  id: string | number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

type Props = {
  chart?: ChartPayload;
  payload?: ChartPayload;
  onSaved?: (chart: SavedChart) => void;
  className?: string;
  label?: string;
  children?: React.ReactNode;
  disabled?: boolean;
};

export default function SaveChartButton({
  chart,
  payload,
  onSaved,
  className = "",
  label,
  children,
  disabled = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const { user, accessToken, refreshAccess } = useAuth();

  const data = chart ?? payload;
  const effectiveLabel =
    label ?? (typeof children === "string" ? (children as string) : "Save to account");

  async function handleClick() {
    if (loading || disabled) return;
    if (!data) return;

    if (!user || !accessToken) {
      window.dispatchEvent(new CustomEvent("auth:open-login"));
      alert("Please log in to save this chart to your account.");
      return;
    }

    setLoading(true);
    try {
      const saved = await saveWithRetry(data, accessToken);
      window.dispatchEvent(new CustomEvent("charts:append", { detail: saved }));
      window.dispatchEvent(new Event("charts:refresh"));
      onSaved?.(saved);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unable to save chart.";
      alert(msg);
      if (String(msg).includes("401")) {
        window.dispatchEvent(new CustomEvent("auth:open-login"));
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveWithRetry(body: ChartPayload, token: string): Promise<SavedChart> {
    try {
      // Note the explicit second generic argument for the request body type
      return await apiPost<SavedChart, ChartPayload>("/api/astro/charts/", body, token);
    } catch (e: unknown) {
      let status: number | undefined;
      if (e instanceof ApiError) {
        status = e.status;
      } else if (typeof e === "object" && e !== null && "status" in e) {
        const s = (e as { status?: unknown }).status;
        if (typeof s === "number") status = s;
      }

      if (status === 401) {
        const nxt = await refreshAccess();
        if (!nxt) throw new Error("Session expired. Please log in again (401).");
        return await apiPost<SavedChart, ChartPayload>("/api/astro/charts/", body, nxt);
      }
      throw e;
    }
  }

  const isDisabled = disabled || loading || !data;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`rounded-full bg-cyan-500 px-5 py-2.5 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-60 ${className}`}
      title={!user || !accessToken ? "Log in to save to your account" : "Save chart to your account"}
    >
      {loading ? "Saving…" : effectiveLabel}
    </button>
  );
}
