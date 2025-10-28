// app/lib/apiClient.ts

// Base URL resolution:
// - Server (SSR/route handlers): prefer BACKEND_URL, then NEXT_PUBLIC_BACKEND_URL, then NEXT_PUBLIC_API_BASE
// - Browser: use NEXT_PUBLIC_API_BASE if set; otherwise keep relative paths ("/api/...") so your proxy/rewrites can handle it
const isServer = typeof window === "undefined";

const RAW_BASE = isServer
  ? (process.env.BACKEND_URL ??
     process.env.NEXT_PUBLIC_BACKEND_URL ??
     process.env.NEXT_PUBLIC_API_BASE ??
     "")
  : (process.env.NEXT_PUBLIC_API_BASE ?? ""); // empty => relative URLs

const BASE_URL = RAW_BASE ? RAW_BASE.replace(/\/+$/, "") : "";

// ---- Types ----
type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | { [key: string]: JsonValue } | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

// ---- Error ----
export class ApiError extends Error {
  status: number;
  data?: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ---- Helpers ----
function buildUrl(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return BASE_URL ? `${BASE_URL}${path}` : path;
}

function withAuth(headers: HeadersInit = {}, token?: string): HeadersInit {
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

async function parseJsonSafe(resp: Response): Promise<unknown> {
  const text = await resp.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function pickMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    if (typeof obj.detail === "string") return obj.detail;
    if (typeof obj.message === "string") return obj.message;
    if (Array.isArray(obj.non_field_errors) && typeof obj.non_field_errors[0] === "string") {
      return obj.non_field_errors[0];
    }
    // common field error shapes: { field: ["err"] }
    for (const v of Object.values(obj)) {
      if (Array.isArray(v) && typeof v[0] === "string") return v[0];
    }
  }
  return fallback;
}

const DEFAULT_TIMEOUT_MS = 20_000;

async function request<T = unknown>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  endpoint: string,
  body?: JsonValue | FormData,
  token?: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const url = buildUrl(endpoint);
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: HeadersInit = withAuth(
    isForm
      ? { Accept: "application/json" }
      : {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(typeof navigator !== "undefined" && navigator.language
            ? { "Accept-Language": navigator.language }
            : {}),
        },
    token
  );

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);

  try {
    const resp = await fetch(url, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : isForm
          ? (body as FormData)
          : JSON.stringify(body),
      cache: "no-store",
      credentials: "same-origin",
      signal: ac.signal,
    });

    const data = await parseJsonSafe(resp);
    if (!resp.ok) {
      const msg = pickMessage(data, `HTTP ${resp.status}`);
      throw new ApiError(resp.status, msg, data);
    }
    return data as T;
  } catch (err) {
    // Normalize abort & network errors
    if ((err as Error)?.name === "AbortError") {
      throw new ApiError(408, "Request timed out", null);
    }
    if (err instanceof ApiError) throw err;
    const msg = err instanceof Error ? err.message : "Network error";
    throw new ApiError(0, msg, null);
  } finally {
    clearTimeout(t);
  }
}

// ---- Public API ----
export function apiGet<T = unknown>(endpoint: string, token?: string): Promise<T> {
  return request<T>("GET", endpoint, undefined, token);
}

export function apiPost<T = unknown, B extends JsonValue | FormData | undefined = undefined>(
  endpoint: string,
  data?: B,
  token?: string
): Promise<T> {
  return request<T>("POST", endpoint, data, token);
}

export function apiPut<T = unknown, B extends JsonValue | FormData | undefined = undefined>(
  endpoint: string,
  data?: B,
  token?: string
): Promise<T> {
  return request<T>("PUT", endpoint, data, token);
}

export function apiDelete<T = unknown>(endpoint: string, token?: string): Promise<T> {
  return request<T>("DELETE", endpoint, undefined, token);
}
