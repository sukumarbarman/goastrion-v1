// app/api/auth/change-password/route.ts
import { backend } from "@/app/lib/backend";

export async function POST(req: Request) {
  const body = await req.text();
  const auth = req.headers.get("authorization");

  const res = await fetch(`${backend()}/api/auth/change-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth } : {}),
    },
    body,
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
