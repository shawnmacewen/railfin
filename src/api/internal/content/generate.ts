import { completeWithDeterministicFallback } from "../../../ai/runtime/providerChain";

type ContentType = "blog" | "linkedin" | "newsletter" | "x-thread";

type GenerateTemplateId = "default" | "conversion";
type GenerateToneId = "professional" | "friendly" | "bold";
type GenerateIntentId = "educate" | "engage" | "convert";
type GenerateLengthTargetId = "short" | "medium" | "long";
type GenerateFormatStyleId = "standard" | "bullet" | "outline";
type GenerateControlProfileId = "social-quick" | "balanced-default" | "deep-outline";

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
  controlProfile?: GenerateControlProfileId;
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

type GenerationControlProfile = {
  id: GenerateControlProfileId;
  label: string;
  controls: {
    lengthTarget: GenerateLengthTargetId;
    formatStyle: GenerateFormatStyleId;
  };
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

const CONTROL_PROFILES: Record<GenerateControlProfileId, GenerationControlProfile> = {
  "social-quick": {
    id: "social-quick",
    label: "Social Quick",
    controls: {
      lengthTarget: "short",
      formatStyle: "bullet",
    },
  },
  "balanced-default": {
    id: "balanced-default",
    label: "Balanced Default",
    controls: {
      lengthTarget: "medium",
      formatStyle: "standard",
    },
  },
  "deep-outline": {
    id: "deep-outline",
    label: "Deep Outline",
    controls: {
      lengthTarget: "long",
      formatStyle: "outline",
    },
  },
};

const DEFAULT_TEMPLATE: GenerateTemplateId = "default";
const DEFAULT_TONE: GenerateToneId = "professional";
const DEFAULT_INTENT: GenerateIntentId = "educate";
const DEFAULT_CONTROL_PROFILE: GenerateControlProfileId = "balanced-default";

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

function isGenerateControlProfileId(value: unknown): value is GenerateControlProfileId {
  return typeof value === "string" && value in CONTROL_PROFILES;
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

function resolveControlProfile(value: unknown): GenerationControlProfile | null {
  if (value === undefined) {
    return CONTROL_PROFILES[DEFAULT_CONTROL_PROFILE];
  }

  if (!isGenerateControlProfileId(value)) {
    return null;
  }

  return CONTROL_PROFILES[value];
}

function resolveControls(value: unknown, profile: GenerationControlProfile): GenerationControls | null {
  if (value === undefined) {
    return {
      lengthTarget: profile.controls.lengthTarget,
      formatStyle: profile.controls.formatStyle,
      lengthGuidance: LENGTH_TARGET_GUIDANCE[profile.controls.lengthTarget],
      formatGuidance: FORMAT_STYLE_GUIDANCE[profile.controls.formatStyle],
    };
  }

  if (!value || typeof value !== "object" || !hasOnlyKeys(value, ["lengthTarget", "formatStyle"])) {
    return null;
  }

  const candidate = value as { lengthTarget?: unknown; formatStyle?: unknown };
  const lengthTarget = candidate.lengthTarget === undefined ? profile.controls.lengthTarget : candidate.lengthTarget;
  const formatStyle = candidate.formatStyle === undefined ? profile.controls.formatStyle : candidate.formatStyle;

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
  controlProfile: GenerationControlProfile;
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
    `Control profile: ${input.controlProfile.id} (${input.controlProfile.label})`,
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

function buildDegradedGenerationNote(errorKind?: string): string {
  if (errorKind === "provider_config") {
    return "AI generation unavailable: provider credentials missing or invalid. Check OPENAI_API_KEY runtime config.";
  }

  return "AI generation unavailable or invalid output; fallback response used.";
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

  const controlProfile = resolveControlProfile(request.body?.controlProfile);

  if (!controlProfile) {
    return {
      ok: false,
      error: "Invalid controlProfile",
    };
  }

  const controls = resolveControls(request.body?.controls, controlProfile);

  if (!controls) {
    return {
      ok: false,
      error: "Invalid controls",
    };
  }

  const runtime = await completeWithDeterministicFallback({
    flow: "content-generate",
    prompt: buildGenerationPrompt({ prompt, contentType, template, preset, controlProfile, controls }),
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
        notes: buildDegradedGenerationNote(runtime.diagnostic.attempts[0]?.errorKind),
        providerChain: runtime.diagnostic,
        degraded: true,
      },
    },
  };
}
