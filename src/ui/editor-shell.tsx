"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ComplianceFinding, CompliancePanel, SelectedFindingContext } from "./compliance-panel";

type EditorStatus = "idle" | "saving" | "saved" | "error";
type GenerationStatus = "idle" | "generating" | "generated" | "error";
type ContentType = "blog" | "linkedin" | "newsletter" | "x-thread";
type GenerationMode = "single" | "package";

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
  };
  error?: string;
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
  const safeLocation = (finding.location || "unknown:0:0").trim().slice(0, 120);

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

export function EditorShell() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId")?.trim() ?? "";
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<EditorStatus>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>("idle");
  const [generationFeedback, setGenerationFeedback] = useState<string | null>(null);
  const [generationDegraded, setGenerationDegraded] = useState<boolean | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);
  const [remediationApplyStatus, setRemediationApplyStatus] = useState<RemediationApplyStatus>("idle");
  const [contentType, setContentType] = useState<ContentType>("blog");
  const [generationMode, setGenerationMode] = useState<GenerationMode>("single");
  const [loadedDraftTitle, setLoadedDraftTitle] = useState<string | null>(null);
  const [policyUpdatedAt, setPolicyUpdatedAt] = useState<string | null>(null);
  const [remediationPreview, setRemediationPreview] = useState<RemediationPreview | null>(null);
  const [selectedFindingContext, setSelectedFindingContext] = useState<SelectedFindingContext | null>(null);
  const [remediationApplyHistory, setRemediationApplyHistory] = useState<RemediationApplyHistoryEntry[]>([]);
  const [remediationUndoState, setRemediationUndoState] = useState<RemediationUndoState | null>(null);
  const [generationHistory, setGenerationHistory] = useState<GenerationHistoryEntry[]>([]);

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

        setContent(payload.data.body ?? "");
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

  const canSave = content.trim().length > 0 && status !== "saving";
  const canGenerate = content.trim().length > 0 && generationStatus !== "generating";

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

  const policyUpdatedLabel = useMemo(() => {
    if (!policyUpdatedAt) {
      return "Policy last updated: unavailable";
    }

    const date = new Date(policyUpdatedAt);

    if (Number.isNaN(date.getTime())) {
      return "Policy last updated: unavailable";
    }

    return `Policy last updated: ${date.toLocaleString()}`;
  }, [policyUpdatedAt]);

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

  const generateDraftForType = async (prompt: string, requestedType: ContentType) => {
    const response = await fetch("/api/internal/content/generate", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        mode: "single",
        contentType: requestedType,
      }),
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
    };
  };


  const packageAssetTypeToContentType = (assetType: PackageAssetType): ContentType => {
    return assetType === "email" ? "newsletter" : assetType;
  };

  const generatePackageVariants = async (prompt: string): Promise<{ variants: PackageVariantEntry[]; notes?: string }> => {
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

    if (!trimmedPrompt || generationStatus === "generating") {
      setGenerationStatus("error");
      setGenerationFeedback("Add some source content before generating.");
      return;
    }

    setGenerationStatus("generating");
    setGenerationFeedback(generationMode === "package" ? "Generating campaign package variants..." : "Generating draft text...");
    setGenerationDegraded(null);

    try {
      if (generationMode === "single") {
        const generated = await generateDraftForType(trimmedPrompt, contentType);
        const variantId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        setContent(generated.generatedText);
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
      } else {
        const generatedPackage = await generatePackageVariants(trimmedPrompt);
        const variants = generatedPackage.variants;

        const packageId = `pkg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const degraded = variants.some((variant) => variant.degraded);
        const providers = Array.from(new Set(variants.map((variant) => variant.provider).filter(Boolean))) as string[];

        setContent(variants[0]?.text ?? "");
        setContentType(variants[0]?.contentType ?? contentType);
        setGenerationStatus("generated");
        const packageHistoryEntry: GenerationHistoryEntry = {
          id: packageId,
          mode: "package",
          createdAt: new Date().toISOString(),
          variants,
          degraded,
          providers,
        };
        setGenerationHistory((current) => [packageHistoryEntry, ...current].slice(0, MAX_GENERATION_HISTORY));

        setGenerationDegraded(degraded);
        setGenerationFeedback(
          degraded
            ? generatedPackage.notes || "Campaign package generated with one or more degraded variants. Review each variant before saving."
            : generatedPackage.notes || "Campaign package generated. Select any variant below to restore it into the editor.",
        );
        setReviewFeedback(
          `Package variants ready: ${variants.map((variant) => variant.contentType.toUpperCase()).join(", ")}${providers.length ? ` · providers: ${providers.join(", ")}` : ""}.`,
        );
      }

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
      setGenerationFeedback("Add some source content before generating.");
      return;
    }

    await runGenerate(content);
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

    const trimmedContent = content.trim();
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
          body: content,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as DraftResponse;

      if (!response.ok || !payload.ok || !payload.data) {
        const fieldError = payload.fieldErrors?.find((item) => item?.message)?.message;
        throw new Error(fieldError || payload.error || "Save failed. Please try again.");
      }

      setStatus("saved");
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
        currentContent: content,
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
    const location = finding.location || "N/A";

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
        previousContent: content,
        preview: remediationPreview,
      });
      setContent(applied.nextContent);
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
    setContent(variant.text);
    setContentType(variant.contentType);
    setStatus("idle");
    setFeedback(`Restored ${variant.contentType.toUpperCase()} variant from ${new Date(entry.createdAt).toLocaleString()}.`);
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
      setGenerationFeedback(`Copied ${variant.contentType.toUpperCase()} variant to clipboard.`);
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

    setContent(remediationUndoState.previousContent);
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
      previousContent: content,
      preview: remediationPreview,
    });
    setContent(applied.nextContent);
    setRemediationPreview({
      issue: finding.issue || "unknown issue",
      severity: (finding.severity || "unknown").toLowerCase(),
      location: finding.location || "N/A",
      previousBlock: applied.previousBlock,
      appliedBlock: applied.appliedBlock,
      summary: applied.summary,
    });
    setRemediationApplyHistory((current) => [
      {
        issue: finding.issue || "unknown issue",
        severity: (finding.severity || "unknown").toLowerCase(),
        location: finding.location || "N/A",
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
      <header className="rf-page-header">
        <h2 className="rf-page-title">Create</h2>
        <p className="rf-page-subtitle">Draft content, save progress, and run compliance checks.</p>
      </header>

      {loadedDraftTitle ? <p className="rf-editor-opened">Editing: {loadedDraftTitle}</p> : null}
      <p className="rf-status rf-status-muted" role="status">
        {saveStatusText}
      </p>
      <p className="rf-status rf-status-muted" role="status">
        {policyUpdatedLabel}
      </p>

      <nav className="rf-create-flow-shortcuts" aria-label="Create workflow shortcuts">
        <a href="#create-generate">Generate</a>
        <a href="#create-review">Review</a>
        <a href="#create-remediate">Remediate</a>
        <a href="#create-save">Save</a>
      </nav>

      <div className="rf-create-layout">
        <div className="rf-create-main">
          <section id="create-generate" className="rf-create-stage" aria-label="Generate draft stage">
            <h3>1. Generate</h3>
            <p className="rf-status rf-status-muted">Generate or restore draft variants before review.</p>
            <div className="rf-generate-controls">
              <section className="rf-control-group" aria-label="Generation mode controls">
                <h4>Mode</h4>
                <p className="rf-status rf-status-muted">Start simple, then switch to package only when needed.</p>
                <div className="rf-generate-mode" role="radiogroup" aria-label="Generation mode">
                  <label>
                    <input
                      type="radio"
                      name="generation-mode"
                      value="single"
                      checked={generationMode === "single"}
                      onChange={() => setGenerationMode("single")}
                      disabled={generationStatus === "generating"}
                    />
                    Single draft
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="generation-mode"
                      value="package"
                      checked={generationMode === "package"}
                      onChange={() => setGenerationMode("package")}
                      disabled={generationStatus === "generating"}
                    />
                    Campaign package (Blog, LinkedIn, Newsletter, X)
                  </label>
                </div>
              </section>

              <section className="rf-control-group" aria-label="Primary output controls">
                <h4>Primary Output</h4>
                <label htmlFor="editor-content-type">Content Type</label>
                <select
                  id="editor-content-type"
                  name="editor-content-type"
                  value={contentType}
                  onChange={(event) => setContentType(event.target.value as ContentType)}
                  disabled={generationStatus === "generating" || generationMode === "package"}
                >
                  <option value="blog">Blog</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="x-thread">X Thread</option>
                </select>
              </section>

              <div className="rf-create-primary-actions" aria-label="Generate actions">
                <button type="button" onClick={onGenerate} disabled={!canGenerate}>
                  {generationStatus === "generating"
                    ? generationMode === "package"
                      ? "Generating Package..."
                      : "Generating..."
                    : generationMode === "package"
                      ? "Generate Campaign Package"
                      : "Generate Draft"}
                </button>
              </div>
            </div>

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
                            <span className="rf-badge">{variant.contentType.toUpperCase()}</span>
                            <span className={`rf-severity-badge is-${variant.degraded ? "medium" : "low"}`}>
                              {variant.degraded ? "DEGRADED" : "OK"}
                            </span>
                            {variant.provider ? <span>via {variant.provider}</span> : null}
                          </div>
                          <p>{preview.slice(0, 180)}{preview.length > 180 ? "…" : ""}</p>
                          <div className="rf-generation-history-actions">
                            <button type="button" onClick={() => void onCopyGenerationVariant(variant)}>
                              Copy {variant.contentType.toUpperCase()}
                            </button>
                            <button type="button" onClick={() => onRestoreGenerationHistory(variant, entry)}>
                              Restore {variant.contentType.toUpperCase()}
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
          </section>

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

      <section id="create-save" className="rf-create-stage" aria-label="Save draft stage">
            <h3>4. Save</h3>
            <p className="rf-status rf-status-muted">Save once you are satisfied with review and remediation updates.</p>
            <form onSubmit={onSave} aria-busy={status === "saving"}>
        <label htmlFor="editor-content">Editor Content</label>
        <textarea
          id="editor-content"
          name="editor-content"
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
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
          rows={8}
        />

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
                disabled={!selectedFindingContext || generationStatus === "generating"}
              >
                Apply Selected Context
              </button>
              <button
                type="button"
                onClick={onApplyAndRegenerate}
                disabled={!selectedFindingContext || generationStatus === "generating"}
              >
                {generationStatus === "generating" ? "Applying + Regenerating..." : "Apply + Regenerate Draft"}
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

        </div>

        <aside className="rf-create-compliance" aria-label="Compliance feedback panel">
          <div className="rf-create-compliance-card">
            <h3>Compliance Feedback</h3>
            <p className="rf-status rf-status-muted">Persistent review panel while you create.</p>
            <CompliancePanel
              activePolicyContext={activePolicyContext}
              content={content}
              contentType={contentType}
              policySet="default"
              onApplyRemediationHint={onApplyRemediationHint}
              onRemindRemediationHint={onRemindRemediationHint}
              onSelectedFindingChange={setSelectedFindingContext}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
