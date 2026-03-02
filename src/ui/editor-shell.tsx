"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ComplianceFinding, CompliancePanel } from "./compliance-panel";

type EditorStatus = "idle" | "saving" | "saved" | "error";
type GenerationStatus = "idle" | "generating" | "generated" | "error";
type ContentType = "blog" | "linkedin" | "newsletter" | "x-thread";

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
};

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

type GenerateResponse = {
  ok: boolean;
  data?: {
    draft?: {
      text?: string;
      contentType?: ContentType;
    };
    generationMeta?: {
      notes?: string;
      degraded?: boolean;
    };
  };
  error?: string;
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

export function EditorShell() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId")?.trim() ?? "";
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<EditorStatus>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>("idle");
  const [generationFeedback, setGenerationFeedback] = useState<string | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType>("blog");
  const [loadedDraftTitle, setLoadedDraftTitle] = useState<string | null>(null);
  const [policyUpdatedAt, setPolicyUpdatedAt] = useState<string | null>(null);
  const [remediationPreview, setRemediationPreview] = useState<RemediationPreview | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPolicyMeta() {
      try {
        const response = await fetch("/api/internal/configure/policy", {
          method: "GET",
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

  const onGenerate = async () => {
    if (!canGenerate) {
      setGenerationStatus("error");
      setGenerationFeedback("Add some source content before generating.");
      return;
    }

    setGenerationStatus("generating");
    setGenerationFeedback("Generating draft text...");

    try {
      const response = await fetch("/api/internal/content/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: content,
          contentType,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as GenerateResponse;

      const generatedText = payload.data?.draft?.text?.trim() ?? "";
      if (!response.ok || !payload.ok || !generatedText) {
        throw new Error(payload.error || "Unable to generate content.");
      }

      setContent(generatedText);
      setGenerationStatus("generated");
      const notes = payload.data?.generationMeta?.notes?.trim();
      setGenerationFeedback(notes || "Draft generated. Review and save when ready.");
      setReviewFeedback(null);
      setRemediationPreview(null);
      setStatus("idle");
      setFeedback(null);
    } catch (err) {
      setGenerationStatus("error");
      setGenerationFeedback(err instanceof Error ? err.message : "Unable to generate content.");
    }
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

  const onApplyRemediationHint = (hint: string, finding: ComplianceFinding) => {
    const remediationBlock = buildRemediationBlock(hint, finding);

    setContent((current) => {
      const result = applyControlledRemediationContext(current, remediationBlock);
      setRemediationPreview({
        issue: finding.issue || "unknown issue",
        severity: (finding.severity || "unknown").toLowerCase(),
        location: finding.location || "N/A",
        previousBlock: result.previousBlock,
        appliedBlock: result.appliedBlock,
      });
      return result.nextContent;
    });

    setReviewFeedback("Selected remediation context applied. Compare previous/new context, then revise the draft above.");
  };

  const onRemindRemediationHint = (hint: string) => {
    setReviewFeedback(`Reminder set: ${hint}`);
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

      <div className="rf-generate-controls">
        <label htmlFor="editor-content-type">Content Type</label>
        <select
          id="editor-content-type"
          name="editor-content-type"
          value={contentType}
          onChange={(event) => setContentType(event.target.value as ContentType)}
          disabled={generationStatus === "generating"}
        >
          <option value="blog">Blog</option>
          <option value="linkedin">LinkedIn</option>
          <option value="newsletter">Newsletter</option>
          <option value="x-thread">X Thread</option>
        </select>
        <button type="button" onClick={onGenerate} disabled={!canGenerate}>
          {generationStatus === "generating" ? "Generating..." : "Generate Draft"}
        </button>
      </div>

      {generationFeedback ? (
        <p
          className={`rf-status ${generationStatus === "error" ? "rf-status-error" : "rf-status-success"}`}
          role={generationStatus === "error" ? "alert" : "status"}
        >
          {generationFeedback}
        </p>
      ) : null}

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

      {remediationPreview ? (
        <section className="rf-remediation-preview" aria-label="Applied remediation context preview">
          <h3>Applied Remediation Context</h3>
          <p className="rf-status rf-status-muted" role="status">
            Issue: {remediationPreview.issue} · Severity: {remediationPreview.severity} · Location: {remediationPreview.location}
          </p>
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

      <CompliancePanel
        activePolicyContext={activePolicyContext}
        content={content}
        contentType={contentType}
        policySet="default"
        onApplyRemediationHint={onApplyRemediationHint}
        onRemindRemediationHint={onRemindRemediationHint}
      />
    </section>
  );
}
