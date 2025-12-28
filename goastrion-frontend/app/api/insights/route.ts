// app/api/insights/route.ts

import { backend } from "@/app/lib/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const url = `${backend()}/api/insights`;

  try {
    const bodyText = await req.text();

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyText || "{}",
      cache: "no-store",
    });

    const ct = res.headers.get("content-type") || "application/json";
    const text = await res.text();

    if (!res.ok) {
      // Visible in: sudo journalctl -u goastrion-next -f
      console.error("[/api/insights] backend error", {
        status: res.status,
        url,
        requestBody: bodyText?.slice(0, 500),
        responseBody: text?.slice(0, 500),
      });
    }

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": ct,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[/api/insights] proxy exception →", err);

    const message =
      err instanceof Error ? err.message : "Proxy error";

    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
