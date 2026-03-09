import { NextRequest, NextResponse } from "next/server";

import { internalContactsUpdate } from "../../../../../../api/internal/crm/contacts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuth } from "../../../_auth";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ contactId: string }> },
) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;

  const params = await context.params;
  const body = (await request.json().catch(() => null)) as
    | { fullName?: unknown; primaryEmail?: unknown; primaryPhone?: unknown; source?: unknown; stage?: unknown }
    | null;

  const result = await internalContactsUpdate({ contactId: params.contactId, body: body ?? undefined });
  if (!result.ok) {
    const status = result.error === "Validation failed" ? 400 : result.error === "Contact not found" ? 404 : 500;
    return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
