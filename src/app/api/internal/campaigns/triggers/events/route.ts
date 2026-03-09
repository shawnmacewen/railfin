import { NextRequest, NextResponse } from "next/server";

import { internalCampaignEventTriggerProcess } from "../../../../../../api/internal/campaigns/contracts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuth } from "../../../_auth";

export async function POST(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as
    | { eventId?: string; contactId?: string; email?: string; triggerType?: "registration_submitted" | "registration_intent"; source?: Record<string, unknown> }
    | null;

  const result = await internalCampaignEventTriggerProcess({ body: body ?? undefined });
  const status = !result.ok ? (result.error === "Validation failed" ? 400 : result.error === "Contact not found" ? 404 : 500) : 202;
  return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
