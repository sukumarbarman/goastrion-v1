// app/api/shubhdin/route.ts
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
  tz?: "IST" | "UTC";             // legacy support
  horizon_months?: number;
  goal?: string;
};

export async function POST(req: Request): Promise<Response> {
  const backend = getBackendBase();
  const url = `${backend}/api/v1/shubhdin/run`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30_000);

  try {
    const raw = await req.text();
    const b = raw ? (JSON.parse(raw) as Incoming) : ({} as Incoming);

    if (!b.datetime || b.lat === undefined || b.lon === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields: datetime, lat, lon" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    const lat = typeof b.lat === "number" ? b.lat : Number(b.lat);
    const lon = typeof b.lon === "number" ? b.lon : Number(b.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return new Response(JSON.stringify({ error: "lat/lon must be valid numbers" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    // Map tz → tz_offset_hours if needed (doc prefers tz_offset_hours)
    const tzHours =
      typeof b.tz_offset_hours === "number"
        ? b.tz_offset_hours
        : b.tz === "IST"
        ? 5.5
        : b.tz === "UTC"
        ? 0
        : undefined;

    const payload = {
      datetime: b.datetime,          // UTC ISO
      lat,
      lon,
      tz_offset_hours: tzHours,      // optional; backend echoes locals if present
      horizon_months: typeof b.horizon_months === "number" ? b.horizon_months : 24,
      goal: typeof b.goal === "string" ? b.goal : "general",
    };
    // in app/api/shubhdin/route.ts, inside POST after building payload:
    const debug = new URL(req.url).searchParams.get("debug") === "1";
    if (debug) {
      console.log("[/api/shubhdin] upstream URL:", url);
      console.log("[/api/shubhdin] payload:", JSON.stringify(payload));
    }

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: ctrl.signal,
    });

    const contentType = upstream.headers.get("content-type") || "application/json";
    const text = await upstream.text();

    if (!upstream.ok) {
      console.error("[/api/shubhdin] backend error", {
        status: upstream.status, url,
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
    const msg = err instanceof Error ? err.message : "Proxy error";
    const code = String(msg).includes("aborted") ? 504 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status: code, headers: { "Content-Type": "application/json" },
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({
      ok: true,
      hint: "POST JSON { datetime(UTC), lat, lon, tz_offset_hours?, horizon_months?, goal? }",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
