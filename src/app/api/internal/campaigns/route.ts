import { NextRequest, NextResponse } from "next/server";

import { internalCampaignsCreate, internalCampaignsList } from "../../../../api/internal/campaigns/contracts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuth } from "../_auth";

export async function GET(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;

  const result = await internalCampaignsList();
  const status = !result.ok && result.error !== "Validation failed" ? 500 : 200;
  return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}

export async function POST(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as
    | {
        name?: unknown;
        objective?: unknown;
        status?: unknown;
        targeting?: unknown;
        sequences?: unknown;
      }
    | null;

  const result = await internalCampaignsCreate({ body: body ?? undefined });
  if (!result.ok) {
    const status = result.error === "Validation failed" ? 400 : 500;
    return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { status: 201, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
