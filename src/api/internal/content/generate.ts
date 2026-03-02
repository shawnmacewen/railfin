import { completeWithDeterministicFallback } from "../../../ai/runtime/providerChain";

type ContentType = "blog" | "linkedin" | "newsletter" | "x-thread";

const CONTENT_TYPES: ContentType[] = ["blog", "linkedin", "newsletter", "x-thread"];

type GenerateRequestBody = {
  prompt?: string;
  contentType?: ContentType;
};

type GenerateModelOutput = {
  text: string;
  notes?: string;
};

function isContentType(value: unknown): value is ContentType {
  return typeof value === "string" && CONTENT_TYPES.includes(value as ContentType);
}

function buildGenerationPrompt(input: { prompt: string; contentType: ContentType }): string {
  return [
    "You are a content generation engine for marketing copy.",
    "Return strict JSON only.",
    "Do not include markdown, prose, or code fences.",
    "Output schema:",
    '{"text":"string","notes":"string (optional)"}',
    "Validation requirements:",
    "- text must be non-empty plain text",
    "- notes is optional",
    `Content type: ${input.contentType}`,
    "Prompt:",
    input.prompt,
  ].join("\n");
}

function parseJsonCompletion(completion: string): unknown {
  const cleaned = completion
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned) as unknown;
}

function validateGenerateModelOutput(value: unknown): GenerateModelOutput {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid model output: expected object");
  }

  const candidate = value as { text?: unknown; notes?: unknown };
  const text = typeof candidate.text === "string" ? candidate.text.trim() : "";

  if (!text) {
    throw new Error("Invalid model output: missing text");
  }

  if (candidate.notes !== undefined && typeof candidate.notes !== "string") {
    throw new Error("Invalid model output: notes must be string when present");
  }

  return {
    text,
    notes: typeof candidate.notes === "string" ? candidate.notes.trim() : undefined,
  };
}

function createFallbackDraft(input: { prompt: string; contentType: ContentType }) {
  return {
    id: `gen_${Date.now()}`,
    contentType: input.contentType,
    prompt: input.prompt,
    text: `[fallback-stub:${input.contentType}] ${input.prompt}`,
    status: "placeholder",
    createdAt: new Date().toISOString(),
  };
}

export async function internalContentGenerate(request: {
  method: "POST";
  body?: GenerateRequestBody;
}) {
  const prompt = request.body?.prompt?.trim();

  if (!prompt) {
    return {
      ok: false,
      error: "Missing prompt",
    };
  }

  if (!isContentType(request.body?.contentType)) {
    return {
      ok: false,
      error: "Invalid contentType",
    };
  }

  const contentType = request.body.contentType;
  const runtime = await completeWithDeterministicFallback({
    flow: "content-generate",
    prompt: buildGenerationPrompt({ prompt, contentType }),
  });

  if ("completion" in runtime) {
    try {
      const generated = validateGenerateModelOutput(parseJsonCompletion(runtime.completion));

      return {
        ok: true,
        data: {
          draft: {
            id: `gen_${Date.now()}`,
            contentType,
            prompt,
            text: generated.text,
            status: "placeholder",
            createdAt: new Date().toISOString(),
          },
          generationMeta: {
            provider: runtime.diagnostic.attempts.find((attempt) => attempt.ok)?.provider ?? runtime.diagnostic.primary,
            notes: generated.notes || "Generation completed",
            providerChain: runtime.diagnostic,
          },
        },
      };
    } catch {
      // keep contract stable and degrade safely
    }
  }

  return {
    ok: true,
    data: {
      draft: createFallbackDraft({ prompt, contentType }),
      generationMeta: {
        provider: "fallback",
        notes: "AI generation unavailable or invalid output; fallback response used.",
        providerChain: runtime.diagnostic,
        degraded: true,
      },
    },
  };
}
