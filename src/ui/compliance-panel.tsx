"use client";

import React, { useState } from "react";

type ComplianceFinding = {
  severity?: string;
  issue?: string;
  details?: string;
  suggestion?: string;
  location?: string;
};

type ComplianceCheckResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  findings?: ComplianceFinding[];
};

const COMPLIANCE_CHECK_ENDPOINT = "/api/internal/compliance/check";

export function CompliancePanel() {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [findings, setFindings] = useState<ComplianceFinding[]>([]);

  const runComplianceCheck = async () => {
    if (running) return;

    setRunning(true);
    setError(null);

    try {
      const response = await fetch(COMPLIANCE_CHECK_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
      });

      const payload = (await response
        .json()
        .catch(() => ({}))) as ComplianceCheckResponse;

      if (!response.ok || payload?.ok === false) {
        setFindings([]);
        setError(payload?.error || payload?.message || "Compliance check failed.");
        return;
      }

      setFindings(Array.isArray(payload?.findings) ? payload.findings : []);
    } catch {
      setFindings([]);
      setError("Compliance check failed. Please try again.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <section aria-live="polite">
      <button type="button" onClick={runComplianceCheck} disabled={running}>
        {running ? "Running Compliance Check..." : "Run Compliance Check"}
      </button>

      {error ? (
        <p role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}

      {findings.length ? (
        <ul>
          {findings.map((finding, index) => (
            <li key={`${finding.issue || "issue"}-${index}`}>
              <p>
                <strong>Severity:</strong> {finding.severity || "N/A"}
              </p>
              <p>
                <strong>Issue:</strong> {finding.issue || "N/A"}
              </p>
              <p>
                <strong>Details:</strong> {finding.details || "N/A"}
              </p>
              <p>
                <strong>Suggestion:</strong> {finding.suggestion || "N/A"}
              </p>
              <p>
                <strong>Location:</strong> {finding.location || "N/A"}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
