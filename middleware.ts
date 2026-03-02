import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Placeholder auth/session check:
  // accept legacy cookies plus common Supabase auth cookie names.
  const hasLegacySessionCookie =
    Boolean(request.cookies.get("session")?.value) ||
    Boolean(request.cookies.get("auth-token")?.value);

  const hasSupabaseSessionCookie = request.cookies.getAll().some((cookie) => {
    if (cookie.name === "sb-access-token" || cookie.name === "sb-refresh-token") {
      return true;
    }

    return /^sb-[^-]+-auth-token(?:\.\d+)?$/.test(cookie.name);
  });

  const hasSession = hasLegacySessionCookie || hasSupabaseSessionCookie;

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
