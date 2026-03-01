import { completeWithDeterministicFallback } from "../../../ai/runtime/providerChain";

type ContentType = "blog" | "linkedin" | "newsletter" | "x-thread";

type GenerateRequestBody = {
  prompt?: string;
  contentType?: ContentType;
};

type GenerateModelOutput = {
  text?: string;
  notes?: string;
};

function buildGenerationPrompt(input: { prompt: string; contentType: ContentType }): string {
  return [
    "You are a content generation engine for marketing copy.",
    "Return strict JSON only.",
    "Do not include markdown, prose, or code fences.",
    "Output schema:",
    '{"text":"string","notes":"string"}',
    `Content type: ${input.contentType}`,
    "Prompt:",
    input.prompt,
  ].join("\n");
}

function parseGenerationCompletion(completion: string): GenerateModelOutput {
  const cleaned = completion
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned) as GenerateModelOutput;
}

function normalizeGeneratedText(input: GenerateModelOutput, fallbackPrompt: string): { text: string; notes?: string } {
  const text = typeof input.text === "string" ? input.text.trim() : "";
  const notes = typeof input.notes === "string" ? input.notes.trim() : "";

  if (!text) {
    return {
      text: `[fallback-stub] ${fallbackPrompt}`,
      notes: notes || "Model output did not include text field.",
    };
  }

  return {
    text,
    notes: notes || undefined,
  };
}

export async function internalContentGenerate(request: {
  method: "POST";
  body?: GenerateRequestBody;
}) {
  const prompt = request.body?.prompt?.trim();
  const contentType = request.body?.contentType;

  if (!prompt) {
    return {
      ok: false,
      error: "Missing prompt",
    };
  }

  if (!contentType) {
    return {
      ok: false,
      error: "Missing contentType",
    };
  }

  const runtime = await completeWithDeterministicFallback({
    flow: "content-generate",
    prompt: buildGenerationPrompt({ prompt, contentType }),
  });

  if ("completion" in runtime) {
    try {
      const generated = normalizeGeneratedText(parseGenerationCompletion(runtime.completion), prompt);

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
            notes: generated.notes ?? "Generation completed",
            providerChain: runtime.diagnostic,
          },
        },
      };
    } catch {
      // fall through to safe fallback response
    }
  }

  return {
    ok: true,
    data: {
      draft: {
        id: `gen_${Date.now()}`,
        contentType,
        prompt,
        text: `[fallback-stub:${contentType}] ${prompt}`,
        status: "placeholder",
        createdAt: new Date().toISOString(),
      },
      generationMeta: {
        provider: "fallback",
        notes: "AI generation unavailable or invalid output; fallback response used.",
        providerChain: runtime.diagnostic,
        degraded: true,
      },
    },
  };
}
