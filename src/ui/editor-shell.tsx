"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ComplianceFinding, CompliancePanel, SelectedFindingContext } from "./compliance-panel";
import { LexicalEditorField } from "./lexical-editor";
import { normalizeIncomingDraftBody, plainTextToContractHtml } from "./lexical-contract";

type EditorStatus = "idle" | "saving" | "saved" | "error";
type GenerationStatus = "idle" | "generating" | "generated" | "error";
type ContentType = "blog" | "linkedin" | "newsletter" | "x-thread";
type CreateContentOption = "blog" | "social-post" | "article" | "newsletter";
type CreateInputMode = "topics" | "prompt";
type TopicOptionId = "tax-season-2026" | "ai-and-jobs" | "financial-wellness";
type PurposeOptionId = "lead-outreach" | "social-growth" | "follower-growth";

type RemediationContextResult = {
  nextContent: string;
  previousBlock: string | null;
  appliedBlock: string;
};

type RemediationPreview = {
  issue: string;
  severity: string;
  location: string;
  previousBlock: string | null;
  appliedBlock: string;
  summary?: {
    changedChars: number;
    changedLines: number;
    findingId: string;
    draftContextId: string;
  };
};

type RemediationApplyStatus = "idle" | "applying" | "applied" | "error";

type RemediationApplyHistoryEntry = {
  issue: string;
  severity: string;
  location: string;
  hint: string;
  appliedAt: string;
};

type RemediationUndoState = {
  previousContent: string;
  preview: RemediationPreview | null;
};

type PackageVariantEntry = {
  id: string;
  text: string;
  contentType: ContentType;
  degraded: boolean;
  provider: string | null;
};

type GenerationHistoryEntry =
  | {
      id: string;
      mode: "single";
      createdAt: string;
      variant: PackageVariantEntry;
    }
  | {
      id: string;
      mode: "package";
      createdAt: string;
      variants: PackageVariantEntry[];
      degraded: boolean;
      providers: string[];
    };

const MAX_GENERATION_HISTORY = 6;
const PACKAGE_REQUEST_ASSETS: PackageAssetType[] = ["email", "linkedin", "x-thread"];

const CREATE_CONTENT_OPTIONS: Array<{ id: CreateContentOption; label: string; apiType: ContentType }> = [
  { id: "blog", label: "Blog", apiType: "blog" },
  { id: "social-post", label: "Social Post", apiType: "linkedin" },
  { id: "article", label: "Article", apiType: "x-thread" },
  { id: "newsletter", label: "Newsletter", apiType: "newsletter" },
];

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  blog: "Blog",
  linkedin: "Social Post",
  "x-thread": "Article",
  newsletter: "Newsletter",
};

const TOPIC_OPTIONS: Array<{ id: TopicOptionId; label: string }> = [
  { id: "tax-season-2026", label: "Tax Season 2026" },
  { id: "ai-and-jobs", label: "AI and Jobs" },
  { id: "financial-wellness", label: "Financial Wellness" },
];

const PURPOSE_OPTIONS: Array<{ id: PurposeOptionId; label: string }> = [
  { id: "lead-outreach", label: "Lead Outreach" },
  { id: "social-growth", label: "Social Growth" },
  { id: "follower-growth", label: "Follower Growth" },
];

const REMEDIATION_BLOCK_START = "[Compliance Remediation Draft Context]";
const REMEDIATION_BLOCK_END = "[/Compliance Remediation Draft Context]";

type DraftResponse = {
  ok: boolean;
  data?: {
    id: string;
    title: string;
    body: string;
    createdAt: string;
  };
  error?: string;
  fieldErrors?: Array<{
    field?: string;
    message?: string;
  }>;
};

type PackageAssetType = "email" | "linkedin" | "x-thread";

type GenerateResponse = {
  ok: boolean;
  data?: {
    draft?: {
      text?: string;
      contentType?: ContentType;
    };
    package?: {
      assets?: Array<{
        assetType?: PackageAssetType;
        draft?: {
          text?: string;
        };
        generationMeta?: {
          degraded?: boolean;
          provider?: string;
        };
      }>;
    };
    generationMeta?: {
      notes?: string;
      degraded?: boolean;
      provider?: string;
    };
    debug?: {
      assembledPrompt?: string;
      metadata?: {
        mode?: string;
        contentType?: string;
        template?: string;
        tone?: string;
        intent?: string;
        controls?: {
          lengthTarget?: string;
          formatStyle?: string;
          audience?: string;
          objective?: string;
          controlProfile?: string;
        };
        topics?: string[];
        purposes?: string[];
      };
    };
  };
  error?: string;
};

type PromptPayloadDebugState = {
  capturedAt: string;
  assembledPrompt: string;
  metadata: {
    mode: string;
    contentType: string;
    template: string;
    tone: string;
    intent: string;
    controls: {
      lengthTarget: string;
      formatStyle: string;
      audience: string;
      objective: string;
      controlProfile: string;
    };
    topics: string[];
    purposes: string[];
  };
  requestBody: Record<string, unknown>;
};

type RemediationApplyResponse = {
  ok: boolean;
  data?: {
    nextContent: string;
    previousBlock: string | null;
    appliedBlock: string;
    summary?: {
      changedChars: number;
      changedLines: number;
      findingId: string;
      draftContextId: string;
    };
  };
  error?: string;
  fieldErrors?: Array<{
    field?: string;
    message?: string;
  }>;
};

type ConfigurePolicyResponse = {
  ok: boolean;
  data?: {
    policyText: string;
    updatedAt: string;
    version: number;
  };
  error?: string;
};

function applyControlledRemediationContext(current: string, nextBlock: string): RemediationContextResult {
  const start = current.indexOf(REMEDIATION_BLOCK_START);
  const end = current.indexOf(REMEDIATION_BLOCK_END);

  if (start !== -1 && end !== -1 && end > start) {
    const endWithMarker = end + REMEDIATION_BLOCK_END.length;
    const previousBlock = current.slice(start, endWithMarker);
    const prefix = current.slice(0, start).trimEnd();
    return {
      nextContent: `${prefix}\n\n${nextBlock}`,
      previousBlock,
      appliedBlock: nextBlock,
    };
  }

  const base = current.trimEnd();
  return {
    nextContent: base ? `${base}\n\n${nextBlock}` : nextBlock,
    previousBlock: null,
    appliedBlock: nextBlock,
  };
}

