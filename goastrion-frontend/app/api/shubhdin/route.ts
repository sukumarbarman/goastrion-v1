// app/api/shubhdin/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBackendBase(): string {
  const raw = process.env.BACKEND_URL || "http://127.0.0.1:8001"; // Gunicorn port
  return raw.replace(/\/+$/, "");
}

type ShubhDinRequest = {
  datetime: string;
  lat: number;
  lon: number;
  tz?: string;
};

export async function POST(req: Request): Promise<Response> {
  const backend = getBackendBase();
  const url = `${backend}/api/v1/shubhdin/run`;

  // --- NEW: timeout guard ---
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30_000); // 30s

  try {
    const raw = await req.text();
    const body = raw ? (JSON.parse(raw) as ShubhDinRequest) : ({} as ShubhDinRequest);

    if (!body.datetime || typeof body.lat !== "number" || typeof body.lon !== "number") {
      return new Response(JSON.stringify({ error: "Missing required fields: datetime, lat, lon" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: ctrl.signal, // ← NEW
    });

    const contentType = upstream.headers.get("content-type") || "application/json";
    const text = await upstream.text();

    if (!upstream.ok) {
      console.error("[/api/shubhdin] backend error", {
        status: upstream.status, url,
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
    const msg = err instanceof Error ? err.message : "Proxy error";
    const code = String(msg).includes("aborted") ? 504 : 500; // timeout → 504
    return new Response(JSON.stringify({ error: msg }), {
      status: code, headers: { "Content-Type": "application/json" },
    });
  } finally {
    clearTimeout(timer); // ← NEW
  }
}


// Optional: friendly GET so browser shows a hint instead of 405
export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({ ok: true, hint: "POST JSON { datetime, lat, lon, tz } to this endpoint." }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
