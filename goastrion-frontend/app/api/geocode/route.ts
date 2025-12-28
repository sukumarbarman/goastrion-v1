// app/api/geocode/route.ts

import { backend } from "@/app/lib/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const place = url.searchParams.get("place")?.trim();

  if (!place) {
    return Response.json(
      { error: "missing 'place' query param" },
      { status: 400 }
    );
  }

  const lang = req.headers.get("accept-language") || "en";
  const base = backend();

  // Try v1 first, then legacy backend endpoint
  const targets = [
    `${base}/api/v1/geocode?place=${encodeURIComponent(place)}`,
    `${base}/api/geocode?place=${encodeURIComponent(place)}`,
  ];

  let lastErr: unknown = null;

  for (const t of targets) {
    try {
      const resp = await fetch(t, {
        headers: {
          Accept: "application/json",
          "Accept-Language": lang,
        },
        cache: "no-store",
        redirect: "manual",
      });

      const text = await resp.text();

      // Accept only JSON responses (avoid HTML / redirects)
      const looksJson =
        text.trim().startsWith("{") || text.trim().startsWith("[");

      if (!looksJson) continue;

      const data = JSON.parse(text);

      if (!resp.ok) {
        const msg =
          typeof data?.error === "string"
            ? data.error
            : `HTTP ${resp.status}`;
        throw new Error(msg);
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    } catch (e) {
      lastErr = e;
      // try next target
    }
  }

  const msg =
    lastErr instanceof Error ? lastErr.message : "geocode failed";

  return Response.json(
    { error: msg },
    { status: 502 }
  );
}
