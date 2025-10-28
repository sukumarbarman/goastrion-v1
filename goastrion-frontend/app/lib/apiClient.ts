// app/lib/apiClient.ts

// Figure out the base URL for API calls.
// - Server (SSR / route handlers): BACKEND_URL > NEXT_PUBLIC_API_BASE > NEXT_PUBLIC_BACKEND_URL
// - Browser: NEXT_PUBLIC_API_BASE > NEXT_PUBLIC_BACKEND_URL > "" (relative only if nothing set)
const isServer = typeof window === "undefined";

const RAW_BASE =
  (isServer ? process.env.BACKEND_URL : undefined) ||
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "";

const BASE_URL = RAW_BASE ? RAW_BASE.replace(/\/$/, "") : "";

type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | { [key: string]: JsonValue } | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

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
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  // If BASE_URL is set, prefix it; otherwise fall back to relative (useful for local dev with a proxy)
  return BASE_URL
    ? `${BASE_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`
    : endpoint.startsWith("/") ? endpoint : "/" + endpoint;
}

function withAuth(headers: HeadersInit = {}, token?: string): HeadersInit {
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

async function parseJsonSafe(resp: Response): Promise<unknown> {
  const text = await resp.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
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
    isForm ? { Accept: "application/json" } : { "Content-Type": "application/json", Accept: "application/json" },
    token
  );

  const resp = await fetch(url, {
    method,
    headers,
    body:
      body === undefined
        ? undefined
        : isForm
        ? (body as FormData)
        : JSON.stringify(body),
    // Don’t send cookies cross-origin (your API is token-based)
    credentials: "omit",
  });

  const data = await parseJsonSafe(resp);

  if (!resp.ok) {
    let message = `HTTP ${resp.status}`;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const obj = data as Record<string, unknown>;
      message =
        (typeof obj.detail === "string" && obj.detail) ||
        (typeof obj.message === "string" && obj.message) ||
        message;
    }
    throw new ApiError(resp.status, message, data);
  }

  return data as T;
}

export function apiGet<T = unknown>(endpoint: string, token?: string): Promise<T> {
  return request<T>("GET", endpoint, undefined, token);
}
export function apiPost<
  T = unknown,
  B extends JsonValue | FormData | undefined = undefined
>(endpoint: string, data?: B, token?: string): Promise<T> {
  return request<T>("POST", endpoint, data, token);
}
export function apiPut<
  T = unknown,
  B extends JsonValue | FormData | undefined = undefined
>(endpoint: string, data?: B, token?: string): Promise<T> {
  return request<T>("PUT", endpoint, data, token);
}
export function apiDelete<T = unknown>(endpoint: string, token?: string): Promise<T> {
  return request<T>("DELETE", endpoint, undefined, token);
}

// Optional: warn if we forgot to set a base in prod (helps avoid blank screens due to 404s)
if (typeof window !== "undefined" && !BASE_URL && process.env.NODE_ENV === "production") {
  // eslint-disable-next-line no-console
  console.warn("[apiClient] No NEXT_PUBLIC_API_BASE set in production — API calls will hit relative /api/* routes.");
}