function buildRemediationBlock(hint: string, finding: ComplianceFinding) {
  const safeHint = hint.trim().slice(0, 240) || "Add a compliant revision and rerun the check.";
  const safeIssue = (finding.issue || "unknown issue").trim().slice(0, 180);
  const safeSeverity = (finding.severity || "unknown").trim().toLowerCase();
  const safeLocation = (finding.location || "Location unavailable").trim().slice(0, 120);

  return [
    REMEDIATION_BLOCK_START,
    `- Selected issue: ${safeIssue}`,
    `- Severity: ${safeSeverity}`,
    `- Location: ${safeLocation}`,
    `- Suggested remediation: ${safeHint}`,
    "- Operator note: revise the draft text directly above, then rerun compliance.",
    REMEDIATION_BLOCK_END,
  ].join("\n");
}

function getProtectedZoneWarning(sourceValues: Array<string | undefined>) {
  const source = sourceValues.filter(Boolean).join(" ").toLowerCase();
  if (!source) return null;

  const legalZone = ["legal", "policy", "legal-review", "terms", "disclaimer"].some((token) => source.includes(token));
  const citationZone = ["citation", "attribution", "source", "footnote"].some((token) => source.includes(token));
  const metadataZone = ["metadata", "compliance-result", "audit", "header"].some((token) => source.includes(token));

  if (!legalZone && !citationZone && !metadataZone) {
    return null;
  }

  const zones: string[] = [];
  if (legalZone) zones.push("legal/disclaimer");
  if (citationZone) zones.push("citation/attribution");
  if (metadataZone) zones.push("compliance metadata");

  return `Protected/prohibited transform zone detected (${zones.join(", ")}). Review edits manually before apply/regenerate.`;
}

function plainTextToHtml(input: string): string {
  return plainTextToContractHtml(input);
}

