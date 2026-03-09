import { NextRequest, NextResponse } from "next/server";

import { internalCampaignCalendarList } from "../../../../../../api/internal/campaigns/contracts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuth } from "../../../_auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ campaignId: string }> }) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;
  const { campaignId } = await params;
  const result = await internalCampaignCalendarList({ campaignId });
  const status = !result.ok ? 500 : 200;
  return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
