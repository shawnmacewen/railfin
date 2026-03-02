"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ComplianceFinding, CompliancePanel, SelectedFindingContext } from "./compliance-panel";

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

type RemediationApplyHistoryEntry = {
  issue: string;
  severity: string;
  location: string;
  hint: string;
  appliedAt: string;
};

type GenerationHistoryEntry = {
  id: string;
  text: string;
  contentType: ContentType;
  createdAt: string;
  degraded: boolean;
  provider: string | null;
};

const MAX_GENERATION_HISTORY = 6;

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
  const [contentType, setContentType] = useState<ContentType>("blog");
  const [loadedDraftTitle, setLoadedDraftTitle] = useState<string | null>(null);
  const [policyUpdatedAt, setPolicyUpdatedAt] = useState<string | null>(null);
  const [remediationPreview, setRemediationPreview] = useState<RemediationPreview | null>(null);
  const [selectedFindingContext, setSelectedFindingContext] = useState<SelectedFindingContext | null>(null);
  const [remediationApplyHistory, setRemediationApplyHistory] = useState<RemediationApplyHistoryEntry[]>([]);
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

  const runGenerate = async (prompt: string, successMessage?: string) => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || generationStatus === "generating") {
      setGenerationStatus("error");
      setGenerationFeedback("Add some source content before generating.");
      return;
    }

    setGenerationStatus("generating");
    setGenerationFeedback("Generating draft text...");
    setGenerationDegraded(null);

    try {
      const response = await fetch("/api/internal/content/generate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
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
      const degraded = Boolean(payload.data?.generationMeta?.degraded);
      const provider = payload.data?.generationMeta?.provider?.trim();
      setGenerationHistory((current) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          text: generatedText,
          contentType,
          createdAt: new Date().toISOString(),
          degraded,
          provider: provider || null,
        },
        ...current,
      ].slice(0, MAX_GENERATION_HISTORY));
      setGenerationDegraded(degraded);
      setGenerationFeedback(
        degraded
          ? notes || "Draft generated in degraded fallback mode. Review carefully before saving."
          : successMessage || notes || "Draft generated successfully. Review and save when ready.",
      );
      setReviewFeedback(
        degraded
          ? `Generation runtime: degraded fallback${provider ? ` via ${provider}` : ""}.`
          : `Generation runtime: success${provider ? ` via ${provider}` : ""}.`,
      );
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
      setReviewFeedback("Select a finding before applying remediation.");
      return;
    }

    try {
      const applied = await applyRemediationViaApi(selectedFindingContext);
      setContent(applied.nextContent);
      setRemediationPreview({
        issue,
        severity,
        location,
        previousBlock: applied.previousBlock,
        appliedBlock: applied.appliedBlock,
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

      setReviewFeedback("Selected remediation context applied. Compare previous/new context, then revise the draft above.");
    } catch (err) {
      setReviewFeedback(err instanceof Error ? err.message : "Unable to apply remediation automatically.");
    }
  };

  const onRemindRemediationHint = (hint: string) => {
    setReviewFeedback(`Reminder set: ${hint}`);
  };

  const onRestoreGenerationHistory = (entry: GenerationHistoryEntry) => {
    setContent(entry.text);
    setStatus("idle");
    setFeedback(`Restored generated draft from ${new Date(entry.createdAt).toLocaleString()}.`);
    setGenerationStatus("generated");
    setGenerationDegraded(entry.degraded);
    setGenerationFeedback("Restored from generation history. Review, edit, and save when ready.");
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

    let applied: { nextContent: string; previousBlock: string | null; appliedBlock: string; };

    try {
      applied = await applyRemediationViaApi(selectedFindingContext);
    } catch (err) {
      setReviewFeedback(err instanceof Error ? err.message : "Unable to apply remediation automatically.");
      return;
    }

    setContent(applied.nextContent);
    setRemediationPreview({
      issue: finding.issue || "unknown issue",
      severity: (finding.severity || "unknown").toLowerCase(),
      location: finding.location || "N/A",
      previousBlock: applied.previousBlock,
      appliedBlock: applied.appliedBlock,
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

      <section className="rf-generation-history" aria-label="Generation history">
        <div className="rf-generation-history-header">
          <h3>Generation History</h3>
          <p className="rf-status rf-status-muted" role="status">
            Last {MAX_GENERATION_HISTORY} generated drafts for this {draftId ? "draft" : "session"}.
          </p>
        </div>

        {generationHistory.length ? (
          <ul className="rf-generation-history-list">
            {generationHistory.map((entry) => {
              const preview = entry.text.replace(/\s+/g, " ").trim();

              return (
                <li key={entry.id} className="rf-generation-history-item">
                  <div className="rf-generation-history-meta">
                    <span className="rf-badge">{entry.contentType.toUpperCase()}</span>
                    <span className={`rf-severity-badge is-${entry.degraded ? "medium" : "low"}`}>
                      {entry.degraded ? "DEGRADED" : "OK"}
                    </span>
                    <span>{new Date(entry.createdAt).toLocaleString()}</span>
                    {entry.provider ? <span>via {entry.provider}</span> : null}
                  </div>
                  <p>{preview.slice(0, 180)}{preview.length > 180 ? "…" : ""}</p>
                  <div className="rf-generation-history-actions">
                    <button type="button" onClick={() => onRestoreGenerationHistory(entry)}>
                      Restore to Editor
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rf-status rf-status-muted">No generated drafts in this context yet.</p>
        )}
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

      <section className="rf-review-workbench" aria-label="Review workbench">
        <h3>Review Workbench</h3>
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
        onSelectedFindingChange={setSelectedFindingContext}
      />
    </section>
  );
}
