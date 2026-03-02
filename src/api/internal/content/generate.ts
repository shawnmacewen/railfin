import { completeWithDeterministicFallback } from "../../../ai/runtime/providerChain";

type ContentType = "blog" | "linkedin" | "newsletter" | "x-thread";

type GenerateTemplateId = "default" | "conversion";
type GenerateToneId = "professional" | "friendly" | "bold";
type GenerateIntentId = "educate" | "engage" | "convert";
type GenerateLengthTargetId = "short" | "medium" | "long";
type GenerateFormatStyleId = "standard" | "bullet" | "outline";

type GenerateRequestBody = {
  prompt?: string;
  contentType?: ContentType;
  template?: GenerateTemplateId;
  preset?: {
    tone?: GenerateToneId;
    intent?: GenerateIntentId;
  };
  controls?: {
    lengthTarget?: GenerateLengthTargetId;
    formatStyle?: GenerateFormatStyleId;
  };
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

type GenerationPreset = {
  tone: GenerateToneId;
  intent: GenerateIntentId;
  toneGuidance: string[];
  intentGuidance: string[];
};

type GenerationControls = {
  lengthTarget: GenerateLengthTargetId;
  formatStyle: GenerateFormatStyleId;
  lengthGuidance: string[];
  formatGuidance: string[];
};

const CONTENT_TYPES: ContentType[] = ["blog", "linkedin", "newsletter", "x-thread"];
const MAX_PROMPT_LENGTH = 12000;

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

const TONE_GUIDANCE: Record<GenerateToneId, string[]> = {
  professional: [
    "Use polished language and clear sentence structure.",
    "Keep claims measured and avoid hype-heavy wording.",
  ],
  friendly: [
    "Use approachable language with warm, conversational phrasing.",
    "Keep readability high and avoid jargon unless needed.",
  ],
  bold: [
    "Use confident voice with high clarity and direct statements.",
    "Emphasize differentiated value without making risky claims.",
  ],
};

const INTENT_GUIDANCE: Record<GenerateIntentId, string[]> = {
  educate: [
    "Prioritize informative structure and practical takeaways.",
    "Clarify why recommendations matter for the audience.",
  ],
  engage: [
    "Prioritize audience connection and narrative momentum.",
    "Invite reflection or interaction without overpromising.",
  ],
  convert: [
    "Prioritize clear value framing and decision-driving clarity.",
    "Include a direct, low-friction call-to-action.",
  ],
};

const LENGTH_TARGET_GUIDANCE: Record<GenerateLengthTargetId, string[]> = {
  short: [
    "Keep output concise with approximately 80-140 words.",
    "Prefer one to two compact paragraphs.",
  ],
  medium: [
    "Keep output at moderate depth with approximately 180-280 words.",
    "Use two to four short paragraphs.",
  ],
  long: [
    "Provide expanded depth with approximately 320-500 words.",
    "Use clear sections to keep longer output readable.",
  ],
};

const FORMAT_STYLE_GUIDANCE: Record<GenerateFormatStyleId, string[]> = {
  standard: [
    "Use standard paragraph format with natural transitions.",
    "Avoid heading-heavy formatting unless it improves clarity.",
  ],
  bullet: [
    "Use concise bullet points for scannable structure.",
    "Keep each bullet focused on one idea.",
  ],
  outline: [
    "Use lightweight outline structure with short section headers.",
    "Keep section order logical from context to action.",
  ],
};

const DEFAULT_TEMPLATE: GenerateTemplateId = "default";
const DEFAULT_TONE: GenerateToneId = "professional";
const DEFAULT_INTENT: GenerateIntentId = "educate";
const DEFAULT_LENGTH_TARGET: GenerateLengthTargetId = "medium";
const DEFAULT_FORMAT_STYLE: GenerateFormatStyleId = "standard";

function isContentType(value: unknown): value is ContentType {
  return typeof value === "string" && CONTENT_TYPES.includes(value as ContentType);
}

function isGenerateTemplateId(value: unknown): value is GenerateTemplateId {
  return typeof value === "string" && value in GENERATION_TEMPLATES;
}

function isGenerateToneId(value: unknown): value is GenerateToneId {
  return typeof value === "string" && value in TONE_GUIDANCE;
}

function isGenerateIntentId(value: unknown): value is GenerateIntentId {
  return typeof value === "string" && value in INTENT_GUIDANCE;
}

function isGenerateLengthTargetId(value: unknown): value is GenerateLengthTargetId {
  return typeof value === "string" && value in LENGTH_TARGET_GUIDANCE;
}

function isGenerateFormatStyleId(value: unknown): value is GenerateFormatStyleId {
  return typeof value === "string" && value in FORMAT_STYLE_GUIDANCE;
}

function hasOnlyKeys(candidate: object, keys: string[]) {
  return Object.keys(candidate).every((key) => keys.includes(key));
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

function resolvePreset(value: unknown): GenerationPreset | null {
  if (value === undefined) {
    return {
      tone: DEFAULT_TONE,
      intent: DEFAULT_INTENT,
      toneGuidance: TONE_GUIDANCE[DEFAULT_TONE],
      intentGuidance: INTENT_GUIDANCE[DEFAULT_INTENT],
    };
  }

  if (!value || typeof value !== "object" || !hasOnlyKeys(value, ["tone", "intent"])) {
    return null;
  }

  const candidate = value as { tone?: unknown; intent?: unknown };
  const tone = candidate.tone === undefined ? DEFAULT_TONE : candidate.tone;
  const intent = candidate.intent === undefined ? DEFAULT_INTENT : candidate.intent;

  if (!isGenerateToneId(tone) || !isGenerateIntentId(intent)) {
    return null;
  }

  return {
    tone,
    intent,
    toneGuidance: TONE_GUIDANCE[tone],
    intentGuidance: INTENT_GUIDANCE[intent],
  };
}

function resolveControls(value: unknown): GenerationControls | null {
  if (value === undefined) {
    return {
      lengthTarget: DEFAULT_LENGTH_TARGET,
      formatStyle: DEFAULT_FORMAT_STYLE,
      lengthGuidance: LENGTH_TARGET_GUIDANCE[DEFAULT_LENGTH_TARGET],
      formatGuidance: FORMAT_STYLE_GUIDANCE[DEFAULT_FORMAT_STYLE],
    };
  }

  if (!value || typeof value !== "object" || !hasOnlyKeys(value, ["lengthTarget", "formatStyle"])) {
    return null;
  }

  const candidate = value as { lengthTarget?: unknown; formatStyle?: unknown };
  const lengthTarget = candidate.lengthTarget === undefined ? DEFAULT_LENGTH_TARGET : candidate.lengthTarget;
  const formatStyle = candidate.formatStyle === undefined ? DEFAULT_FORMAT_STYLE : candidate.formatStyle;

  if (!isGenerateLengthTargetId(lengthTarget) || !isGenerateFormatStyleId(formatStyle)) {
    return null;
  }

  return {
    lengthTarget,
    formatStyle,
    lengthGuidance: LENGTH_TARGET_GUIDANCE[lengthTarget],
    formatGuidance: FORMAT_STYLE_GUIDANCE[formatStyle],
  };
}

function buildGenerationPrompt(input: {
  prompt: string;
  contentType: ContentType;
  template: GenerationTemplate;
  preset: GenerationPreset;
  controls: GenerationControls;
}): string {
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
    `Preset tone: ${input.preset.tone}`,
    `Preset intent: ${input.preset.intent}`,
    `Controls lengthTarget: ${input.controls.lengthTarget}`,
    `Controls formatStyle: ${input.controls.formatStyle}`,
    "Template guidance:",
    ...input.template.guidance.map((item) => `- ${item}`),
    "Tone guidance:",
    ...input.preset.toneGuidance.map((item) => `- ${item}`),
    "Intent guidance:",
    ...input.preset.intentGuidance.map((item) => `- ${item}`),
    "Length guidance:",
    ...input.controls.lengthGuidance.map((item) => `- ${item}`),
    "Format guidance:",
    ...input.controls.formatGuidance.map((item) => `- ${item}`),
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

  const preset = resolvePreset(request.body?.preset);

  if (!preset) {
    return {
      ok: false,
      error: "Invalid preset",
    };
  }

  const controls = resolveControls(request.body?.controls);

  if (!controls) {
    return {
      ok: false,
      error: "Invalid controls",
    };
  }

  const runtime = await completeWithDeterministicFallback({
    flow: "content-generate",
    prompt: buildGenerationPrompt({ prompt, contentType, template, preset, controls }),
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
