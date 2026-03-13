import { NextRequest, NextResponse } from "next/server";

import { applySingleFindingRemediation } from "../../../../../../api/internal/compliance/remediation";
import { putUndoRecordForSession } from "../../../../../../api/internal/compliance/remediation-undo-store";
import { appendDraftRemediationAuditEvent } from "../../../../../../lib/supabase/drafts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuthContext } from "../../../_auth";

type RemediationApplyRequestBody = {
  currentContent?: string;
  findingId?: string;
  finding?: { issue?: string; severity?: string; location?: string; remediationHint?: string };
  draftContextId?: string;
  activeDraftContextId?: string;
};

export async function POST(request: NextRequest) {
  const auth = await requireInternalApiAuthContext(request);
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json().catch(() => ({}))) as RemediationApplyRequestBody;
  const result = applySingleFindingRemediation(body);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error, fieldErrors: result.fieldErrors }, { status: 400, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  putUndoRecordForSession(request.cookies.getAll(), {
    undoToken: result.data.undoToken,
    previousContent: (body.currentContent || "").trim(),
    auditEventId: result.data.audit.id,
    draftContextId: result.data.audit.draftContextId,
    findingId: result.data.audit.findingId,
  });

  await appendDraftRemediationAuditEvent({
    draftId: result.data.audit.draftContextId,
    event: { ...result.data.audit, type: "apply" },
    scope: { ownerId: auth.userId, tenantId: auth.tenantId },
  });
  console.info("[remediation-apply]", result.data.audit);

  return NextResponse.json({ ok: true, data: result.data }, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
