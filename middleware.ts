import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Placeholder auth/session check:
  // accept either an explicit session cookie or auth token cookie.
  const hasSession =
    Boolean(request.cookies.get("session")?.value) ||
    Boolean(request.cookies.get("auth-token")?.value);

  if (!hasSession) {
    const next = `${pathname}${search}`;
    const loginUrl = new URL(`/login?next=${encodeURIComponent(next)}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
