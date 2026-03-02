import { NextRequest, NextResponse } from "next/server";

import { applySingleFindingRemediation } from "../../../../../../api/internal/compliance/remediation";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuth } from "../../../_auth";

type RemediationApplyRequestBody = {
  currentContent?: string;
  findingId?: string;
  finding?: {
    issue?: string;
    severity?: string;
    location?: string;
    remediationHint?: string;
  };
  draftContextId?: string;
  activeDraftContextId?: string;
};

export async function POST(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  const body = (await request.json().catch(() => ({}))) as RemediationApplyRequestBody;
  const result = applySingleFindingRemediation(body);

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        fieldErrors: result.fieldErrors,
      },
      {
        status: 400,
        headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS,
      },
    );
  }

  console.info("[remediation-apply]", result.data.audit);

  return NextResponse.json(
    {
      ok: true,
      data: result.data,
    },
    {
      headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS,
    },
  );
}
