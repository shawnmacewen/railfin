import { createHash, randomUUID } from "crypto";

type ApplyRemediationInput = {
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

type UndoRemediationInput = {
  undoToken?: string;
  currentContent?: string;
};

export type RemediationAuditRecord = {
  id: string;
  timestampUtc: string;
  actor: string;
  draftContextId: string;
  findingId: string;
  beforeHash: string;
  afterHash: string;
  changedChars: number;
  changedLines: number;
  outcome: "applied" | "undone" | "failed";
  undoLinkId?: string;
  context?: { source?: string; sessionScope?: string };
};

type ApplyRemediationResult =
  | {
      ok: true;
      data: {
        nextContent: string;
        previousBlock: string | null;
        appliedBlock: string;
        summary: {
          changedChars: number;
          changedLines: number;
          findingId: string;
          draftContextId: string;
        };
        undoToken: string;
        audit: RemediationAuditRecord;
      };
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Array<{ field: string; message: string }>;
    };

type UndoRemediationResult =
  | {
      ok: true;
      data: {
        nextContent: string;
        summary: {
          changedChars: number;
          changedLines: number;
        };
      };
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Array<{ field: string; message: string }>;
    };

const REMEDIATION_BLOCK_START = "[Compliance Remediation Draft Context]";
const REMEDIATION_BLOCK_END = "[/Compliance Remediation Draft Context]";
const MAX_CONTENT_LENGTH = 12000;
const MAX_HINT_LENGTH = 240;
const MAX_ISSUE_LENGTH = 180;
const MAX_LOCATION_LENGTH = 120;
const MAX_CHANGED_CHARS = 1600;
const MAX_CHANGED_LINES = 40;

const SENSITIVE_REGION_HEADERS = ["legal", "disclaimer", "citations", "citation", "references", "sources", "footnotes"];

function sanitize(value: string | undefined, fallback: string, max: number): string {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return fallback;
  }

  return trimmed.slice(0, max);
}

function buildRemediationBlock(input: { issue: string; severity: string; location: string; hint: string }): string {
  return [
    REMEDIATION_BLOCK_START,
    `- Selected issue: ${input.issue}`,
    `- Severity: ${input.severity}`,
    `- Location: ${input.location}`,
    `- Suggested remediation: ${input.hint}`,
    "- Operator note: revise the draft text directly above, then rerun compliance.",
    REMEDIATION_BLOCK_END,
  ].join("\n");
}

function applyControlledRemediationContext(current: string, nextBlock: string) {
  const start = current.indexOf(REMEDIATION_BLOCK_START);
  const end = current.indexOf(REMEDIATION_BLOCK_END);

  if (start !== -1 && end !== -1 && end > start) {
    const endWithMarker = end + REMEDIATION_BLOCK_END.length;
    const previousBlock = current.slice(start, endWithMarker);
    const prefix = current.slice(0, start).trimEnd();
    const suffix = current.slice(endWithMarker).trimStart();

    return {
      nextContent: suffix ? `${prefix}\n\n${nextBlock}\n\n${suffix}` : `${prefix}\n\n${nextBlock}`,
      previousBlock,
      appliedBlock: nextBlock,
    };
  }

  const base = current.trimEnd();
  return {
    nextContent: base ? `${base}\n\n${nextBlock}` : nextBlock,
    previousBlock: null,
    appliedBlock: nextBlock,
  };
}

function countChangedLines(before: string, after: string): number {
  if (before === after) {
    return 0;
  }

  const a = before.split(/\r?\n/);
  const b = after.split(/\r?\n/);

  let prefix = 0;
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) {
    prefix += 1;
  }

  let aTail = a.length - 1;
  let bTail = b.length - 1;
  while (aTail >= prefix && bTail >= prefix && a[aTail] === b[bTail]) {
    aTail -= 1;
    bTail -= 1;
  }

  const changedFromA = Math.max(0, aTail - prefix + 1);
  const changedFromB = Math.max(0, bTail - prefix + 1);
  return Math.max(changedFromA, changedFromB);
}

function countChangedChars(before: string, after: string): number {
  if (before === after) {
    return 0;
  }

  let prefix = 0;
  while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) {
    prefix += 1;
  }

  let beforeTail = before.length - 1;
  let afterTail = after.length - 1;
  while (beforeTail >= prefix && afterTail >= prefix && before[beforeTail] === after[afterTail]) {
    beforeTail -= 1;
    afterTail -= 1;
  }

  const changedFromBefore = Math.max(0, beforeTail - prefix + 1);
  const changedFromAfter = Math.max(0, afterTail - prefix + 1);
  return Math.max(changedFromBefore, changedFromAfter);
}

function extractSensitiveRegions(content: string): string {
  const lines = content.split(/\r?\n/);
  const selected: string[] = [];

  lines.forEach((line, index) => {
    const normalized = line.trim().toLowerCase();
    const isHeader = /^#{1,6}\s+/.test(normalized);
    const hasKeyword = SENSITIVE_REGION_HEADERS.some((keyword) => normalized.includes(keyword));

    if (isHeader && hasKeyword) {
      selected.push(`${index}:${normalized}`);
    }

    if (!isHeader && hasKeyword && /\b(disclaimer|citation|legal notice|references|sources|footnotes)\b/.test(normalized)) {
      selected.push(`${index}:${normalized}`);
    }
  });

  return selected.join("\n");
}

