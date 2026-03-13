import { NextRequest, NextResponse } from "next/server";

import { internalContactsDelete, internalContactsGet, internalContactsUpdate } from "../../../../../../api/internal/crm/contacts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuthContext } from "../../../_auth";

type ContactBody = { fullName?: unknown; primaryEmail?: unknown; primaryPhone?: unknown; source?: unknown; stage?: unknown };

async function parseBody(request: NextRequest): Promise<ContactBody | undefined> {
  const body = (await request.json().catch(() => null)) as ContactBody | null;
  return body ?? undefined;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ contactId: string }> },
) {
  const auth = await requireInternalApiAuthContext(request);
  if (auth instanceof NextResponse) return auth;

  const params = await context.params;
  const result = await internalContactsGet({
    contactId: params.contactId,
    scope: { ownerId: auth.userId, tenantId: auth.tenantId },
  });

  if (!result.ok) {
    const status = result.error === "Validation failed" ? 400 : result.error === "Contact not found" ? 404 : 500;
    return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ contactId: string }> },
) {
  const auth = await requireInternalApiAuthContext(request);
  if (auth instanceof NextResponse) return auth;

  const params = await context.params;
  const body = await parseBody(request);
  const result = await internalContactsUpdate({
    contactId: params.contactId,
    body,
    scope: { ownerId: auth.userId, tenantId: auth.tenantId },
  });
  if (!result.ok) {
    const status = result.error === "Validation failed" ? 400 : result.error === "Contact not found" ? 404 : 500;
    return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ contactId: string }> },
) {
  return PATCH(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ contactId: string }> },
) {
  const auth = await requireInternalApiAuthContext(request);
  if (auth instanceof NextResponse) return auth;

  const params = await context.params;
  const result = await internalContactsDelete({
    contactId: params.contactId,
    scope: { ownerId: auth.userId, tenantId: auth.tenantId },
  });

  if (!result.ok) {
    const status = result.error === "Validation failed" ? 400 : result.error === "Contact not found" ? 404 : 500;
    return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
