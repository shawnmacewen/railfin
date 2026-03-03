import { completeWithDeterministicFallback } from "../../../ai/runtime/providerChain";

type ContentType = "blog" | "linkedin" | "newsletter" | "x-thread";
type PackageAssetType = "email" | "linkedin" | "x-thread";
type GenerateMode = "single" | "package";

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
  mode?: GenerateMode;
  contentType?: ContentType;
  package?: {
    assets?: Array<{
      assetType?: PackageAssetType;
      prompt?: string;
    }>;
  };
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

type ExportBlockType = "paragraph" | "bullet" | "thread-post";

type PackageExportBlock = {
  id: string;
  type: ExportBlockType;
  text: string;
  order: number;
};

type PackageExportAsset = {
  assetType: PackageAssetType;
  contentType: ContentType;
  sourceDraftId: string;
  prompt: string;
  text: string;
  blocks: PackageExportBlock[];
};

type PackageExport = {
  schemaVersion: "2026-03-03";
  generatedAt: string;
  assetCount: number;
  assets: PackageExportAsset[];
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
const PACKAGE_ASSET_TYPES: PackageAssetType[] = ["email", "linkedin", "x-thread"];
const MAX_PROMPT_LENGTH = 12000;
const MAX_PACKAGE_ASSETS = 3;

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

function isGenerateMode(value: unknown): value is GenerateMode {
  return value === "single" || value === "package";
}

function isPackageAssetType(value: unknown): value is PackageAssetType {
  return typeof value === "string" && PACKAGE_ASSET_TYPES.includes(value as PackageAssetType);
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

function validatePackageRequest(body: GenerateRequestBody, mode: GenerateMode) {
  const fieldErrors: Array<{ field: string; message: string }> = [];

  if (mode === "single") {
    if (body.package !== undefined) {
      fieldErrors.push({ field: "package", message: "package is only allowed when mode is package." });
    }

    if (!isContentType(body.contentType)) {
      fieldErrors.push({ field: "contentType", message: "contentType is required when mode is single." });
    }

    return fieldErrors;
  }

  if (body.contentType !== undefined) {
    fieldErrors.push({ field: "contentType", message: "contentType is not allowed when mode is package." });
  }

  if (!body.package || typeof body.package !== "object" || !hasOnlyKeys(body.package, ["assets"])) {
    fieldErrors.push({ field: "package", message: "package must be an object with assets." });
    return fieldErrors;
  }

  if (!Array.isArray(body.package.assets)) {
    fieldErrors.push({ field: "package.assets", message: "package.assets must be an array." });
    return fieldErrors;
  }

  if (body.package.assets.length === 0 || body.package.assets.length > MAX_PACKAGE_ASSETS) {
    fieldErrors.push({
      field: "package.assets",
      message: 
        "package.assets must contain between 1 and " + MAX_PACKAGE_ASSETS + " items.",
    });
  }

  const seen = new Set<string>();

  body.package.assets.forEach((asset, index) => {
    const path =       "package.assets[" + index + "]";

    if (!asset || typeof asset !== "object" || !hasOnlyKeys(asset as object, ["assetType", "prompt"])) {
      fieldErrors.push({ field: path, message: "asset must contain only assetType and optional prompt." });
      return;
    }

    if (!isPackageAssetType(asset.assetType)) {
      fieldErrors.push({ field: path + ".assetType", message: "assetType must be one of email, linkedin, x-thread." });
      return;
    }

    if (seen.has(asset.assetType)) {
      fieldErrors.push({ field: path + ".assetType", message: "assetType must be unique within package assets." });
    }

    seen.add(asset.assetType);

    if (asset.prompt !== undefined) {
      if (typeof asset.prompt !== "string" || !asset.prompt.trim()) {
        fieldErrors.push({ field: path + ".prompt", message: "prompt must be a non-empty string when provided." });
      } else if (asset.prompt.trim().length > MAX_PROMPT_LENGTH) {
        fieldErrors.push({
          field: path + ".prompt",
          message: "Prompt must be " + MAX_PROMPT_LENGTH + " characters or fewer.",
        });
      }
    }
  });

  return fieldErrors;
}

function buildAssetPrompt(basePrompt: string, assetType: PackageAssetType) {
  const assetConstraintByType: Record<PackageAssetType, string[]> = {
    email: [
      "Return a marketing email draft with a short subject line plus body content.",
      "Keep body around 120-220 words and include one clear call-to-action.",
    ],
    linkedin: [
      "Return a LinkedIn post draft optimized for readability.",
      "Keep output around 80-180 words and end with a discussion-driving CTA.",
    ],
    "x-thread": [
      "Return an X thread as 4-7 numbered posts.",
      "Each post should be concise, clear, and avoid redundant hashtags.",
    ],
  };

  return [basePrompt, "", "Asset-specific constraints:", ...assetConstraintByType[assetType].map((item) => "- " + item)].join("\n");
}

type NormalizedGenerationConfig = {
  template: GenerationTemplate;
  preset: GenerationPreset;
  controlProfile: GenerationControlProfile;
  controls: GenerationControls;
};

async function generateDraftForContentType(input: {
  prompt: string;
  contentType: ContentType;
  config: NormalizedGenerationConfig;
}) {
  const runtime = await completeWithDeterministicFallback({
    flow: "content-generate",
    prompt: buildGenerationPrompt({
      prompt: input.prompt,
      contentType: input.contentType,
      template: input.config.template,
      preset: input.config.preset,
      controlProfile: input.config.controlProfile,
      controls: input.config.controls,
    }),
  });

  if ("completion" in runtime) {
    try {
      const generated = validateGenerateModelOutput(parseJsonCompletion(runtime.completion));

      return {
        draft: {
          id: "gen_" + Date.now(),
          contentType: input.contentType,
          prompt: input.prompt,
          text: generated.text,
          status: "placeholder",
          createdAt: new Date().toISOString(),
        },
        generationMeta: {
          provider: runtime.diagnostic.attempts.find((attempt) => attempt.ok)?.provider ?? runtime.diagnostic.primary,
          notes: generated.notes || "Generation completed",
          providerChain: runtime.diagnostic,
        },
      };
    } catch {
      // degrade safely
    }
  }

  return {
    draft: createFallbackDraft({ prompt: input.prompt, contentType: input.contentType }),
    generationMeta: {
      provider: "fallback",
      notes: buildDegradedGenerationNote(runtime.diagnostic.attempts[0]?.errorKind),
      providerChain: runtime.diagnostic,
      degraded: true,
    },
  };
}

function normalizeExportBlocks(input: { assetType: PackageAssetType; text: string }): PackageExportBlock[] {
  const normalized = input.text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (normalized.length === 0) {
    return [
      {
        id: `${input.assetType}-block-1`,
        type: "paragraph",
        text: input.text.trim(),
        order: 1,
      },
    ];
  }

  return normalized.map((line, index) => {
    const bulletLike = /^[-*•]\s+/.test(line);
    const numberedLike = /^\d+[.)]\s+/.test(line);
    const type: ExportBlockType =
      input.assetType === "x-thread" || numberedLike ? "thread-post" : bulletLike ? "bullet" : "paragraph";

    return {
      id: `${input.assetType}-block-${index + 1}`,
      type,
      text: line.replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, "").trim(),
      order: index + 1,
    };
  });
}

