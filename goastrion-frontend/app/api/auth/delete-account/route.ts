// app/api/auth/delete-account/route.ts
import { backend } from "@/app/lib/backend";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");

  const res = await fetch(`${backend()}/api/auth/delete-account/`, {
    method: "POST",
    headers: auth ? { Authorization: auth } : {},
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
