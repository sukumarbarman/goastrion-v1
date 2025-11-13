//goastrion-frontend/app/api/shubhdin/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBackendBase(): string {
  const raw = process.env.BACKEND_URL || "http://127.0.0.1:8001";
  return raw.replace(/\/+$/, "");
}

type Incoming = {
  datetime: string;
  lat: number | string;
  lon: number | string;
  tz_offset_hours?: number;
  tz?: "IST" | "UTC";
  horizon_months?: number;
  goal?: string;
  saturn_cap_days?: number;
  goals?: string[];
  business?: { type?: string };
};

function getTimeoutMs(url: string): number {
  const q = new URL(url).searchParams.get("timeout_ms");
  if (q && /^\d+$/.test(q)) return Math.max(1000, parseInt(q, 10));
  if (process.env.SHUBHDIN_TIMEOUT_MS && /^\d+$/.test(process.env.SHUBHDIN_TIMEOUT_MS))
    return Math.max(1000, parseInt(process.env.SHUBHDIN_TIMEOUT_MS, 10));
  return 45000;
}

function getErrorName(e: unknown): string | null {
  if (e instanceof Error && typeof e.name === "string") return e.name;
  if (typeof e === "object" && e && "name" in e) {
    const n = (e as { name?: unknown }).name;
    return typeof n === "string" ? n : null;
  }
  return null;
}

export async function POST(req: Request): Promise<Response> {
  const backend = getBackendBase();
  const url = `${backend}/api/v1/shubhdin/run`;
  const timeoutMs = getTimeoutMs(req.url);
  const debug = new URL(req.url).searchParams.get("debug") === "1";

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const raw = await req.text();
    const b = raw ? (JSON.parse(raw) as Incoming) : ({} as Incoming);

    if (!b.datetime || b.lat === undefined || b.lon === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields: datetime, lat, lon" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lat = Number(b.lat);
    const lon = Number(b.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return new Response(JSON.stringify({ error: "lat/lon must be valid numbers" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tzHours =
      typeof b.tz_offset_hours === "number"
        ? b.tz_offset_hours
        : b.tz === "IST"
        ? 5.5
        : b.tz === "UTC"
        ? 0
        : undefined;

    const payload: Record<string, unknown> = {
      datetime: b.datetime,
      lat,
      lon,
      tz_offset_hours: tzHours,
      horizon_months: typeof b.horizon_months === "number" ? b.horizon_months : 24,
      goal: typeof b.goal === "string" ? b.goal : "general",
    };

    if (typeof b.saturn_cap_days === "number" && b.saturn_cap_days > 0)
      payload.saturn_cap_days = Math.floor(b.saturn_cap_days);
    if (Array.isArray(b.goals) && b.goals.every(g => typeof g === "string"))
      payload.goals = b.goals;
    if (b.business?.type && typeof b.business.type === "string")
      payload.business = { type: b.business.type.trim().toLowerCase() };

    if (debug) {
      console.log("[/api/shubhdin] upstream URL:", url);
      console.log("[/api/shubhdin] timeout_ms:", timeoutMs);
      console.log("[/api/shubhdin] payload:", JSON.stringify(payload));
    }

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: ctrl.signal,
    });

    const text = await upstream.text();
    const contentType = upstream.headers.get("content-type") || "application/json";

    if (!upstream.ok) {
      console.error("[/api/shubhdin] backend error", {
        status: upstream.status,
        url,
        req: JSON.stringify(payload).slice(0, 500),
        resp: text.slice(0, 500),
      });
    }

    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[/api/shubhdin] proxy error →", err);
    const name = getErrorName(err);
    const msg = err instanceof Error ? err.message : String(err);
    const isAbort = name === "AbortError" || /aborted/i.test(msg);
    const status = isAbort ? 504 : 500;
    const body = isAbort
      ? { error: `Upstream timeout after ${getTimeoutMs(req.url)} ms` }
      : { error: `Proxy error: ${msg}` };
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({
      ok: true,
      hint:
        "POST JSON { datetime(UTC), lat, lon, tz_offset_hours?, horizon_months?, goal?, saturn_cap_days?, goals?, business? }",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
