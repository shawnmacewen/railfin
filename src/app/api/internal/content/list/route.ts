import { NextRequest, NextResponse } from "next/server";

import { internalContentList } from "../../../../../api/internal/content/list";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuthContext } from "../../_auth";

export async function GET(request: NextRequest) {
  const auth = await requireInternalApiAuthContext(request);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? undefined;
  const limitParam = url.searchParams.get("limit");
  const offsetParam = url.searchParams.get("offset");

  const result = await internalContentList({
    q,
    limit: limitParam ? Number.parseInt(limitParam, 10) : undefined,
    offset: offsetParam ? Number.parseInt(offsetParam, 10) : undefined,
    scope: { ownerUserId: auth.userId },
  });

  if (!result.ok) return NextResponse.json(result, { status: 500, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