function assertPackageExportShape(value: PackageExport): PackageExport {
  const fieldErrors: Array<{ field: string; message: string }> = [];

  if (value.schemaVersion !== "2026-03-03") {
    fieldErrors.push({ field: "package.export.schemaVersion", message: "schemaVersion must be 2026-03-03." });
  }

  if (typeof value.generatedAt !== "string" || !value.generatedAt.trim()) {
    fieldErrors.push({ field: "package.export.generatedAt", message: "generatedAt must be a non-empty string." });
  }

  if (!Number.isInteger(value.assetCount) || value.assetCount < 1 || value.assetCount > MAX_PACKAGE_ASSETS) {
    fieldErrors.push({
      field: "package.export.assetCount",
      message: "assetCount must be a positive integer within package asset limits.",
    });
  }

  if (!Array.isArray(value.assets) || value.assets.length !== value.assetCount) {
    fieldErrors.push({ field: "package.export.assets", message: "assets must match assetCount." });
  }

  const seen = new Set<string>();

  value.assets.forEach((asset, index) => {
    const assetPath = `package.export.assets[${index}]`;

    if (!isPackageAssetType(asset.assetType)) {
      fieldErrors.push({ field: `${assetPath}.assetType`, message: "assetType is invalid." });
      return;
    }

    if (seen.has(asset.assetType)) {
      fieldErrors.push({ field: `${assetPath}.assetType`, message: "assetType must be unique." });
    }
    seen.add(asset.assetType);

    if (!isContentType(asset.contentType)) {
      fieldErrors.push({ field: `${assetPath}.contentType`, message: "contentType is invalid." });
    }

    if (typeof asset.sourceDraftId !== "string" || !asset.sourceDraftId.trim()) {
      fieldErrors.push({ field: `${assetPath}.sourceDraftId`, message: "sourceDraftId must be non-empty." });
    }

    if (typeof asset.prompt !== "string" || !asset.prompt.trim()) {
      fieldErrors.push({ field: `${assetPath}.prompt`, message: "prompt must be non-empty." });
    }

    if (typeof asset.text !== "string" || !asset.text.trim()) {
      fieldErrors.push({ field: `${assetPath}.text`, message: "text must be non-empty." });
    }

    if (!Array.isArray(asset.blocks) || asset.blocks.length === 0) {
      fieldErrors.push({ field: `${assetPath}.blocks`, message: "blocks must contain at least one item." });
      return;
    }

    asset.blocks.forEach((block, blockIndex) => {
      const blockPath = `${assetPath}.blocks[${blockIndex}]`;
      if (typeof block.id !== "string" || !block.id.trim()) {
        fieldErrors.push({ field: `${blockPath}.id`, message: "id must be non-empty." });
      }

      if (!(block.type === "paragraph" || block.type === "bullet" || block.type === "thread-post")) {
        fieldErrors.push({ field: `${blockPath}.type`, message: "type is invalid." });
      }

      if (typeof block.text !== "string" || !block.text.trim()) {
        fieldErrors.push({ field: `${blockPath}.text`, message: "text must be non-empty." });
      }

      if (!Number.isInteger(block.order) || block.order < 1) {
        fieldErrors.push({ field: `${blockPath}.order`, message: "order must be a positive integer." });
      }
    });
  });

  if (fieldErrors.length > 0) {
    throw new Error(`Invalid package export shape: ${fieldErrors[0].field} ${fieldErrors[0].message}`);
  }

  return value;
}