function normalizeForUnsavedCheck(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

function hasMeaningfulContent(input: string) {
  return normalizeForUnsavedCheck(input).length >= 20;
}

export function EditorShell() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId")?.trim() ?? "";
  const [contentHtml, setContentHtml] = useState("<p></p>");
  const [contentText, setContentText] = useState("");
  const [status, setStatus] = useState<EditorStatus>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>("idle");
  const [generationFeedback, setGenerationFeedback] = useState<string | null>(null);
  const [generationDegraded, setGenerationDegraded] = useState<boolean | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);
  const [remediationApplyStatus, setRemediationApplyStatus] = useState<RemediationApplyStatus>("idle");
  const [contentType, setContentType] = useState<ContentType>("blog");
  const [createInputMode, setCreateInputMode] = useState<CreateInputMode>("prompt");
  const [selectedTopics, setSelectedTopics] = useState<TopicOptionId[]>([]);
  const [selectedPurposes, setSelectedPurposes] = useState<PurposeOptionId[]>([]);
  const [promptInput, setPromptInput] = useState("");
  const [lockedPrompt, setLockedPrompt] = useState<string | null>(null);
  const [isPromptLocked, setIsPromptLocked] = useState(false);
  const [isPromptAccordionCollapsed, setIsPromptAccordionCollapsed] = useState(false);
  const [isCreateInputCollapsed, setIsCreateInputCollapsed] = useState(false);
  const [isComplianceCollapsed, setIsComplianceCollapsed] = useState(true);
  const [loadedDraftTitle, setLoadedDraftTitle] = useState<string | null>(null);
  const [policyUpdatedAt, setPolicyUpdatedAt] = useState<string | null>(null);
  const [remediationPreview, setRemediationPreview] = useState<RemediationPreview | null>(null);
  const [selectedFindingContext, setSelectedFindingContext] = useState<SelectedFindingContext | null>(null);
  const [remediationApplyHistory, setRemediationApplyHistory] = useState<RemediationApplyHistoryEntry[]>([]);
  const [remediationUndoState, setRemediationUndoState] = useState<RemediationUndoState | null>(null);
  const [generationHistory, setGenerationHistory] = useState<GenerationHistoryEntry[]>([]);
  const [isLexicalReady, setIsLexicalReady] = useState(false);
  const [savedBaselineText, setSavedBaselineText] = useState("");
  const [complianceResetToken, setComplianceResetToken] = useState(0);
  const [isPromptPayloadDrawerOpen, setIsPromptPayloadDrawerOpen] = useState(false);
  const [promptPayloadDebugState, setPromptPayloadDebugState] = useState<PromptPayloadDebugState | null>(null);
  const [promptPayloadCopyFeedback, setPromptPayloadCopyFeedback] = useState<string | null>(null);

  const generationHistoryContextKey = draftId || "session-new";

  useEffect(() => {
    const controller = new AbortController();

    async function loadPolicyMeta() {
      try {
        const response = await fetch("/api/internal/configure/policy", {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });
        const payload = (await response.json().catch(() => ({}))) as ConfigurePolicyResponse;

        if (!response.ok || !payload.ok || !payload.data?.updatedAt) {
          setPolicyUpdatedAt(null);
          return;
        }

        setPolicyUpdatedAt(payload.data.updatedAt);
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setPolicyUpdatedAt(null);
      }
    }

    void loadPolicyMeta();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!draftId) {
      setLoadedDraftTitle(null);
      setSavedBaselineText("");
      return;
    }

    const controller = new AbortController();

    async function loadDraft() {
      try {
        const endpoint = `/api/internal/content/draft?id=${encodeURIComponent(draftId)}`;
        const response = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });
        const payload = (await response.json().catch(() => ({}))) as DraftResponse;

        if (!response.ok || !payload.ok || !payload.data) {
          throw new Error(payload.error || "Unable to open draft.");
        }

        const loadedBody = payload.data.body ?? "";
        const normalized = normalizeIncomingDraftBody(loadedBody);
        setContentHtml(normalized.html);
        setContentText(normalized.text);
        setSavedBaselineText(normalized.text);
        setLoadedDraftTitle(payload.data.title || "Untitled Draft");
        setStatus("idle");
        setFeedback(`Opened draft: ${payload.data.title || "Untitled Draft"}`);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setLoadedDraftTitle(null);
        setStatus("error");
        setFeedback(err instanceof Error ? err.message : "Unable to open draft.");
      }
    }

    void loadDraft();

    return () => controller.abort();
  }, [draftId]);

  useEffect(() => {
    setGenerationHistory([]);
  }, [generationHistoryContextKey]);

  const canSave = isLexicalReady && contentText.trim().length > 0 && status !== "saving";

  const hasUnsavedMeaningfulChanges = useMemo(() => {
    const normalizedCurrent = normalizeForUnsavedCheck(contentText);
    const normalizedBaseline = normalizeForUnsavedCheck(savedBaselineText);

    if (normalizedCurrent === normalizedBaseline) {
      return false;
    }

    return hasMeaningfulContent(normalizedCurrent) || hasMeaningfulContent(normalizedBaseline);
  }, [contentText, savedBaselineText]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("rf:create-unsaved-state", {
        detail: { hasUnsavedChanges: hasUnsavedMeaningfulChanges },
      }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("rf:create-unsaved-state", {
          detail: { hasUnsavedChanges: false },
        }),
      );
    };
  }, [hasUnsavedMeaningfulChanges]);

  const generationPrompt = useMemo(() => {
    const trimmedPrompt = promptInput.trim();

    if (createInputMode === "prompt") {
      return trimmedPrompt;
    }

    const selectedTopicLabels = TOPIC_OPTIONS
      .filter((option) => selectedTopics.includes(option.id))
      .map((option) => option.label);
    const selectedPurposeLabels = PURPOSE_OPTIONS
      .filter((option) => selectedPurposes.includes(option.id))
      .map((option) => option.label);
    const selectedTypeLabel = CONTENT_TYPE_LABELS[contentType];

    return [
      `Generate a ${selectedTypeLabel} draft for this campaign.`,
      selectedTopicLabels.length > 0
        ? `Prioritize these topics: ${selectedTopicLabels.join(", ")}.`
        : "No specific topic selected; choose the best angle from current context.",
      selectedPurposeLabels.length > 0
        ? `Optimize for these purposes: ${selectedPurposeLabels.join(", ")}.`
        : "No specific purpose selected; optimize for general audience value.",
      "Return a complete first draft ready for operator review.",
    ].join("\n");
  }, [contentType, createInputMode, promptInput, selectedPurposes, selectedTopics]);

  const canGenerate = isLexicalReady && generationPrompt.trim().length > 0 && generationStatus !== "generating";

  const selectedContentOption = useMemo(() => {
    return CREATE_CONTENT_OPTIONS.find((option) => option.apiType === contentType)?.id ?? "blog";
  }, [contentType]);

  const generationSelections = useMemo(() => ({
    topics: selectedTopics,
    purposes: selectedPurposes,
  }), [selectedPurposes, selectedTopics]);

  const onToggleTopic = (topicId: TopicOptionId) => {
    setSelectedTopics((current) =>
      current.includes(topicId) ? current.filter((item) => item !== topicId) : [...current, topicId],
    );
  };

  const capturePromptPayloadDebugState = (params: {
    assembledPrompt?: string;
    requestBody: Record<string, unknown>;
    metadata?: {
      mode?: string;
      contentType?: string;
      template?: string;
      tone?: string;
      intent?: string;
      controls?: {
        lengthTarget?: string;
        formatStyle?: string;
        audience?: string;
        objective?: string;
        controlProfile?: string;
      };
      topics?: string[];
      purposes?: string[];
    };
  }) => {
    const assembledPrompt = params.assembledPrompt?.trim();

    if (!assembledPrompt) {
      return;
    }

    setPromptPayloadDebugState({
      capturedAt: new Date().toISOString(),
      assembledPrompt,
      metadata: {
        mode: params.metadata?.mode || String(params.requestBody.mode || "single"),
        contentType: params.metadata?.contentType || String(params.requestBody.contentType || "n/a"),
        template: params.metadata?.template || "default",
        tone: params.metadata?.tone || "professional",
        intent: params.metadata?.intent || "educate",
        controls: {
          lengthTarget: params.metadata?.controls?.lengthTarget || "medium",
          formatStyle: params.metadata?.controls?.formatStyle || "standard",
          audience: params.metadata?.controls?.audience || "practitioner",
          objective: params.metadata?.controls?.objective || "consideration",
          controlProfile: params.metadata?.controls?.controlProfile || "balanced-default",
        },
        topics: params.metadata?.topics || ((params.requestBody.topics as string[] | undefined) ?? []),
        purposes: params.metadata?.purposes || ((params.requestBody.purposes as string[] | undefined) ?? []),
      },
      requestBody: params.requestBody,
    });

    setPromptPayloadCopyFeedback(null);
  };

  const onCopyPromptPayload = async () => {
    if (!promptPayloadDebugState) {
      return;
    }

    const payloadText = JSON.stringify(
      {
        assembledPrompt: promptPayloadDebugState.assembledPrompt,
        metadata: promptPayloadDebugState.metadata,
        requestBody: promptPayloadDebugState.requestBody,
      },
      null,
      2,
    );

    try {
      await navigator.clipboard.writeText(payloadText);
      setPromptPayloadCopyFeedback("Copied payload.");
    } catch {
      setPromptPayloadCopyFeedback("Copy failed.");
    }
  };

  const onTogglePurpose = (purposeId: PurposeOptionId) => {
    setSelectedPurposes((current) =>
      current.includes(purposeId) ? current.filter((item) => item !== purposeId) : [...current, purposeId],
    );
  };

  const saveStatusText = useMemo(() => {
    if (status === "saving") {
      return "Draft save status: Saving…";
    }

    if (status === "saved") {
      return "Draft save status: Saved.";
    }

    if (status === "error") {
      return "Draft save status: Save failed.";
    }

    return "Draft save status: Not saved yet.";
  }, [status]);

  const activePolicyContext = useMemo(() => {
    if (!policyUpdatedAt) {
      return "No configure policy metadata available.";
    }

    const date = new Date(policyUpdatedAt);

    if (Number.isNaN(date.getTime())) {
      return "No configure policy metadata available.";
    }

    return `Configure policy updated ${date.toLocaleString()}.`;
  }, [policyUpdatedAt]);

  const generateDraftForType = async (prompt: string, requestedType: ContentType, selections: { topics: TopicOptionId[]; purposes: PurposeOptionId[] }) => {
    const requestBody = {
      prompt,
      mode: "single" as const,
      contentType: requestedType,
      topics: selections.topics,
      purposes: selections.purposes,
    };

    const response = await fetch("/api/internal/content/generate", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const payload = (await response.json().catch(() => ({}))) as GenerateResponse;
    const generatedText = payload.data?.draft?.text?.trim() ?? "";

    if (!response.ok || !payload.ok || !generatedText) {
      throw new Error(payload.error || "Unable to generate content.");
    }

    return {
      generatedText,
      notes: payload.data?.generationMeta?.notes?.trim(),
      degraded: Boolean(payload.data?.generationMeta?.degraded),
      provider: payload.data?.generationMeta?.provider?.trim() || null,
      debug: payload.data?.debug,
      requestBody,
    };
  };


  const packageAssetTypeToContentType = (assetType: PackageAssetType): ContentType => {
    return assetType === "email" ? "newsletter" : assetType;
  };

  const generatePackageVariants = async (prompt: string, selections: { topics: TopicOptionId[]; purposes: PurposeOptionId[] }): Promise<{ variants: PackageVariantEntry[]; notes?: string }> => {
    const response = await fetch("/api/internal/content/generate", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        mode: "package",
        package: {
          assets: PACKAGE_REQUEST_ASSETS.map((assetType) => ({ assetType })),
        },
        topics: selections.topics,
        purposes: selections.purposes,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as GenerateResponse;
    const packageAssets = payload.data?.package?.assets ?? [];

    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Unable to generate campaign package.");
    }

    const variants = packageAssets
      .map((asset) => {
        const assetType = asset.assetType;
        const text = asset.draft?.text?.trim() ?? "";

        if (!assetType || !text) {
          return null;
        }

        return {
          id: `${Date.now()}-${assetType}-${Math.random().toString(36).slice(2, 8)}`,
          text,
          contentType: packageAssetTypeToContentType(assetType),
          degraded: Boolean(asset.generationMeta?.degraded),
          provider: asset.generationMeta?.provider?.trim() || null,
        };
      })
      .filter((item): item is PackageVariantEntry => Boolean(item));

    if (variants.length === 0) {
      throw new Error(payload.error || "Unable to generate campaign package.");
    }

    return {
      variants,
      notes: payload.data?.generationMeta?.notes?.trim(),
    };
  };

  const runGenerate = async (prompt: string, successMessage?: string) => {
    const trimmedPrompt = prompt.trim();

    if (!isLexicalReady) {
      setGenerationStatus("error");
      setGenerationFeedback("Editor is still loading. Wait a moment and try again.");
      return;
    }

    if (!trimmedPrompt || generationStatus === "generating") {
      setGenerationStatus("error");
      setGenerationFeedback("Add AI instructions before generating.");
      return;
    }

    setLockedPrompt(trimmedPrompt);
    setIsPromptLocked(true);

    setGenerationStatus("generating");
    setGenerationFeedback("Generating draft text...");
    setGenerationDegraded(null);

    try {
      const generated = await generateDraftForType(trimmedPrompt, contentType, generationSelections);
      const variantId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      capturePromptPayloadDebugState({
        assembledPrompt: generated.debug?.assembledPrompt,
        metadata: generated.debug?.metadata,
        requestBody: generated.requestBody,
      });

      const generatedHtml = plainTextToHtml(generated.generatedText);
      setContentHtml(generatedHtml);
      setContentText(generated.generatedText);
      setGenerationStatus("generated");
      const singleHistoryEntry: GenerationHistoryEntry = {
        id: variantId,
        mode: "single",
        createdAt: new Date().toISOString(),
        variant: {
          id: variantId,
          text: generated.generatedText,
          contentType,
          degraded: generated.degraded,
          provider: generated.provider,
        },
      };
      setGenerationHistory((current) => [singleHistoryEntry, ...current].slice(0, MAX_GENERATION_HISTORY));

      setGenerationDegraded(generated.degraded);
      setGenerationFeedback(
        generated.degraded
          ? generated.notes || "Draft generated in degraded fallback mode. Review carefully before saving."
          : successMessage || generated.notes || "Draft generated successfully. Review and save when ready.",
      );
      setReviewFeedback(
        generated.degraded
          ? `Generation runtime: degraded fallback${generated.provider ? ` via ${generated.provider}` : ""}.`
          : `Generation runtime: success${generated.provider ? ` via ${generated.provider}` : ""}.`,
      );
      if (createInputMode === "prompt") {
        setIsPromptAccordionCollapsed(true);
      }
      setIsCreateInputCollapsed(true);

      setRemediationPreview(null);
      setStatus("idle");
      setFeedback(null);
    } catch (err) {
      setGenerationStatus("error");
      setGenerationDegraded(null);
      setGenerationFeedback(err instanceof Error ? err.message : "Unable to generate content.");
    }
  };

  const onGenerate = async () => {
    if (!canGenerate) {
      setGenerationStatus("error");
      setGenerationFeedback(createInputMode === "prompt" ? "Add AI instructions before generating." : "Select topic/purpose filters before generating.");
      return;
    }

    await runGenerate(generationPrompt);
  };

  const onTogglePromptLock = () => {
    if (isPromptLocked) {
      setIsPromptLocked(false);
      setIsPromptAccordionCollapsed(false);
      return;
    }

    const trimmed = (createInputMode === "prompt" ? promptInput : generationPrompt).trim();
    if (!trimmed) {
      setGenerationStatus("error");
      setGenerationFeedback(createInputMode === "prompt" ? "Add AI instructions before locking prompt." : "Select topic/purpose filters before locking prompt.");
      return;
    }

    setLockedPrompt(trimmed);
    if (createInputMode === "prompt") {
      setPromptInput(trimmed);
    }
    setIsPromptLocked(true);
    setIsPromptAccordionCollapsed(true);
  };

  const onSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!canSave) {
      setStatus("error");
      setFeedback("Add some content before saving.");
      return;
    }

    setStatus("saving");
    setFeedback("Saving draft...");

    const trimmedContent = contentText.trim();
    const titleFromContent = trimmedContent.split(/\r?\n/)[0]?.trim() ?? "";
    const fallbackTitle = titleFromContent ? titleFromContent.slice(0, 80) : "Untitled Draft";
    const resolvedTitle = loadedDraftTitle?.trim() || fallbackTitle;

    try {
      const response = await fetch("/api/internal/content/draft", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: resolvedTitle,
          body: contentHtml,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as DraftResponse;

      if (!response.ok || !payload.ok || !payload.data) {
        const fieldError = payload.fieldErrors?.find((item) => item?.message)?.message;
        throw new Error(fieldError || payload.error || "Save failed. Please try again.");
      }

      setStatus("saved");
      setSavedBaselineText(contentText);
      setComplianceResetToken((current) => current + 1);
      const savedTitle = payload.data.title?.trim() || resolvedTitle;
      const savedId = payload.data.id?.trim();
      const draftHint = [savedTitle ? `title: ${savedTitle}` : null, savedId ? `id: ${savedId}` : null]
        .filter(Boolean)
        .join(" · ");

      setFeedback(
        draftHint
          ? `Draft saved (${draftHint}). You can now run compliance checks.`
          : "Draft saved. You can now run compliance checks.",
      );
    } catch (err) {
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Save failed. Please try again.");
    }
  };

  const applyRemediationViaApi = async (context: SelectedFindingContext) => {
    const response = await fetch("/api/internal/compliance/remediation/apply", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentContent: contentText,
        findingId: context.findingId,
        finding: {
          issue: context.issue,
          severity: context.severity,
          location: context.location,
          remediationHint: context.remediationHint,
        },
        draftContextId: generationHistoryContextKey,
        activeDraftContextId: generationHistoryContextKey,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as RemediationApplyResponse;

    if (!response.ok || !payload.ok || !payload.data) {
      const fieldError = payload.fieldErrors?.find((item) => item?.message)?.message;
      throw new Error(fieldError || payload.error || "Unable to apply remediation automatically.");
    }

    return payload.data;
  };

  const onApplyRemediationHint = async (hint: string, finding: ComplianceFinding) => {
    const issue = finding.issue || "unknown issue";
    const severity = (finding.severity || "unknown").toLowerCase();
    const location = finding.location || "Location unavailable";

    if (!selectedFindingContext) {
      setRemediationApplyStatus("error");
      setReviewFeedback("Select a single finding before applying auto-remediation.");
      return;
    }

    setRemediationApplyStatus("applying");
    setReviewFeedback("Applying auto-remediation preview for selected finding...");

    try {
      const applied = await applyRemediationViaApi(selectedFindingContext);
      setRemediationUndoState({
        previousContent: contentText,
        preview: remediationPreview,
      });
      setContentHtml(plainTextToHtml(applied.nextContent));
    setContentText(applied.nextContent);
      setRemediationPreview({
        issue,
        severity,
        location,
        previousBlock: applied.previousBlock,
        appliedBlock: applied.appliedBlock,
        summary: applied.summary,
      });

      setRemediationApplyHistory((current) => [
        {
          issue,
          severity,
          location,
          hint,
          appliedAt: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 5));

      setRemediationApplyStatus("applied");
      setReviewFeedback("Auto-remediation preview applied. Review before/after summary, then save or regenerate manually.");
    } catch (err) {
      setRemediationApplyStatus("error");
      setReviewFeedback(err instanceof Error ? err.message : "Unable to apply remediation automatically.");
    }
  };

  const onRemindRemediationHint = (hint: string) => {
    setReviewFeedback(`Reminder set: ${hint}`);
  };

  const onRestoreGenerationHistory = (variant: PackageVariantEntry, entry: GenerationHistoryEntry) => {
    setContentHtml(plainTextToHtml(variant.text));
    setContentText(variant.text);
    setContentType(variant.contentType);
    setPromptInput(lockedPrompt ?? promptInput);
    setStatus("idle");
    setFeedback(`Restored ${CONTENT_TYPE_LABELS[variant.contentType]} variant from ${new Date(entry.createdAt).toLocaleString()}.`);
    setGenerationStatus("generated");
    setGenerationDegraded(variant.degraded);
    setGenerationFeedback("Restored from generation history. Review, edit, and save when ready.");
  };

  const onCopyGenerationVariant = async (variant: PackageVariantEntry) => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      setGenerationStatus("error");
      setGenerationFeedback("Clipboard access unavailable in this browser. Restore variant to editor and copy manually.");
      return;
    }

    try {
      await navigator.clipboard.writeText(variant.text);
      setGenerationStatus("generated");
      setGenerationDegraded(variant.degraded);
      setGenerationFeedback(`Copied ${CONTENT_TYPE_LABELS[variant.contentType]} variant to clipboard.`);
    } catch {
      setGenerationStatus("error");
      setGenerationFeedback("Unable to copy variant to clipboard. Restore variant to editor and copy manually.");
    }
  };

  const selectedProtectedZoneWarning = useMemo(() => {
    if (!selectedFindingContext) return null;
    return getProtectedZoneWarning([
      selectedFindingContext.issue,
      selectedFindingContext.location,
      selectedFindingContext.remediationHint,
    ]);
  }, [selectedFindingContext]);

  const onUndoLastRemediation = () => {
    if (!remediationUndoState) {
      return;
    }

    setContentHtml(plainTextToHtml(remediationUndoState.previousContent));
    setContentText(remediationUndoState.previousContent);
    setRemediationPreview(remediationUndoState.preview);
    setRemediationUndoState(null);
    setRemediationApplyStatus("idle");
    setReviewFeedback("Last remediation apply was undone. Review and continue manually.");
  };

  const onApplyAndRegenerate = async () => {
    if (!selectedFindingContext || generationStatus === "generating") {
      return;
    }

    const finding: ComplianceFinding = {
      issue: selectedFindingContext.issue,
      severity: selectedFindingContext.severity,
      location: selectedFindingContext.location,
      suggestion: selectedFindingContext.remediationHint,
    };

    let applied: { nextContent: string; previousBlock: string | null; appliedBlock: string; summary?: { changedChars: number; changedLines: number; findingId: string; draftContextId: string; }; };

    setRemediationApplyStatus("applying");
    try {
      applied = await applyRemediationViaApi(selectedFindingContext);
    } catch (err) {
      setRemediationApplyStatus("error");
      setReviewFeedback(err instanceof Error ? err.message : "Unable to apply remediation automatically.");
      return;
    }

    setRemediationUndoState({
      previousContent: contentText,
      preview: remediationPreview,
    });
    setContentHtml(plainTextToHtml(applied.nextContent));
    setContentText(applied.nextContent);
    setRemediationPreview({
      issue: finding.issue || "unknown issue",
      severity: (finding.severity || "unknown").toLowerCase(),
      location: finding.location || "Location unavailable",
      previousBlock: applied.previousBlock,
      appliedBlock: applied.appliedBlock,
      summary: applied.summary,
    });
    setRemediationApplyHistory((current) => [
      {
        issue: finding.issue || "unknown issue",
        severity: (finding.severity || "unknown").toLowerCase(),
        location: finding.location || "Location unavailable",
        hint: selectedFindingContext.remediationHint,
        appliedAt: new Date().toISOString(),
      },
      ...current,
    ].slice(0, 5));
    setRemediationApplyStatus("applied");
    setReviewFeedback("Selected remediation context applied. Regenerating draft from selected finding context...");

    await runGenerate(applied.nextContent, "Draft regenerated from selected remediation context. Review and save when ready.");
  };

  return (
    <section aria-live="polite">
      <header className="rf-page-header rf-page-header-create">
        <h2 className="rf-sr-only">Create</h2>
        <span className="rf-status-pill" role="status" aria-label={saveStatusText}>{saveStatusText}</span>
      </header>

      {loadedDraftTitle ? <p className="rf-editor-opened">Editing: {loadedDraftTitle}</p> : null}

      <div className={`rf-create-layout ${isComplianceCollapsed ? "is-compliance-collapsed" : ""}`}>
        <div className="rf-create-main">
          <section id="create-generate" className="rf-create-stage" aria-label="Generate draft stage">
            <div className="rf-generate-controls">
              <section className={`rf-control-group ${createInputMode === "prompt" && isPromptAccordionCollapsed ? "is-collapsed" : ""}`} aria-label="Content creation method">
                <div className="rf-content-type-buttons" role="group" aria-label="Content type">
                  {CREATE_CONTENT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`rf-choice-button ${selectedContentOption === option.id ? "is-active" : ""}`}
                      onClick={() => setContentType(option.apiType)}
                      disabled={generationStatus === "generating"}
                      aria-pressed={selectedContentOption === option.id}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="rf-create-input-mode-header">
                  <p className="rf-status rf-status-muted">Create content by:</p>
                  <div className="rf-generate-mode-buttons" role="group" aria-label="Content creation method">
                    <button
                      type="button"
                      className={`rf-choice-button ${createInputMode === "topics" ? "is-active" : ""}`}
                      onClick={() => setCreateInputMode("topics")}
                      disabled={generationStatus === "generating"}
                      aria-pressed={createInputMode === "topics"}
                    >
                      Select a few topics
                    </button>
                    <button
                      type="button"
                      className={`rf-choice-button ${createInputMode === "prompt" ? "is-active" : ""}`}
                      onClick={() => setCreateInputMode("prompt")}
                      disabled={generationStatus === "generating"}
                      aria-pressed={createInputMode === "prompt"}
                    >
                      AI prompt
                    </button>
                  </div>
                  <button
                    type="button"
                    className="rf-prompt-payload-toggle"
                    onClick={() => setIsPromptPayloadDrawerOpen((current) => !current)}
                    aria-expanded={isPromptPayloadDrawerOpen}
                  >
                    View prompt payload
                  </button>
                </div>

                {isCreateInputCollapsed ? (
                  <div className="rf-create-input-collapsed-summary">
                    <p className="rf-status rf-status-muted" role="status">
                      {createInputMode === "topics"
                        ? "Topics and purpose filters are minimized. Re-open to adjust, then generate again."
                        : "AI prompt input is minimized. Re-open to review or edit instructions."}
                    </p>
                    <button
                      type="button"
                      className="rf-input-reopen-button"
                      onClick={() => setIsCreateInputCollapsed(false)}
                    >
                      Edit inputs
                    </button>
                  </div>
                ) : createInputMode === "topics" ? (
                  <div className="rf-topic-purpose-grid">
                    <div>
                      <p className="rf-status rf-status-muted">Topics</p>
                      <div className="rf-topic-purpose-buttons" role="group" aria-label="Topic options">
                        {TOPIC_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            className={`rf-choice-button ${selectedTopics.includes(option.id) ? "is-active" : ""}`}
                            onClick={() => onToggleTopic(option.id)}
                            disabled={generationStatus === "generating"}
                            aria-pressed={selectedTopics.includes(option.id)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="rf-status rf-status-muted">Purpose</p>
                      <div className="rf-topic-purpose-buttons" role="group" aria-label="Purpose options">
                        {PURPOSE_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            className={`rf-choice-button ${selectedPurposes.includes(option.id) ? "is-active" : ""}`}
                            onClick={() => onTogglePurpose(option.id)}
                            disabled={generationStatus === "generating"}
                            aria-pressed={selectedPurposes.includes(option.id)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="rf-status rf-status-muted" role="status">Pick topic and purpose filters, then generate directly from this mode.</p>
                    <div className="rf-generate-action-row">
                      <button type="button" onClick={onTogglePromptLock} disabled={!isLexicalReady}>
                        {isPromptLocked ? "Unlock Prompt" : "Lock Prompt"}
                      </button>
                      <button type="button" onClick={onGenerate} disabled={!canGenerate}>
                        {generationStatus === "generating" ? "Generating..." : "Generate Content"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="rf-prompt-header-row">
                      <label htmlFor="editor-prompt">AI Instructions</label>
                    </div>
                    {isPromptAccordionCollapsed ? (
                      <div className="rf-prompt-collapsed-summary">
                        <p className="rf-status rf-status-muted" role="status">Prompt locked. Expand to view or edit instructions.</p>
                        <button type="button" onClick={() => setIsPromptAccordionCollapsed(false)}>Expand Prompt</button>
                      </div>
                    ) : (
                      <>
                        <textarea
                          id="editor-prompt"
                          name="editor-prompt"
                          value={promptInput}
                          onChange={(event) => setPromptInput(event.target.value)}
                          rows={4}
                          placeholder="Describe what to generate and any constraints."
                          disabled={isPromptLocked && generationStatus !== "generating"}
                        />
                        {lockedPrompt ? (
                          <p className="rf-status rf-status-muted" role="status">Locked prompt saved for reference.</p>
                        ) : null}
                        <div className="rf-generate-action-row">
                          <button type="button" onClick={onTogglePromptLock} disabled={!isLexicalReady}>
                            {isPromptLocked ? "Unlock Prompt" : "Lock Prompt"}
                          </button>
                          <button type="button" onClick={onGenerate} disabled={!canGenerate}>
                            {generationStatus === "generating" ? "Generating..." : "Generate Content"}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </section>
            </div>
          </section>

          {!isLexicalReady ? (
            <p className="rf-status rf-status-muted" role="status">
              Editor is initializing… generate and save controls will enable when ready.
            </p>
          ) : null}

          {generationFeedback ? (
        <p
          className={`rf-status ${
            generationStatus === "error"
              ? "rf-status-error"
              : generationDegraded
                ? "rf-status-muted"
                : "rf-status-success"
          }`}
          role={generationStatus === "error" ? "alert" : "status"}
        >
          {generationFeedback}
        </p>
      ) : null}

      {isPromptPayloadDrawerOpen ? (
        <section className="rf-prompt-payload-drawer" aria-label="Prompt payload debug">
          <div className="rf-prompt-payload-drawer-header">
            <h3>Prompt payload debug</h3>
            <button type="button" onClick={onCopyPromptPayload} disabled={!promptPayloadDebugState}>
              Copy payload
            </button>
          </div>
          {promptPayloadCopyFeedback ? <p className="rf-status rf-status-muted">{promptPayloadCopyFeedback}</p> : null}
          {promptPayloadDebugState ? (
            <>
              <p className="rf-status rf-status-muted">Captured: {new Date(promptPayloadDebugState.capturedAt).toLocaleString()}</p>
              <div className="rf-prompt-payload-meta">
                <span>mode: {promptPayloadDebugState.metadata.mode}</span>
                <span>contentType: {promptPayloadDebugState.metadata.contentType}</span>
                <span>template: {promptPayloadDebugState.metadata.template}</span>
                <span>tone: {promptPayloadDebugState.metadata.tone}</span>
                <span>intent: {promptPayloadDebugState.metadata.intent}</span>
                <span>controls: {promptPayloadDebugState.metadata.controls.controlProfile} / {promptPayloadDebugState.metadata.controls.lengthTarget} / {promptPayloadDebugState.metadata.controls.formatStyle} / {promptPayloadDebugState.metadata.controls.audience} / {promptPayloadDebugState.metadata.controls.objective}</span>
                <span>topics: {promptPayloadDebugState.metadata.topics.length > 0 ? promptPayloadDebugState.metadata.topics.join(", ") : "none"}</span>
                <span>purposes: {promptPayloadDebugState.metadata.purposes.length > 0 ? promptPayloadDebugState.metadata.purposes.join(", ") : "none"}</span>
              </div>
              <pre className="rf-prompt-payload-pre">{promptPayloadDebugState.assembledPrompt}</pre>
            </>
          ) : (
            <p className="rf-status rf-status-muted">No generation payload captured yet in this Create session.</p>
          )}
        </section>
      ) : null}

      <section id="create-save" className="rf-create-stage" aria-label="Save draft stage">
            <form onSubmit={onSave} aria-busy={status === "saving"}>
        <label htmlFor="editor-content">Editor Content</label>
        <LexicalEditorField
          value={contentHtml}
          placeholder="Write or generate content..."
          onReadyChange={setIsLexicalReady}
          onChange={({ html, text }) => {
            setContentHtml(html);
            setContentText(text);
            if (status !== "idle") {
              setStatus("idle");
              setFeedback(null);
            }
            if (generationStatus !== "idle") {
              setGenerationStatus("idle");
              setGenerationFeedback(null);
              setGenerationDegraded(null);
            }
            if (reviewFeedback) {
              setReviewFeedback(null);
            }
          }}
        />
        <p className="rf-status rf-status-muted" role="note">Remediation apply/regenerate actions are temporarily disabled during Lexical phase 1 while core generate/compliance/save flows stabilize.</p>

        <button type="submit" disabled={!canSave}>
          {status === "saving" ? "Saving..." : "Save Draft"}
        </button>
            </form>
          </section>

          {feedback ? (
        <p
          className={`rf-status ${status === "error" ? "rf-status-error" : "rf-status-success"}`}
          role={status === "error" ? "alert" : "status"}
        >
          {feedback}
        </p>
      ) : null}

      {reviewFeedback ? (
        <p className="rf-status rf-status-muted" role="status">
          {reviewFeedback}
        </p>
      ) : null}

      <section id="create-review" className="rf-review-workbench rf-create-stage" aria-label="Review workbench">
            <h3>2. Review</h3>
            <p className="rf-status rf-status-muted">Select findings and stage remediation actions.</p>
        <div className="rf-review-workbench-grid">
          <div>
            <h4>Selected Finding</h4>
            {selectedFindingContext ? (
              <>
                <p>
                  <strong>Issue:</strong> {selectedFindingContext.issue}
                </p>
                <p>
                  <strong>Severity:</strong> {selectedFindingContext.severity}
                </p>
                <p>
                  <strong>Location:</strong> {selectedFindingContext.location}
                </p>
                <p>
                  <strong>Hint:</strong> {selectedFindingContext.remediationHint}
                </p>
              </>
            ) : (
              <p className="rf-status rf-status-muted">Select a finding in Compliance to stage remediation context.</p>
            )}
            <p className="rf-status rf-status-muted" role="status">
              Auto-remediation apply is manual-only and runs for one selected finding at a time.
            </p>
            {selectedProtectedZoneWarning ? (
              <p className="rf-status rf-status-error" role="alert">
                {selectedProtectedZoneWarning}
              </p>
            ) : null}
            <div className="rf-review-workbench-actions" aria-label="Selected finding quick workflow">
              <button
                type="button"
                onClick={() => {
                  if (!selectedFindingContext) return;

                  const finding: ComplianceFinding = {
                    issue: selectedFindingContext.issue,
                    severity: selectedFindingContext.severity,
                    location: selectedFindingContext.location,
                    suggestion: selectedFindingContext.remediationHint,
                  };

                  void onApplyRemediationHint(selectedFindingContext.remediationHint, finding);
                }}
                disabled
              >
                Apply Selected Context
              </button>
              <button
                type="button"
                onClick={onApplyAndRegenerate}
                disabled
              >
                Apply + Regenerate Draft (coming soon)
              </button>
              <button
                type="button"
                onClick={onUndoLastRemediation}
                disabled={!remediationUndoState || remediationApplyStatus === "applying" || generationStatus === "generating"}
              >
                Undo Last Apply
              </button>
            </div>
          </div>

          <div>
            <h4>Session Apply History</h4>
            {remediationApplyHistory.length ? (
              <ul className="rf-review-history-list">
                {remediationApplyHistory.map((entry, index) => (
                  <li key={`${entry.appliedAt}-${index}`}>
                    <strong>{entry.severity.toUpperCase()}</strong> · {entry.issue} · {entry.location}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rf-status rf-status-muted">No remediation context applied in this session yet.</p>
            )}
          </div>
        </div>
      </section>

      {remediationPreview ? (
        <section id="create-remediate" className="rf-remediation-preview rf-create-stage" aria-label="Applied remediation context preview">
          <h3>3. Remediate</h3>
          <p className="rf-status rf-status-muted">Validate auto-remediation context before final save.</p>
          <p className="rf-status rf-status-muted" role="status">
            Issue: {remediationPreview.issue} · Severity: {remediationPreview.severity} · Location: {remediationPreview.location}
          </p>
          {remediationPreview.summary ? (
            <p className="rf-status rf-status-success" role="status">
              Summary: {remediationPreview.summary.changedChars} chars changed · {remediationPreview.summary.changedLines} lines changed.
            </p>
          ) : (
            <p className="rf-status rf-status-muted" role="status">
              Summary: preview applied with bounded context replacement.
            </p>
          )}
          <div className="rf-remediation-preview-grid">
            <div>
              <h4>Previous Context</h4>
              <pre>
                {remediationPreview.previousBlock ||
                  "No prior remediation context block. This was added as a new block."}
              </pre>
            </div>
            <div>
              <h4>Applied Context</h4>
              <pre>{remediationPreview.appliedBlock}</pre>
            </div>
          </div>
        </section>
      ) : null}


          <section className="rf-generation-history" aria-label="Generation history">
                  <div className="rf-generation-history-header">
                    <h3>Generation History</h3>
                    <p className="rf-status rf-status-muted" role="status">
                      Last {MAX_GENERATION_HISTORY} outputs for this {draftId ? "draft" : "session"}, including package variants.
                    </p>
                  </div>
          
                  {generationHistory.length ? (
                    <ul className="rf-generation-history-list">
                      {generationHistory.map((entry) => {
                        const variants = entry.mode === "single" ? [entry.variant] : entry.variants;
          
                        return (
                          <li key={entry.id} className="rf-generation-history-item">
                            <div className="rf-generation-history-meta">
                              <span className="rf-badge">{entry.mode === "single" ? "SINGLE" : "PACKAGE"}</span>
                              <span
                                className={`rf-severity-badge is-${
                                  entry.mode === "single" ? (entry.variant.degraded ? "medium" : "low") : entry.degraded ? "medium" : "low"
                                }`}
                              >
                                {entry.mode === "single" ? (entry.variant.degraded ? "DEGRADED" : "OK") : entry.degraded ? "MIXED" : "OK"}
                              </span>
                              <span>{new Date(entry.createdAt).toLocaleString()}</span>
                              {entry.mode === "single" ? (
                                entry.variant.provider ? (
                                  <span>via {entry.variant.provider}</span>
                                ) : null
                              ) : entry.providers.length ? (
                                <span>via {entry.providers.join(", ")}</span>
                              ) : null}
                            </div>
          
                            <div
                              className={`rf-generation-variants ${entry.mode === "package" ? "is-compare" : ""}`}
                              aria-label={entry.mode === "package" ? "Package variant compare" : "Generated variants"}
                            >
                              {variants.map((variant) => {
                                const preview = variant.text.replace(/\s+/g, " ").trim();
          
                                return (
                                  <article key={variant.id} className="rf-generation-variant-item">
                                    <div className="rf-generation-variant-meta">
                                      <span className="rf-badge">{CONTENT_TYPE_LABELS[variant.contentType]}</span>
                                      <span className={`rf-severity-badge is-${variant.degraded ? "medium" : "low"}`}>
                                        {variant.degraded ? "DEGRADED" : "OK"}
                                      </span>
                                      {variant.provider ? <span>via {variant.provider}</span> : null}
                                    </div>
                                    <p>{preview.slice(0, 180)}{preview.length > 180 ? "…" : ""}</p>
                                    <div className="rf-generation-history-actions">
                                      <button type="button" onClick={() => void onCopyGenerationVariant(variant)}>
                                        Copy {CONTENT_TYPE_LABELS[variant.contentType]}
                                      </button>
                                      <button type="button" onClick={() => onRestoreGenerationHistory(variant, entry)}>
                                        Restore {CONTENT_TYPE_LABELS[variant.contentType]}
                                      </button>
                                    </div>
                                  </article>
                                );
                              })}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="rf-status rf-status-muted">No generated drafts in this context yet.</p>
                  )}
                </section>

        </div>

        <aside className={`rf-create-compliance ${isComplianceCollapsed ? "is-collapsed" : ""}`} aria-label="Compliance feedback panel">
          <div className="rf-create-compliance-toggle-row">
            <button
              type="button"
              className="rf-create-compliance-toggle"
              onClick={() => setIsComplianceCollapsed((current) => !current)}
              aria-label={isComplianceCollapsed ? "Open compliance panel" : "Minimize compliance panel"}
              aria-expanded={!isComplianceCollapsed}
            >
              {isComplianceCollapsed ? "⇤ Open Compliance" : "⇥ Minimize Compliance"}
            </button>
          </div>

          <div className="rf-create-compliance-card" hidden={isComplianceCollapsed} aria-hidden={isComplianceCollapsed}>
            <CompliancePanel
              activePolicyContext={activePolicyContext}
              content={contentText}
              contentType={contentType}
              policySet="default"
              resetToken={complianceResetToken}
              onApplyRemediationHint={undefined}
              onRemindRemediationHint={undefined}
              onSelectedFindingChange={setSelectedFindingContext}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
