// app/api/chart/route.ts

import { backend } from "@/app/lib/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // avoid caching

export async function POST(req: Request): Promise<Response> {
  try {
    const bodyText = await req.text(); // pass-through JSON

    const res = await fetch(
      `${backend()}/api/astro/charts/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyText || "{}",
        cache: "no-store",
      }
    );

    const ct = res.headers.get("content-type") || "application/json";
    const text = await res.text();

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": ct,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: unknown) {
    const message =
      e instanceof Error
        ? e.message
        : typeof e === "string"
        ? e
        : "Proxy error";

    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
