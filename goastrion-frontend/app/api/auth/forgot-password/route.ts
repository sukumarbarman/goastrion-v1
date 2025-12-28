// app/api/auth/forgot-password/route.ts
import { backend } from "@/app/lib/backend";

export async function POST(req: Request) {
  const body = await req.text();
  const res = await fetch(`${backend()}/api/auth/forgot-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
