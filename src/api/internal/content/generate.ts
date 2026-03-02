import { completeWithDeterministicFallback } from "../../../ai/runtime/providerChain";

type ContentType = "blog" | "linkedin" | "newsletter" | "x-thread";

type GenerateTemplateId = "default" | "conversion";
type GenerateToneId = "professional" | "friendly" | "bold";
type GenerateIntentId = "educate" | "engage" | "convert";
type GenerateLengthTargetId = "short" | "medium" | "long";
type GenerateFormatStyleId = "standard" | "bullet" | "outline";
type GenerateAudienceId = "executive" | "practitioner" | "general";
type GenerateObjectiveId = "awareness" | "consideration" | "decision";
type GenerateControlProfileId = "social-quick" | "balanced-default" | "deep-outline";

type GenerateRequestBody = {
  prompt?: string;
  contentType?: ContentType;
  template?: GenerateTemplateId;
  tone?: GenerateToneId;
  intent?: GenerateIntentId;
  audience?: GenerateAudienceId;
  objective?: GenerateObjectiveId;
  preset?: {
    tone?: GenerateToneId;
    intent?: GenerateIntentId;
  };
  controls?: {
    lengthTarget?: GenerateLengthTargetId;
    formatStyle?: GenerateFormatStyleId;
    audience?: GenerateAudienceId;
    objective?: GenerateObjectiveId;
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
  audience: GenerateAudienceId;
  objective: GenerateObjectiveId;
  lengthGuidance: string[];
  formatGuidance: string[];
  audienceGuidance: string[];
  objectiveGuidance: string[];
};

type GenerationControlProfile = {
  id: GenerateControlProfileId;
  label: string;
  controls: {
    lengthTarget: GenerateLengthTargetId;
    formatStyle: GenerateFormatStyleId;
    audience: GenerateAudienceId;
    objective: GenerateObjectiveId;
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

const AUDIENCE_GUIDANCE: Record<GenerateAudienceId, string[]> = {
  executive: [
    "Prioritize strategic outcomes, business impact, and concise framing.",
    "Minimize operational detail unless needed for decision confidence.",
  ],
  practitioner: [
    "Prioritize practical implementation details and applied examples.",
    "Use precise terminology where it improves execution clarity.",
  ],
  general: [
    "Use plain language and avoid assuming domain expertise.",
    "Provide enough context so first-time readers can follow quickly.",
  ],
};

const OBJECTIVE_GUIDANCE: Record<GenerateObjectiveId, string[]> = {
  awareness: [
    "Optimize for initial interest, context-setting, and clarity of the core problem/value.",
    "Avoid hard-sell language; keep the ask lightweight.",
  ],
  consideration: [
    "Optimize for evaluation-stage readers comparing options or approaches.",
    "Include practical differentiators and confidence-building specifics.",
  ],
  decision: [
    "Optimize for action readiness with clear next steps and low-friction CTA.",
    "Reinforce urgency carefully without overclaiming outcomes.",
  ],
};

const CONTROL_PROFILES: Record<GenerateControlProfileId, GenerationControlProfile> = {
  "social-quick": {
    id: "social-quick",
    label: "Social Quick",
    controls: {
      lengthTarget: "short",
      formatStyle: "bullet",
      audience: "general",
      objective: "awareness",
    },
  },
  "balanced-default": {
    id: "balanced-default",
    label: "Balanced Default",
    controls: {
      lengthTarget: "medium",
      formatStyle: "standard",
      audience: "practitioner",
      objective: "consideration",
    },
  },
  "deep-outline": {
    id: "deep-outline",
    label: "Deep Outline",
    controls: {
      lengthTarget: "long",
      formatStyle: "outline",
      audience: "executive",
      objective: "decision",
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

function isGenerateAudienceId(value: unknown): value is GenerateAudienceId {
  return typeof value === "string" && value in AUDIENCE_GUIDANCE;
}

function isGenerateObjectiveId(value: unknown): value is GenerateObjectiveId {
  return typeof value === "string" && value in OBJECTIVE_GUIDANCE;
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

function resolvePreset(value: unknown, toneOverride: unknown, intentOverride: unknown): GenerationPreset | null {
  if (value !== undefined && (!value || typeof value !== "object" || !hasOnlyKeys(value, ["tone", "intent"]))) {
    return null;
  }

  const candidate = (value ?? {}) as { tone?: unknown; intent?: unknown };
  const tone = toneOverride === undefined ? (candidate.tone === undefined ? DEFAULT_TONE : candidate.tone) : toneOverride;
  const intent =
    intentOverride === undefined ? (candidate.intent === undefined ? DEFAULT_INTENT : candidate.intent) : intentOverride;

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

function resolveControls(
  value: unknown,
  profile: GenerationControlProfile,
  audienceOverride: unknown,
  objectiveOverride: unknown,
): GenerationControls | null {
  if (
    value !== undefined &&
    (!value || typeof value !== "object" || !hasOnlyKeys(value, ["lengthTarget", "formatStyle", "audience", "objective"]))
  ) {
    return null;
  }

  const candidate = (value ?? {}) as {
    lengthTarget?: unknown;
    formatStyle?: unknown;
    audience?: unknown;
    objective?: unknown;
  };

  const lengthTarget = candidate.lengthTarget === undefined ? profile.controls.lengthTarget : candidate.lengthTarget;
  const formatStyle = candidate.formatStyle === undefined ? profile.controls.formatStyle : candidate.formatStyle;
  const audience =
    audienceOverride === undefined ? (candidate.audience === undefined ? profile.controls.audience : candidate.audience) : audienceOverride;
  const objective =
    objectiveOverride === undefined
      ? candidate.objective === undefined
        ? profile.controls.objective
        : candidate.objective
      : objectiveOverride;

  if (
    !isGenerateLengthTargetId(lengthTarget) ||
    !isGenerateFormatStyleId(formatStyle) ||
    !isGenerateAudienceId(audience) ||
    !isGenerateObjectiveId(objective)
  ) {
    return null;
  }

  return {
    lengthTarget,
    formatStyle,
    audience,
    objective,
    lengthGuidance: LENGTH_TARGET_GUIDANCE[lengthTarget],
    formatGuidance: FORMAT_STYLE_GUIDANCE[formatStyle],
    audienceGuidance: AUDIENCE_GUIDANCE[audience],
    objectiveGuidance: OBJECTIVE_GUIDANCE[objective],
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
    `Controls audience: ${input.controls.audience}`,
    `Controls objective: ${input.controls.objective}`,
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
    "Audience guidance:",
    ...input.controls.audienceGuidance.map((item) => `- ${item}`),
    "Objective guidance:",
    ...input.controls.objectiveGuidance.map((item) => `- ${item}`),
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

function validateControlOverrides(body: GenerateRequestBody) {
  const fieldErrors: Array<{ field: string; message: string }> = [];

  if (body.tone !== undefined && body.preset?.tone !== undefined && body.tone !== body.preset.tone) {
    fieldErrors.push({
      field: "tone",
      message: "tone conflicts with preset.tone; provide one value or keep them identical.",
    });
  }

  if (body.intent !== undefined && body.preset?.intent !== undefined && body.intent !== body.preset.intent) {
    fieldErrors.push({
      field: "intent",
      message: "intent conflicts with preset.intent; provide one value or keep them identical.",
    });
  }

  if (body.audience !== undefined && body.controls?.audience !== undefined && body.audience !== body.controls.audience) {
    fieldErrors.push({
      field: "audience",
      message: "audience conflicts with controls.audience; provide one value or keep them identical.",
    });
  }

  if (
    body.objective !== undefined &&
    body.controls?.objective !== undefined &&
    body.objective !== body.controls.objective
  ) {
    fieldErrors.push({
      field: "objective",
      message: "objective conflicts with controls.objective; provide one value or keep them identical.",
    });
  }

  return fieldErrors;
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

  const body = request.body ?? {};
  const combinationErrors = validateControlOverrides(body);

  if (combinationErrors.length > 0) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: combinationErrors,
    };
  }

  const contentType = request.body.contentType;
  const template = resolveTemplate(body.template);

  if (!template) {
    return {
      ok: false,
      error: "Invalid template",
    };
  }

  const preset = resolvePreset(body.preset, body.tone, body.intent);

  if (!preset) {
    return {
      ok: false,
      error: "Invalid preset",
    };
  }

  const controlProfile = resolveControlProfile(body.controlProfile);

  if (!controlProfile) {
    return {
      ok: false,
      error: "Invalid controlProfile",
    };
  }

  const controls = resolveControls(body.controls, controlProfile, body.audience, body.objective);

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
