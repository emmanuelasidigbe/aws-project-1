import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Ensure request comes from the same origin (not external)
  const referer = req.headers.get("referer") ?? "";
  const host = req.headers.get("host") ?? "";

  if (!referer.includes(host)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

// Apply middleware only to API routes
export const config = {
  matcher: "/api/:path*",
};
