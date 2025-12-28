// app/api/chart/route.ts
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBackendUrl(): string {
  const raw = process.env.BACKEND_URL;
  if (!raw) {
    throw new Error("BACKEND_URL is not defined");
  }
  return raw.replace(/\/+$/, "");
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const bodyText = await req.text();

    const authHeader = req.headers.get("authorization");
    const cookies = req.headers.get("cookie");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    if (cookies) {
      headers["Cookie"] = cookies;
    }

    const backendUrl = getBackendUrl();

    const res = await fetch(`${backendUrl}/api/chart`, {
      method: "POST",
      headers,
      body: bodyText || "{}",
      cache: "no-store",
    });

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
    const message = e instanceof Error ? e.message : "Proxy error";
    console.error("[chart API] Error:", message);

    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}