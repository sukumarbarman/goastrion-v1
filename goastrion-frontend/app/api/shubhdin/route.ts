// app/api/shubhdin/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBackendBase(): string {
  // IMPORTANT: set BACKEND_URL in prod, e.g. http://127.0.0.1:8001
  const raw = process.env.BACKEND_URL || "http://127.0.0.1:8001";
  return raw.replace(/\/+$/, "");
}

// ---- Types for strictness (no `any`) ----
type ShubhDinRequest = {
  datetime: string;          // UTC ISO (e.g., "1990-11-20T12:00:00Z")
  lat: number;               // decimal degrees
  lon: number;               // decimal degrees
  tz?: string;               // IANA (e.g., "Asia/Kolkata") - optional
  // add optional knobs here if backend supports them
  // e.g. horizon_days?: number; filters?: { avoid_station?: boolean };
};
type ShubhDinResponse = unknown; // passthrough JSON from backend

export async function POST(req: Request): Promise<Response> {
  const backend = getBackendBase();
  const url = `${backend}/api/v1/shubhdin/run`;

  try {
    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) as ShubhDinRequest : ({} as ShubhDinRequest);

    // Minimal validation to avoid 500 on backend
    if (!body?.datetime || typeof body.lat !== "number" || typeof body.lon !== "number") {
      return new Response(
        JSON.stringify({ error: "Missing required fields: datetime, lat, lon" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") || "application/json";
    const text = await upstream.text();

    if (!upstream.ok) {
      console.error("[/api/shubhdin] backend error", {
        status: upstream.status,
        url,
        req: JSON.stringify(body).slice(0, 500),
        resp: text.slice(0, 500),
      });
    }

    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[/api/shubhdin] proxy error →", err);
    const message = err instanceof Error ? err.message : "Proxy error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Optional: friendlier GET (so /api/shubhdin in browser is helpful)
export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({ ok: true, hint: "POST JSON here: { datetime, lat, lon, tz? }" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