function hashSnippet(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 16);
}

export function createUndoToken(): string {
  return randomUUID();
}

export function applyUndoToken(input: UndoRemediationInput, previousContent: string): UndoRemediationResult {
  const undoToken = (input.undoToken || "").trim();
  const currentContent = (input.currentContent || "").trim();

  const fieldErrors: Array<{ field: string; message: string }> = [];

  if (!undoToken) {
    fieldErrors.push({ field: "undoToken", message: "undoToken is required." });
  }

  if (!currentContent) {
    fieldErrors.push({ field: "currentContent", message: "currentContent is required." });
  }

  if (fieldErrors.length) {
    return { ok: false, error: "Validation failed", fieldErrors };
  }

  const changedChars = countChangedChars(currentContent, previousContent);
  const changedLines = countChangedLines(currentContent, previousContent);

  return {
    ok: true,
    data: {
      nextContent: previousContent,
      summary: {
        changedChars,
        changedLines,
      },
    },
  };
}

export function applySingleFindingRemediation(input: ApplyRemediationInput): ApplyRemediationResult {
  const currentContent = (input.currentContent || "").trim();
  const findingId = (input.findingId || "").trim();
  const draftContextId = (input.draftContextId || "").trim();
  const activeDraftContextId = (input.activeDraftContextId || "").trim();

  const fieldErrors: Array<{ field: string; message: string }> = [];

  if (!currentContent) {
    fieldErrors.push({ field: "currentContent", message: "currentContent is required." });
  }

  if (!findingId) {
    fieldErrors.push({ field: "findingId", message: "findingId is required." });
  }

  if (!draftContextId) {
    fieldErrors.push({ field: "draftContextId", message: "draftContextId is required." });
  }

  if (!activeDraftContextId) {
    fieldErrors.push({ field: "activeDraftContextId", message: "activeDraftContextId is required." });
  }

  if (draftContextId && activeDraftContextId && draftContextId !== activeDraftContextId) {
    fieldErrors.push({
      field: "draftContextId",
      message: "draftContextId must match activeDraftContextId for current-context apply.",
    });
  }

  if (currentContent.length > MAX_CONTENT_LENGTH) {
    fieldErrors.push({
      field: "currentContent",
      message: `currentContent must be ${MAX_CONTENT_LENGTH} characters or fewer.`,
    });
  }

  if (fieldErrors.length) {
    return { ok: false, error: "Validation failed", fieldErrors };
  }

  const safeHint = sanitize(input.finding?.remediationHint, "Add a compliant revision and rerun the check.", MAX_HINT_LENGTH);
  const safeIssue = sanitize(input.finding?.issue, "unknown issue", MAX_ISSUE_LENGTH);
  const safeSeverity = sanitize(input.finding?.severity, "unknown", 24).toLowerCase();
  const safeLocation = sanitize(input.finding?.location, "unknown:0:0", MAX_LOCATION_LENGTH);

  const remediationBlock = buildRemediationBlock({
    issue: safeIssue,
    severity: safeSeverity,
    location: safeLocation,
    hint: safeHint,
  });

  const result = applyControlledRemediationContext(currentContent, remediationBlock);
  const changedChars = countChangedChars(currentContent, result.nextContent);
  const changedLines = countChangedLines(currentContent, result.nextContent);

  if (changedChars > MAX_CHANGED_CHARS || changedLines > MAX_CHANGED_LINES) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: [
        {
          field: "currentContent",
          message: `Bounded edit limit exceeded (max ${MAX_CHANGED_CHARS} chars / ${MAX_CHANGED_LINES} lines).`,
        },
      ],
    };
  }

  const beforeSensitive = extractSensitiveRegions(currentContent);
  const afterSensitive = extractSensitiveRegions(result.nextContent);
  if (beforeSensitive !== afterSensitive) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: [
        {
          field: "currentContent",
          message: "Prohibited transform detected in legal/disclaimer/citation-sensitive regions.",
        },
      ],
    };
  }

  const timestampUtc = new Date().toISOString();
  const undoToken = createUndoToken();
  const audit: RemediationAuditRecord = {
    id: randomUUID(),
    timestampUtc,
    actor: "operator-ui",
    draftContextId,
    findingId,
    beforeHash: hashSnippet(currentContent),
    afterHash: hashSnippet(result.nextContent),
    changedChars,
    changedLines,
    outcome: "applied",
    undoLinkId: undoToken,
    context: { source: "api/internal/compliance/remediation/apply" },
  };

  return {
    ok: true,
    data: {
      nextContent: result.nextContent,
      previousBlock: result.previousBlock,
      appliedBlock: result.appliedBlock,
      summary: {
        changedChars,
        changedLines,
        findingId,
        draftContextId,
      },
      undoToken,
      audit,
    },
  };
}
