import { NextRequest, NextResponse } from "next/server";

import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuth } from "../../../_auth";

export async function POST(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  return NextResponse.json(
    {
      ok: false,
      error: "Undo endpoint is disabled. Use the manual single-step UI undo in Create Review Workbench.",
    },
    {
      status: 410,
      headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS,
    },
  );
}
