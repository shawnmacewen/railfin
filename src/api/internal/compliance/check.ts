type ComplianceSeverity = "low" | "medium" | "high";

type ComplianceCheckRequestBody = {
  content?: string;
  contentType?: "blog" | "linkedin" | "newsletter" | "x-thread";
  policySet?: string;
};

type ComplianceFinding = {
  severity: ComplianceSeverity;
  issue: string;
  details: string;
  suggestion: string;
  location: {
    start: number;
    end: number;
    excerpt?: string;
  };
};

export async function internalComplianceCheck(request: {
  method: "POST";
  body?: ComplianceCheckRequestBody;
}) {
  const content = request.body?.content?.trim();

  if (!content) {
    return {
      ok: false,
      error: "Missing content",
    };
  }

  const findings: ComplianceFinding[] = [
    {
      severity: "low",
      issue: "stub-only",
      details: "Compliance check endpoint is currently a placeholder scaffold.",
      suggestion: "Wire real policy evaluation logic in a future task.",
      location: {
        start: 0,
        end: Math.min(content.length, 32),
        excerpt: content.slice(0, 32),
      },
    },
  ];

  return {
    ok: true,
    data: {
      contentLength: content.length,
      policySet: request.body?.policySet ?? "default",
      findings,
      status: "placeholder",
      checkedAt: new Date().toISOString(),
    },
  };
}
