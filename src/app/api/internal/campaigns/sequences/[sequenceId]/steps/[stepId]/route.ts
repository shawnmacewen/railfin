import { NextRequest, NextResponse } from "next/server";

import { internalCampaignStepsUpdate } from "../../../../../../../../api/internal/campaigns/contracts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuth } from "../../../../../_auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ sequenceId: string; stepId: string }> }) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;
  const { sequenceId, stepId } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const result = await internalCampaignStepsUpdate({ sequenceId, stepId, body: body ?? undefined });
  const status = !result.ok ? (result.error === "Validation failed" ? 400 : result.error === "Not found" ? 404 : 500) : 200;
  return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
