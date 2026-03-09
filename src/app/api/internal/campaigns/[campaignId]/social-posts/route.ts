import { NextRequest, NextResponse } from "next/server";

import { internalCampaignSocialPostsCreate, internalCampaignSocialPostsList } from "../../../../../../api/internal/campaigns/contracts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuth } from "../../../_auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ campaignId: string }> }) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;
  const { campaignId } = await params;
  const result = await internalCampaignSocialPostsList({ campaignId });
  const status = !result.ok ? 500 : 200;
  return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ campaignId: string }> }) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;
  const { campaignId } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const result = await internalCampaignSocialPostsCreate({ campaignId, body: body ?? undefined });
  const status = !result.ok ? (result.error === "Validation failed" ? 400 : 500) : 201;
  return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
