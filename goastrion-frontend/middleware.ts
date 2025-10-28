// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname !== "/") return NextResponse.next();

  const authed =
    req.cookies.get("ga_auth")?.value === "1" ||
    !!req.cookies.get("access")?.value ||
    !!req.cookies.get("refresh")?.value ||
    !!req.cookies.get("sessionid")?.value;

  if (authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/daily";   // 🔁 changed from "/profile" → "/daily"
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/"] };
