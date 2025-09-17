// app/api/chart/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // avoid caching in dev

function getBackendBase() {
  // Prefer server-only var; fall back to old name; final fallback to localhost.
  const raw =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_BASE ||
    "http://127.0.0.1:8000";
  return raw.replace(/\/+$/, ""); // strip trailing slash
}

export async function POST(req: Request) {
  const backend = getBackendBase();

  try {
    const bodyText = await req.text(); // pass-through JSON
    const res = await fetch(`${backend}/api/chart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyText || "{}", // be robust if empty
      cache: "no-store",
    });

    // Pass through backend's content-type (some servers return text/json).
    const ct = res.headers.get("content-type") || "application/json";
    const text = await res.text();

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": ct,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    // Helpful debug payload in dev
    return Response.json(
      {
        error: err?.message || "Proxy error",
        backend,
      },
      { status: 500 }
    );
  }
}
