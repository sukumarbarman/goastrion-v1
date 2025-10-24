// app/components/SaveChartButton.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { apiPost, ApiError } from "@/app/lib/apiClient";

export type ChartPayload = {
  name?: string;
  birth_datetime: string; // ISO (UTC)
  latitude: number;
  longitude: number;
  timezone: string;       // e.g. "Asia/Kolkata"
  place?: string;
};

export type SavedChart = ChartPayload & {
  id: string | number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

// Internal flag we return when we choose an existing chart (so UI won't append again)
type SaveResult = SavedChart & { _existing?: boolean };

// Payload that can include the optional force flag for duplicates
type ChartUpsertPayload = ChartPayload & { force?: boolean };

// Shape returned by the backend on 409 conflict
type ConflictPayload = {
  detail?: {
    message?: string;
    existing?: SavedChart;
  };
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

// Change this later if you remount backend routes to /api/v1/…
const CHARTS_ENDPOINT = "/api/astro/charts/";

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

      // If we reused an existing chart, don't append a duplicate
      if (!saved._existing) {
        window.dispatchEvent(new CustomEvent("charts:append", { detail: saved }));
      }
      window.dispatchEvent(new Event("charts:refresh"));

      onSaved?.(saved); // _existing flag is harmless to callers
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

  async function saveWithRetry(body: ChartPayload, token: string): Promise<SaveResult> {
    try {
      return await apiPost<SaveResult, ChartPayload>(CHARTS_ENDPOINT, body, token);
    } catch (e: unknown) {
      const status = getStatus(e);

      // Expired access token → refresh and retry once
      if (status === 401) {
        const nxt = await refreshAccess();
        if (!nxt) throw new Error("Session expired. Please log in again (401).");
        return await apiPost<SaveResult, ChartPayload>(CHARTS_ENDPOINT, body, nxt);
      }

      // Duplicate detected by server (409)
      if (status === 409 && e instanceof ApiError) {
        const existing = getExistingFromApiError(e);

        const useExisting = window.confirm(
          "A matching chart already exists.\n\nOK: Open and use the existing chart\nCancel: Save a new copy anyway"
        );

        if (useExisting && existing) {
          // Return with flag so caller won't append again
          return { ...existing, _existing: true };
        }

        // Save anyway → repost with force: true
        const token2 = (await refreshAccess()) || token;
        const upsert: ChartUpsertPayload = { ...body, force: true };
        return await apiPost<SaveResult, ChartUpsertPayload>(CHARTS_ENDPOINT, upsert, token2);
      }

      // Bubble up other errors
      throw e;
    }
  }

  function getStatus(err: unknown): number | undefined {
    if (err instanceof ApiError) return err.status;
    if (typeof err === "object" && err !== null && "status" in err) {
      const s = (err as { status?: unknown }).status;
      if (typeof s === "number") return s;
    }
    return undefined;
  }

  // Narrow ApiError.data to ConflictPayload and pull out existing chart safely
  function getExistingFromApiError(err: ApiError): SavedChart | undefined {
    const d: unknown = err.data;
    if (typeof d !== "object" || d === null) return undefined;
    const detail = (d as { detail?: unknown }).detail;
    if (typeof detail !== "object" || detail === null) return undefined;
    const existing = (detail as { existing?: unknown }).existing;
    if (existing && typeof existing === "object") {
      return existing as SavedChart;
    }
    return undefined;
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
