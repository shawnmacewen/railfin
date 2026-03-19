import { createHash, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { applyUndoToken, RemediationAuditRecord } from "../../../../../../api/internal/compliance/remediation";
import { consumeUndoRecordForSession } from "../../../../../../api/internal/compliance/remediation-undo-store";
import { appendDraftRemediationAuditEvent } from "../../../../../../lib/supabase/drafts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuthContext } from "../../../_auth";

type RemediationUndoRequestBody = { undoToken?: string; currentContent?: string };

function hashSnippet(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 16);
}

export async function POST(request: NextRequest) {
  const auth = await requireInternalApiAuthContext(request);
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json().catch(() => ({}))) as RemediationUndoRequestBody;
  const undoToken = (body.undoToken || "").trim();
  const currentContent = (body.currentContent || "").trim();

  const consumed = consumeUndoRecordForSession(request.cookies.getAll(), undoToken);
  if (!consumed) {
    return NextResponse.json({ ok: false, error: "Undo token is invalid or expired." }, { status: 400, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  const result = applyUndoToken({ undoToken, currentContent }, consumed.previousContent);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error, fieldErrors: result.fieldErrors }, { status: 400, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  const audit: RemediationAuditRecord = {
    id: randomUUID(),
    timestampUtc: new Date().toISOString(),
    actor: "operator-ui",
    draftContextId: consumed.draftContextId || "session-new",
    findingId: consumed.findingId || "unknown",
    beforeHash: hashSnippet(currentContent),
    afterHash: hashSnippet(result.data.nextContent),
    changedChars: result.data.summary.changedChars,
    changedLines: result.data.summary.changedLines,
    outcome: "undone",
    undoLinkId: consumed.auditEventId,
    context: { source: "api/internal/compliance/remediation/undo" },
  };

  await appendDraftRemediationAuditEvent({ draftId: audit.draftContextId, event: { ...audit, type: "undo" }, scope: { ownerUserId: auth.userId } });

  return NextResponse.json({ ok: true, data: { ...result.data, audit } }, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