function buildPackageExport(input: {
  packageResults: Array<{
    assetType: PackageAssetType;
    draft: {
      id: string;
      contentType: PackageAssetType;
      prompt: string;
      text: string;
    };
  }>;
}): PackageExport {
  const exportPayload: PackageExport = {
    schemaVersion: "2026-03-03",
    generatedAt: new Date().toISOString(),
    assetCount: input.packageResults.length,
    assets: input.packageResults.map((item) => ({
      assetType: item.assetType,
      contentType: item.assetType === "email" ? "newsletter" : item.assetType,
      sourceDraftId: item.draft.id,
      prompt: item.draft.prompt,
      text: item.draft.text,
      blocks: normalizeExportBlocks({ assetType: item.assetType, text: item.draft.text }),
    })),
  };

  return assertPackageExportShape(exportPayload);
}

export async function internalContentGenerate(request: {
  method: "POST";
  body?: GenerateRequestBody;
}) {
  const body = request.body ?? {};
  const prompt = body.prompt?.trim();

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
          message: "Prompt must be " + MAX_PROMPT_LENGTH + " characters or fewer.",
        },
      ],
    };
  }

  const mode: GenerateMode = body.mode === undefined ? "single" : body.mode;

  if (!isGenerateMode(mode)) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: [{ field: "mode", message: "mode must be single or package." }],
    };
  }

  const packageErrors = validatePackageRequest(body, mode);
  if (packageErrors.length > 0) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: packageErrors,
    };
  }

  const combinationErrors = validateControlOverrides(body);
  if (combinationErrors.length > 0) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: combinationErrors,
    };
  }

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

  const config: NormalizedGenerationConfig = {
    template,
    preset,
    controlProfile,
    controls,
  };

  if (mode === "single") {
    const result = await generateDraftForContentType({
      prompt,
      contentType: body.contentType as ContentType,
      config,
    });

    return {
      ok: true,
      data: {
        draft: result.draft,
        generationMeta: result.generationMeta,
      },
    };
  }

  const assets = body.package?.assets ?? [];
  const packageResults = await Promise.all(
    assets.map(async (asset) => {
      const assetType = asset.assetType as PackageAssetType;
      const assetPrompt = asset.prompt?.trim() || prompt;
      const mappedContentType: ContentType = assetType === "email" ? "newsletter" : assetType;
      const result = await generateDraftForContentType({
        prompt: buildAssetPrompt(assetPrompt, assetType),
        contentType: mappedContentType,
        config,
      });

      return {
        assetType,
        draft: {
          ...result.draft,
          contentType: assetType,
          prompt: assetPrompt,
        },
        generationMeta: result.generationMeta,
      };
    }),
  );

  const degraded = packageResults.some((item) => Boolean(item.generationMeta.degraded));

  return {
    ok: true,
    data: {
      package: {
        id: "pkg_" + Date.now(),
        mode: "package",
        prompt,
        assets: packageResults,
        export: buildPackageExport({ packageResults }),
        createdAt: new Date().toISOString(),
      },
      generationMeta: {
        provider: degraded ? "mixed" : packageResults[0]?.generationMeta.provider ?? "unknown",
        notes: degraded
          ? "Campaign package generated with one or more degraded assets. Review each variant before use."
          : "Campaign package generated successfully.",
        degraded,
      },
    },
  };
}
