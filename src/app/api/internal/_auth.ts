import { NextRequest, NextResponse } from "next/server";

const SENSITIVE_NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

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

export function requireInternalApiAuth(request: NextRequest): NextResponse | null {
  if (hasInternalSessionCookie(request)) {
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
