import { NextRequest, NextResponse } from "next/server";

import { internalLeadsCreate, internalLeadsList } from "../../../../../api/internal/crm/leads";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuth } from "../../_auth";

export async function GET(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;

  const result = await internalLeadsList();
  if (!result.ok) {
    return NextResponse.json(result, { status: 500, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}

export async function POST(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as
    | { name?: unknown; email?: unknown; phone?: unknown; source?: unknown; status?: unknown }
    | null;

  const result = await internalLeadsCreate({ body: body ?? undefined });
  if (!result.ok) {
    const status = result.error === "Validation failed" ? 400 : 500;
    return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { status: 201, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
