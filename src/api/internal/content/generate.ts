import { completeWithDeterministicFallback } from "../../../ai/runtime/providerChain";

type ContentType = "blog" | "linkedin" | "newsletter" | "x-thread";

const CONTENT_TYPES: ContentType[] = ["blog", "linkedin", "newsletter", "x-thread"];
const MAX_PROMPT_LENGTH = 12000;

type GenerateTemplateId = "default" | "conversion";

type GenerateRequestBody = {
  prompt?: string;
  contentType?: ContentType;
  template?: GenerateTemplateId;
};

type GenerateModelOutput = {
  text: string;
  notes?: string;
};

type GenerationTemplate = {
  id: GenerateTemplateId;
  label: string;
  guidance: string[];
};

const GENERATION_TEMPLATES: Record<GenerateTemplateId, GenerationTemplate> = {
  default: {
    id: "default",
    label: "Baseline Draft",
    guidance: [
      "Produce clear, on-brand marketing copy suitable for first-pass editing.",
      "Use concise structure and avoid unverifiable claims.",
    ],
  },
  conversion: {
    id: "conversion",
    label: "Conversion Focus",
    guidance: [
      "Optimize for action and conversion while staying factual and compliant.",
      "Include one clear call-to-action and emphasize audience value.",
    ],
  },
};

const DEFAULT_TEMPLATE: GenerateTemplateId = "default";

function isContentType(value: unknown): value is ContentType {
  return typeof value === "string" && CONTENT_TYPES.includes(value as ContentType);
}

function isGenerateTemplateId(value: unknown): value is GenerateTemplateId {
  return typeof value === "string" && value in GENERATION_TEMPLATES;
}

function resolveTemplate(value: unknown): GenerationTemplate | null {
  if (value === undefined) {
    return GENERATION_TEMPLATES[DEFAULT_TEMPLATE];
  }

  if (!isGenerateTemplateId(value)) {
    return null;
  }

  return GENERATION_TEMPLATES[value];
}

function buildGenerationPrompt(input: { prompt: string; contentType: ContentType; template: GenerationTemplate }): string {
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
    `Template: ${input.template.id} (${input.template.label})`,
    "Template guidance:",
    ...input.template.guidance.map((item) => `- ${item}`),
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

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: [
        {
          field: "prompt",
          message: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.`,
        },
      ],
    };
  }

  if (!isContentType(request.body?.contentType)) {
    return {
      ok: false,
      error: "Invalid contentType",
    };
  }

  const contentType = request.body.contentType;
  const template = resolveTemplate(request.body?.template);

  if (!template) {
    return {
      ok: false,
      error: "Invalid template",
    };
  }

  const runtime = await completeWithDeterministicFallback({
    flow: "content-generate",
    prompt: buildGenerationPrompt({ prompt, contentType, template }),
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
