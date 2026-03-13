import { NextRequest, NextResponse } from "next/server";

import { internalContactsCreate, internalContactsList } from "../../../../../api/internal/crm/contacts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuthContext } from "../../_auth";

export async function GET(request: NextRequest) {
  const auth = await requireInternalApiAuthContext(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const result = await internalContactsList({
    search: searchParams.get("search") ?? undefined,
    stage: searchParams.get("stage") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    scope: { ownerId: auth.userId, tenantId: auth.tenantId },
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 500, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}

export async function POST(request: NextRequest) {
  const auth = await requireInternalApiAuthContext(request);
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json().catch(() => null)) as
    | { fullName?: unknown; primaryEmail?: unknown; primaryPhone?: unknown; source?: unknown; stage?: unknown }
    | null;

  const result = await internalContactsCreate({
    body: body ?? undefined,
    scope: { ownerId: auth.userId, tenantId: auth.tenantId },
  });
  if (!result.ok) {
    const status = result.error === "Validation failed" ? 400 : 500;
    return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { status: 201, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
