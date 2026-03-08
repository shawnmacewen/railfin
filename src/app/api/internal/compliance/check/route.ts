import { NextRequest, NextResponse } from "next/server";
import { getCurrentConfigurePolicy } from "../../../../../api/internal/configure/policy";
import { completeWithDeterministicFallback } from "../../../../../ai/runtime/providerChain";
import { requireInternalApiAuth, INTERNAL_SENSITIVE_NO_STORE_HEADERS } from "../../_auth";

type RawFinding = {
  severity?: string;
  issue?: string;
  details?: string;
  suggestion?: string;
  location?: unknown;
  file?: unknown;
  source?: unknown;
  section?: unknown;
  line?: unknown;
  column?: unknown;
};

type ComplianceFinding = {
  severity: string;
  issue: string;
  details: string;
  suggestion: string;
  location: string;
  locationLabel: string | null;
};

type ComplianceRequestBody = {
  content?: string;
  contentType?: "blog" | "linkedin" | "newsletter" | "x-thread";
  policySet?: string;
};

const CONTENT_TYPES = ["blog", "linkedin", "newsletter", "x-thread"] as const;
const MAX_COMPLIANCE_CONTENT_LENGTH = 12000;
const MAX_POLICY_SET_LENGTH = 80;

function isContentType(value: unknown): value is ComplianceRequestBody["contentType"] {
  return typeof value === "string" && CONTENT_TYPES.includes(value as (typeof CONTENT_TYPES)[number]);
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function normalizePositiveInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const normalized = Math.max(0, Math.trunc(value));
  return normalized > 0 ? normalized : null;
}

function isUnknownLocationLabel(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;

  return ["unknown", "unknown:0:0", "n/a", "na", "none", "null"].includes(normalized);
}

function formatLocationLabel(parts: {
  source?: string | null;
  section?: string | null;
  line?: number | null;
  column?: number | null;
}): string | null {
  const source = parts.source?.trim() || null;
  const section = parts.section?.trim() || null;
  const line = parts.line ?? null;
  const column = parts.column ?? null;

  const hasCoordinates = line !== null;
  const lineAndColumn = hasCoordinates
    ? `${line}${column !== null ? `:${column}` : ""}`
    : null;

  if (source && lineAndColumn) {
    return `${source}:${lineAndColumn}`;
  }

  if (source && section) {
    return `${source} (${section})`;
  }

  if (source) {
    return source;
  }

  if (section && lineAndColumn) {
    return `${section}:${lineAndColumn}`;
  }

  if (section) {
    return section;
  }

  return lineAndColumn;
}

function normalizeLocation(input: RawFinding): string | null {
  const locationText = normalizeString(input.location);
  if (locationText && !isUnknownLocationLabel(locationText)) {
    return locationText;
  }

  const objectLocation = input.location && typeof input.location === "object"
    ? (input.location as {
        file?: unknown;
        path?: unknown;
        source?: unknown;
        section?: unknown;
        line?: unknown;
        column?: unknown;
      })
    : null;

  const source =
    normalizeString(objectLocation?.file) ||
    normalizeString(objectLocation?.path) ||
    normalizeString(objectLocation?.source) ||
    normalizeString(input.file) ||
    normalizeString(input.source);

  const section = normalizeString(objectLocation?.section) || normalizeString(input.section);
  const line = normalizePositiveInt(objectLocation?.line) ?? normalizePositiveInt(input.line);
  const column = normalizePositiveInt(objectLocation?.column) ?? normalizePositiveInt(input.column);

  const formatted = formatLocationLabel({ source, section, line, column });
  return formatted && !isUnknownLocationLabel(formatted) ? formatted : null;
}

function normalizeFinding(input: RawFinding): ComplianceFinding {
  const normalizedLocation = normalizeLocation(input);

  return {
    severity: (input.severity || "unknown").trim() || "unknown",
    issue: (input.issue || "Unknown issue").trim() || "Unknown issue",
    details: (input.details || "No details provided.").trim() || "No details provided.",
    suggestion:
      (input.suggestion || "No suggestion provided.").trim() ||
      "No suggestion provided.",
    location: normalizedLocation || "",
    locationLabel: normalizedLocation,
  };
}

