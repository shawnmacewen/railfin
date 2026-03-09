import { NextRequest, NextResponse } from "next/server";

import { internalCampaignsDetail } from "../../../../../api/internal/campaigns/contracts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuth } from "../../_auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ campaignId: string }> }) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;

  const { campaignId } = await params;
  const result = await internalCampaignsDetail({ campaignId });
  const status = !result.ok ? (result.error === "Not found" ? 404 : 500) : 200;
  return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
