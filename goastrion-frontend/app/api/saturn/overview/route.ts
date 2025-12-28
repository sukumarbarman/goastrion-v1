// app/api/saturn/overview/route.ts

import { backend } from "@/app/lib/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const url = `${backend()}/api/v1/saturn/overview`;

  try {
    const bodyText = await req.text();

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Required in prod when Django has SECURE_SSL_REDIRECT enabled
        "X-Forwarded-Proto": "https",
      },
      body: bodyText || "{}",
      cache: "no-store",
      // Prevent redirect to https://127.0.0.1 with invalid cert
      redirect: "manual",
    });

    const contentType =
      res.headers.get("content-type") || "application/json";
    const text = await res.text();

    if (!res.ok) {
      console.error("[/api/saturn/overview] backend error", {
        status: res.status,
        url,
        requestBody: bodyText?.slice(0, 500),
        responseBody: text?.slice(0, 500),
      });
    }

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[/api/saturn/overview] proxy exception →", err);

    const message =
      err instanceof Error ? err.message : "Proxy error";

    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
