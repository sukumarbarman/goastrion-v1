// app/api/charts/route.ts
// This file forwards requests to your Django backend at /api/astro/charts/

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

    // 🔑 Get Authorization header from client request
    const authHeader = req.headers.get("authorization");
    const cookies = req.headers.get("cookie");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Forward Authorization header if present
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Forward cookies if present (for CSRF token)
    if (cookies) {
      headers["Cookie"] = cookies;
    }

    const backendUrl = getBackendUrl();

    console.log("[charts API] POST to:", `${backendUrl}/api/astro/charts/`);
    console.log("[charts API] Has auth:", !!authHeader);

    const res = await fetch(`${backendUrl}/api/astro/charts/`, {
      method: "POST",
      headers,
      body: bodyText || "{}",
      cache: "no-store",
    });

    const ct = res.headers.get("content-type") || "application/json";
    const text = await res.text();

    console.log("[charts API] Backend status:", res.status);

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": ct,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Proxy error";
    console.error("[charts API] Error:", message);

    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const authHeader = req.headers.get("authorization");
    const cookies = req.headers.get("cookie");

    const headers: Record<string, string> = {};

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    if (cookies) {
      headers["Cookie"] = cookies;
    }

    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/astro/charts/`, {
      method: "GET",
      headers,
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
    console.error("[charts API] GET Error:", message);

    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}