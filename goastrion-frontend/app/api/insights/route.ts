// app/api/insights/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBackendBase() {
  const raw =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_BASE ||
    "http://127.0.0.1:8000";
  return raw.replace(/\/+$/, "");
}

export async function POST(req: Request) {
  const backend = getBackendBase();
  const url = `${backend}/api/insights`;

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
        body: bodyText?.slice(0, 500),
        resp: text?.slice(0, 500),
      });
    }

    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": ct, "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[/api/insights] proxy error →", err);
    const message = err instanceof Error ? err.message : "Proxy error";
    return new Response(JSON.stringify({ error: message, backend }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
