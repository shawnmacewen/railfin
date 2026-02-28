"use client";

import React, { FormEvent, useState } from "react";

import { CompliancePanel } from "./compliance-panel";

type EditorStatus = "idle" | "saving" | "saved" | "error";

export function EditorShell() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<EditorStatus>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  const canSave = content.trim().length > 0 && status !== "saving";

  const onSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!canSave) {
      setStatus("error");
      setFeedback("Add some content before saving.");
      return;
    }

    setStatus("saving");
    setFeedback("Saving draft...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setStatus("saved");
      setFeedback("Draft saved. You can now run compliance checks.");
    } catch {
      setStatus("error");
      setFeedback("Save failed. Please try again.");
    }
  };

  return (
    <section aria-live="polite">
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
          }}
          rows={8}
        />

        <button type="submit" disabled={!canSave}>
          {status === "saving" ? "Saving..." : "Save Draft"}
        </button>
      </form>

      {feedback ? (
        <p role={status === "error" ? "alert" : "status"}>{feedback}</p>
      ) : null}

      <CompliancePanel />
    </section>
  );
}
