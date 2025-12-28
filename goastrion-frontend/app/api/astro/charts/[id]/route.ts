// app/api/astro/charts/[id]/route.ts

import type { NextRequest } from "next/server";
import { backend } from "@/app/lib/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --------------------------------------------------
// Helpers
// --------------------------------------------------
function passHeaders(req: NextRequest): Headers {
  const h = new Headers();
  const auth = req.headers.get("authorization");
  if (auth) h.set("authorization", auth);
  return h;
}

async function passthrough(res: Response): Promise<Response> {
  const ct = res.headers.get("content-type") || "application/json";
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: {
      "content-type": ct,
      "cache-control": "no-store",
    },
  });
}

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return "Proxy error";
  }
}

// --------------------------------------------------
// DELETE /api/astro/charts/[id]
// --------------------------------------------------
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await ctx.params; // ✅ Next.js 15 params Promise

    const res = await fetch(
      `${backend()}/api/astro/charts/${encodeURIComponent(id)}/`,
      {
        method: "DELETE",
        headers: passHeaders(req),
        cache: "no-store",
      }
    );

    return passthrough(res);
  } catch (e: unknown) {
    return Response.json({ error: errMsg(e) }, { status: 500 });
  }
}
