import { NextRequest, NextResponse } from "next/server";

import { internalContactsCreate, internalContactsList } from "../../../../../api/internal/crm/contacts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuth } from "../../_auth";

export async function GET(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const result = await internalContactsList({
    search: searchParams.get("search") ?? undefined,
    stage: searchParams.get("stage") ?? undefined,
    source: searchParams.get("source") ?? undefined,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 500, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}

export async function POST(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as
    | { fullName?: unknown; primaryEmail?: unknown; primaryPhone?: unknown; source?: unknown; stage?: unknown }
    | null;

  const result = await internalContactsCreate({ body: body ?? undefined });
  if (!result.ok) {
    const status = result.error === "Validation failed" ? 400 : 500;
    return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { status: 201, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
