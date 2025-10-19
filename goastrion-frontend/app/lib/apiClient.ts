// goastrion-frontend/app/lib/apiClient.ts

const RAW_BASE =
  process.env.NEXT_PUBLIC_BACKEND_BASE ?? "http://127.0.0.1:8000";
const BASE_URL = RAW_BASE.replace(/\/$/, ""); // normalize

// ---- JSON typing helpers (no `any`)
type JsonPrimitive = string | number | boolean | null;
export type JsonValue = | JsonPrimitive  | { [key: string]: JsonValue }  | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

// ---- Structured error you can catch in UI
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

function buildUrl(endpoint: string): string {
  return endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
}

function withAuth(headers: HeadersInit = {}, token?: string): HeadersInit {
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

async function parseJsonSafe(resp: Response): Promise<unknown> {
  // Some endpoints return 204/empty body
  const text = await resp.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text; // non-JSON fallback (rare)
  }
}

async function request<T = unknown>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  endpoint: string,
  body?: JsonValue | FormData,
  token?: string
): Promise<T> {
  const url = buildUrl(endpoint);

  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: HeadersInit = withAuth(
    // Only set JSON content type when NOT sending FormData
    isForm ? { Accept: "application/json" } : {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    token
  );

  const resp = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  });

  const data = await parseJsonSafe(resp);

  if (!resp.ok) {
    // Build a safe string message from common API shapes
    let message: string = `HTTP ${resp.status}`;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const obj = data as Record<string, unknown>;
      const detail = typeof obj.detail === "string" ? obj.detail : undefined;
      const msg = typeof obj.message === "string" ? obj.message : undefined;
      message = detail ?? msg ?? message;
    }

    throw new ApiError(resp.status, message, data);
  }

  return data as T;
}

// ---- Public helpers (keep signatures simple & typed)
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

export function apiDelete<T = unknown>(
  endpoint: string,
  token?: string
): Promise<T> {
  return request<T>("DELETE", endpoint, undefined, token);
}
