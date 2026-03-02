import { createHash } from "crypto";

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
        audit: {
          timestampUtc: string;
          actor: string;
          draftContextId: string;
          findingId: string;
          beforeHash: string;
          afterHash: string;
          changedChars: number;
          changedLines: number;
          outcome: "applied";
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

    return {
      nextContent: `${prefix}\n\n${nextBlock}`,
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

function estimateChangedLines(before: string, after: string): number {
  if (before === after) {
    return 0;
  }

  const a = before.split(/\r?\n/);
  const b = after.split(/\r?\n/);
  const maxLen = Math.max(a.length, b.length);
  let changed = 0;

  for (let i = 0; i < maxLen; i += 1) {
    if ((a[i] || "") !== (b[i] || "")) {
      changed += 1;
    }
  }

  return changed;
}

function hashSnippet(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 16);
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
  const changedChars = Math.abs(result.nextContent.length - currentContent.length);
  const changedLines = estimateChangedLines(currentContent, result.nextContent);

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

  const timestampUtc = new Date().toISOString();
  const audit = {
    timestampUtc,
    actor: "operator-ui",
    draftContextId,
    findingId,
    beforeHash: hashSnippet(currentContent),
    afterHash: hashSnippet(result.nextContent),
    changedChars,
    changedLines,
    outcome: "applied" as const,
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
      audit,
    },
  };
}
