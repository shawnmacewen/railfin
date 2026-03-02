import { NextRequest, NextResponse } from "next/server";

import { internalContentList } from "../../../../../api/internal/content/list";
import { requireInternalApiAuth, INTERNAL_SENSITIVE_NO_STORE_HEADERS } from "../../_auth";

export async function GET(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? undefined;

  const limitParam = url.searchParams.get("limit");
  const offsetParam = url.searchParams.get("offset");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
  const offset = offsetParam ? Number.parseInt(offsetParam, 10) : undefined;

  const result = await internalContentList({ q, limit, offset });

  if (!result.ok) {
    return NextResponse.json(result, { status: 500, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
