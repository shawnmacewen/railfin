import { NextResponse } from "next/server";

import {
  getCurrentConfigurePolicy,
  saveConfigurePolicy,
} from "@/api/internal/configure/policy";

type ConfigurePolicyPostBody = {
  policyText?: string;
};

const SENSITIVE_NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

export async function GET() {
  const result = await getCurrentConfigurePolicy();

  if (!result.ok) {
    return NextResponse.json(result, { status: 503, headers: SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: SENSITIVE_NO_STORE_HEADERS });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ConfigurePolicyPostBody;
  const result = await saveConfigurePolicy({ policyText: body.policyText });

  if (!result.ok) {
    const status = result.blocked ? 503 : 400;
    return NextResponse.json(result, { status, headers: SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: SENSITIVE_NO_STORE_HEADERS });
}
