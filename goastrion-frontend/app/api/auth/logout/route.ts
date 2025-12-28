// app/api/auth/logout/route.ts
import { backend } from "@/app/lib/backend";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  const res = await fetch(`${backend()}/api/auth/logout/`, {
    method: "POST",
    headers: auth ? { Authorization: auth } : {},
  });
  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
