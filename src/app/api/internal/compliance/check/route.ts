import { NextResponse } from "next/server";
import { CodexProvider } from "../../../../../ai/providers/CodexProvider";
import { ChatGPTApiProvider } from "../../../../../ai/providers/ChatGPTApiProvider";
import { getAIProviderFromEnv, type AIProviderName } from "../../../../../config/aiProvider";

type RawFinding = {
  severity?: string;
  issue?: string;
  details?: string;
  suggestion?: string;
  location?: unknown;
};

type ComplianceFinding = {
  severity: string;
  issue: string;
  details: string;
  suggestion: string;
  location: string;
};

type ProviderAttempt = {
  name: "codex" | "chatgpt-api";
  complete: (prompt: string) => Promise<string>;
};

type ComplianceRequestBody = {
  content?: string;
  contentType?: "blog" | "linkedin" | "newsletter" | "x-thread";
  policySet?: string;
};

function normalizeLocation(location: unknown): string {
  if (typeof location === "string") {
    const trimmed = location.trim();
    return trimmed || "unknown:0:0";
  }

  if (location && typeof location === "object") {
    const asObject = location as {
      file?: unknown;
      line?: unknown;
      column?: unknown;
    };

    const file =
      typeof asObject.file === "string" && asObject.file.trim()
        ? asObject.file.trim()
        : "unknown";
    const line =
      typeof asObject.line === "number" && Number.isFinite(asObject.line)
        ? Math.max(0, Math.trunc(asObject.line))
        : 0;
    const column =
      typeof asObject.column === "number" && Number.isFinite(asObject.column)
        ? Math.max(0, Math.trunc(asObject.column))
        : 0;

    return `${file}:${line}:${column}`;
  }

  return "unknown:0:0";
}

function normalizeFinding(input: RawFinding): ComplianceFinding {
  return {
    severity: (input.severity || "unknown").trim() || "unknown",
    issue: (input.issue || "Unknown issue").trim() || "Unknown issue",
    details: (input.details || "No details provided.").trim() || "No details provided.",
    suggestion:
      (input.suggestion || "No suggestion provided.").trim() ||
      "No suggestion provided.",
    location: normalizeLocation(input.location),
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

function buildCompliancePrompt(input: {
  content: string;
  contentType: string;
  policySet: string;
}): string {
  return [
    "You are a compliance review engine for marketing content.",
    "Analyze the content and return strict JSON only.",
    "Do not include markdown, prose, or code fences.",
    "Output schema:",
    '{"findings":[{"severity":"low|medium|high|unknown","issue":"string","details":"string","suggestion":"string","location":"file:line:column or unknown:0:0"}]}',
    "If there are no issues, return {\"findings\":[]}",
    `Policy set: ${input.policySet}`,
    `Content type: ${input.contentType}`,
    "Content:",
    input.content,
  ].join("\n");
}

async function runProviderChain(prompt: string): Promise<{ findings: RawFinding[] }> {
  const primaryName =
    ((process.env.AI_PROVIDER as AIProviderName | undefined) ?? "codex") === "chatgpt-api"
      ? "chatgpt-api"
      : "codex";

  const primaryProvider = getAIProviderFromEnv({
    ...process.env,
    AI_PROVIDER: primaryName,
  });

  const fallbackProvider =
    primaryName === "codex" ? new ChatGPTApiProvider() : new CodexProvider();

  const attempts: ProviderAttempt[] = [
    {
      name: primaryName,
      complete: (inputPrompt) => primaryProvider.complete(inputPrompt),
    },
    {
      name: primaryName === "codex" ? "chatgpt-api" : "codex",
      complete: (inputPrompt) => fallbackProvider.complete(inputPrompt),
    },
  ];

  let lastError: unknown = null;

  for (const attempt of attempts) {
    try {
      const completion = await attempt.complete(prompt);
      const findings = parseFindingsFromCompletion(completion);
      return { findings };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Compliance provider chain failed.");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ComplianceRequestBody;
  const content = body.content?.trim() ?? "";

  if (!content) {
    return NextResponse.json({ ok: false, error: "Missing content" }, { status: 400 });
  }

  const prompt = buildCompliancePrompt({
    content,
    contentType: body.contentType ?? "blog",
    policySet: body.policySet ?? "default",
  });

  try {
    const { findings: rawFindings } = await runProviderChain(prompt);
    const findings = rawFindings.map(normalizeFinding);
    return NextResponse.json({ ok: true, findings });
  } catch {
    const safeFallbackFindings: ComplianceFinding[] = [
      {
        severity: "unknown",
        issue: "Compliance scan unavailable",
        details:
          "AI compliance providers were unavailable or timed out. Returning safe fallback output.",
        suggestion: "Retry shortly or review content manually before publishing.",
        location: "unknown:0:0",
      },
    ];

    return NextResponse.json({ ok: true, findings: safeFallbackFindings });
  }
}
