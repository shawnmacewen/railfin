import { NextRequest, NextResponse } from "next/server";

import { internalCampaignStepsCreate, internalCampaignStepsList } from "../../../../../../../api/internal/campaigns/contracts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuth } from "../../../../_auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ sequenceId: string }> }) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;
  const { sequenceId } = await params;
  const result = await internalCampaignStepsList({ sequenceId });
  const status = !result.ok ? 500 : 200;
  return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ sequenceId: string }> }) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;
  const { sequenceId } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const result = await internalCampaignStepsCreate({ sequenceId, body: body ?? undefined });
  const status = !result.ok ? (result.error === "Validation failed" ? 400 : 500) : 201;
  return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
