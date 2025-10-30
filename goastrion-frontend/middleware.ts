// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Only handle root path ("/")
  if (req.nextUrl.pathname !== "/") return NextResponse.next();

  const authed =
    req.cookies.get("ga_auth")?.value === "1" ||
    req.cookies.has("access") ||
    req.cookies.has("refresh") ||
    req.cookies.has("sessionid");

  if (authed) {
    // ✅ Use relative URL — avoids localhost redirect
    return NextResponse.redirect(new URL("/daily", req.url));
    // or even simpler:
    // return NextResponse.redirect("/daily");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