function parseFindingsFromCompletion(completion: string): RawFinding[] {
  const cleaned = completion
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as {
    findings?: unknown;
  };

  if (!Array.isArray(parsed.findings)) {
    return [];
  }

  return parsed.findings.filter((item): item is RawFinding => {
    return !!item && typeof item === "object";
  });
}


function buildComplianceFallbackDetails(errorKind?: string): string {
  if (errorKind === "provider_config") {
    return "AI compliance providers are unavailable due to missing/invalid credentials. Check OPENAI_API_KEY runtime config.";
  }

  return "AI compliance providers were unavailable or returned invalid output. Returning safe fallback output.";
}

function buildCompliancePrompt(input: {
  content: string;
  contentType: string;
  policySet: string;
  policyText: string;
}): string {
  return [
    "You are a compliance review engine for marketing content.",
    "Analyze the content and return strict JSON only.",
    "Do not include markdown, prose, or code fences.",
    "Output schema:",
    '{"findings":[{"severity":"low|medium|high|unknown","issue":"string","details":"string","suggestion":"string","location":"optional location label","source":"optional source/file","section":"optional section","line":"optional number","column":"optional number"}]}',
    "If there are no issues, return {\"findings\":[]}",
    `Policy set: ${input.policySet}`,
    `Content type: ${input.contentType}`,
    "Latest configure policy guidance:",
    input.policyText,
    "Content:",
    input.content,
  ].join("\n");
}

export async function POST(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  const body = (await request.json().catch(() => ({}))) as ComplianceRequestBody;
  const content = body.content?.trim() ?? "";

  if (!content) {
    return NextResponse.json(
      { ok: false, error: "Missing content" },
      { status: 400, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS },
    );
  }

  if (content.length > MAX_COMPLIANCE_CONTENT_LENGTH) {
    return NextResponse.json(
      {
        ok: false,
        error: "Validation failed",
        fieldErrors: [
          {
            field: "content",
            message: `Content must be ${MAX_COMPLIANCE_CONTENT_LENGTH} characters or fewer.`,
          },
        ],
      },
      { status: 400, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS },
    );
  }

  if (body.contentType !== undefined && !isContentType(body.contentType)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Validation failed",
        fieldErrors: [
          {
            field: "contentType",
            message: "contentType must be one of: blog, linkedin, newsletter, x-thread.",
          },
        ],
      },
      { status: 400, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS },
    );
  }

  const normalizedPolicySet = (body.policySet ?? "default").trim() || "default";

  if (normalizedPolicySet.length > MAX_POLICY_SET_LENGTH) {
    return NextResponse.json(
      {
        ok: false,
        error: "Validation failed",
        fieldErrors: [
          {
            field: "policySet",
            message: `policySet must be ${MAX_POLICY_SET_LENGTH} characters or fewer.`,
          },
        ],
      },
      { status: 400, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS },
    );
  }

  const policyResponse = await getCurrentConfigurePolicy();
  const policyText = policyResponse.ok ? policyResponse.data.policyText.trim() : "";

  const prompt = buildCompliancePrompt({
    content,
    contentType: body.contentType ?? "blog",
    policySet: normalizedPolicySet,
    policyText,
  });

  const runtime = await completeWithDeterministicFallback({
    flow: "compliance-check",
    prompt,
  });

  if ("completion" in runtime) {
    try {
      const findings = parseFindingsFromCompletion(runtime.completion).map(normalizeFinding);

      return NextResponse.json(
        {
          ok: true,
          findings,
          meta: {
            providerChain: runtime.diagnostic,
          },
        },
        { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS },
      );
    } catch {
      // Keep service contract stable while preserving failure diagnostics metadata.
    }
  }

  const safeFallbackFindings: ComplianceFinding[] = [
    {
      severity: "unknown",
      issue: "Compliance scan unavailable",
      details:
        buildComplianceFallbackDetails(runtime.diagnostic.attempts[0]?.errorKind),
      suggestion: "Retry shortly or review content manually before publishing.",
      location: "",
      locationLabel: null,
    },
  ];

  return NextResponse.json(
    {
      ok: true,
      findings: safeFallbackFindings,
      meta: {
        providerChain: runtime.diagnostic,
        degraded: true,
      },
    },
    { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS },
  );
}
