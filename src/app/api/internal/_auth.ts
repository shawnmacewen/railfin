import { NextRequest, NextResponse } from "next/server";

const SENSITIVE_NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

const INTERNAL_API_AUTH_COMPAT_MODE = process.env.INTERNAL_API_AUTH_COMPAT_MODE !== "off";

function hasInternalSessionCookie(request: NextRequest): boolean {
  if (Boolean(request.cookies.get("session")?.value) || Boolean(request.cookies.get("auth-token")?.value)) {
    return true;
  }

  const cookieNames = request.cookies.getAll().map((cookie) => cookie.name);

  return cookieNames.some((name) => {
    if (name === "sb-access-token" || name === "sb-refresh-token") {
      return true;
    }

    return /^sb-[^-]+-auth-token(?:\.\d+)?$/.test(name);
  });
}

function isTrustedSameOriginRequest(request: NextRequest): boolean {
  const requestOrigin = request.nextUrl.origin;
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");
  const secFetchSite = request.headers.get("sec-fetch-site");

  const originMatches = originHeader === requestOrigin;
  const refererMatches = Boolean(refererHeader && refererHeader.startsWith(`${requestOrigin}/`));

  const sameOriginOrSite = secFetchSite === "same-origin" || secFetchSite === "same-site";

  return (originMatches || refererMatches) && sameOriginOrSite;
}

export function requireInternalApiAuth(request: NextRequest): NextResponse | null {
  if (hasInternalSessionCookie(request)) {
    return null;
  }

  if (INTERNAL_API_AUTH_COMPAT_MODE && isTrustedSameOriginRequest(request)) {
    return null;
  }

  return NextResponse.json(
    {
      ok: false,
      error: "Unauthorized",
    },
    {
      status: 401,
      headers: SENSITIVE_NO_STORE_HEADERS,
    },
  );
}

export const INTERNAL_SENSITIVE_NO_STORE_HEADERS = SENSITIVE_NO_STORE_HEADERS;
