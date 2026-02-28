type ContentType = "blog" | "linkedin" | "newsletter" | "x-thread";

type GenerateRequestBody = {
  prompt?: string;
  contentType?: ContentType;
};

type ProviderChoice = "codex" | "fallback";

type GenerationProvider = {
  name: ProviderChoice;
  generateDraft: (input: {
    prompt: string;
    contentType: ContentType;
  }) => Promise<{
    text: string;
    notes?: string;
  }>;
};

function selectGenerationProvider(prefer: ProviderChoice = "codex"): GenerationProvider {
  const codexProvider: GenerationProvider = {
    name: "codex",
    async generateDraft(input) {
      return {
        text: `[codex-stub:${input.contentType}] ${input.prompt}`,
        notes: "Stub output only; provider wiring not enabled.",
      };
    },
  };

  const fallbackProvider: GenerationProvider = {
    name: "fallback",
    async generateDraft(input) {
      return {
        text: `[fallback-stub:${input.contentType}] ${input.prompt}`,
        notes: "Fallback stub path used.",
      };
    },
  };

  // Preferred path: Codex, with a fallback-capable shape.
  if (prefer === "codex") {
    return codexProvider;
  }

  return fallbackProvider;
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

  const primaryProvider = selectGenerationProvider("codex");

  try {
    const generated = await primaryProvider.generateDraft({ prompt, contentType });

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
          provider: primaryProvider.name,
          notes: generated.notes ?? "Stub generation",
        },
      },
    };
  } catch {
    const fallbackProvider = selectGenerationProvider("fallback");
    const generated = await fallbackProvider.generateDraft({ prompt, contentType });

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
          provider: fallbackProvider.name,
          notes: generated.notes ?? "Stub generation (fallback)",
        },
      },
    };
  }
}
