// app/api/chart/route.ts
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const backend = process.env.NEXT_PUBLIC_BACKEND_BASE || "http://127.0.0.1:8000";

  const r = await fetch(`${backend}/api/chart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const text = await r.text();
  return new Response(text, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}

