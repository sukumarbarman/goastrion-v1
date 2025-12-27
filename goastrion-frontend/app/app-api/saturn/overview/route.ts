// app/api/saturn/overview/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBackendBase() {
  // prefer explicit envs, but default per environment
  const fallback =
    process.env.NODE_ENV === "production"
      ? "http://127.0.0.1:8001"
      : "http://127.0.0.1:8000";

  const raw =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_BASE ||
    fallback;

  return raw.replace(/\/+$/, "");
}

export async function POST(req: Request) {
  const backend = getBackendBase();
  const url = `${backend}/api/v1/saturn/overview`;

  try {
    const bodyText = await req.text();

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // important in prod to avoid SECURE_SSL_REDIRECT 301
        "X-Forwarded-Proto": "https",
      },
      body: bodyText || "{}",
      cache: "no-store",
      // don't auto-follow to https://127.0.0.1:8001 with invalid cert
      redirect: "manual",
    });

    const contentType = res.headers.get("content-type") || "application/json";
    const text = await res.text();

    if (!res.ok) {
      console.error("[/api/saturn/overview] backend error", {
        status: res.status,
        url,
        body: bodyText?.slice(0, 500),
        resp: text?.slice(0, 500),
      });
    }

    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[/api/saturn/overview] proxy error →", err);
    const message = err instanceof Error ? err.message : "Proxy error";
    return new Response(JSON.stringify({ error: message, backend }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
