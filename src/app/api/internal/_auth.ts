import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const SENSITIVE_NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

const INTERNAL_API_AUTH_COMPAT_MODE = process.env.INTERNAL_API_AUTH_COMPAT_MODE !== "off";
const DEFAULT_COMPAT_OWNER_ID = process.env.INTERNAL_API_DEFAULT_OWNER_ID ?? "legacy-owner";
const DEFAULT_COMPAT_TENANT_ID = process.env.INTERNAL_API_DEFAULT_TENANT_ID ?? "legacy-tenant";

export type InternalApiAuthContext = {
  userId: string;
  tenantId: string;
  source: "supabase-jwt" | "compat";
};

function getAccessTokenFromRequest(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization") ?? "";
  if (authorization.toLowerCase().startsWith("bearer ")) {
    const token = authorization.slice(7).trim();
    if (token) return token;
  }

  const cookieToken = request.cookies.get("sb-access-token")?.value;
  if (cookieToken) return cookieToken;

  return null;
}

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

function createUnauthorizedResponse(): NextResponse {
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

async function resolveSupabaseUser(request: NextRequest): Promise<InternalApiAuthContext | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = getAccessTokenFromRequest(request);

  if (!supabaseUrl || !anonKey || !token) {
    return null;
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.id) {
    return null;
  }

  const tenantId =
    typeof data.user.app_metadata?.tenant_id === "string" && data.user.app_metadata.tenant_id.trim()
      ? data.user.app_metadata.tenant_id
      : data.user.id;

  return {
    userId: data.user.id,
    tenantId,
    source: "supabase-jwt",
  };
}

export async function requireInternalApiAuthContext(request: NextRequest): Promise<InternalApiAuthContext | NextResponse> {
  const resolvedUser = await resolveSupabaseUser(request);
  if (resolvedUser) {
    return resolvedUser;
  }

  if (INTERNAL_API_AUTH_COMPAT_MODE && hasInternalSessionCookie(request) && isTrustedSameOriginRequest(request)) {
    return {
      userId: DEFAULT_COMPAT_OWNER_ID,
      tenantId: DEFAULT_COMPAT_TENANT_ID,
      source: "compat",
    };
  }

  return createUnauthorizedResponse();
}

export function requireInternalApiAuth(request: NextRequest): NextResponse | null {
  if (hasInternalSessionCookie(request)) {
    return null;
  }

  if (INTERNAL_API_AUTH_COMPAT_MODE && isTrustedSameOriginRequest(request)) {
    return null;
  }

  return createUnauthorizedResponse();
}

export const INTERNAL_SENSITIVE_NO_STORE_HEADERS = SENSITIVE_NO_STORE_HEADERS;
