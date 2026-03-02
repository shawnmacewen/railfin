import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentConfigurePolicy,
  saveConfigurePolicy,
} from "../../../../../api/internal/configure/policy";
import { requireInternalApiAuth, INTERNAL_SENSITIVE_NO_STORE_HEADERS } from "../../_auth";

type ConfigurePolicyPostBody = {
  policyText?: string;
};

export async function GET(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  const result = await getCurrentConfigurePolicy();

  if (!result.ok) {
    return NextResponse.json(result, { status: 503, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}

export async function POST(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  const body = (await request.json().catch(() => ({}))) as ConfigurePolicyPostBody;
  const result = await saveConfigurePolicy({ policyText: body.policyText });

  if (!result.ok) {
    const status = result.blocked ? 503 : 400;
    return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
