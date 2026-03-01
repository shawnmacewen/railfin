"use client";

import React, { useMemo, useState } from "react";

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

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  unknown: 4,
};

function normalizeSeverity(severity?: string) {
  const value = (severity || "unknown").trim().toLowerCase();
  return SEVERITY_ORDER[value] !== undefined ? value : "unknown";
}

function toRemediationHint(suggestion?: string) {
  const text = (suggestion || "").trim();
  if (!text) {
    return "Add a compliant revision and rerun the check.";
  }

  return text.length > 120 ? `${text.slice(0, 117).trimEnd()}...` : text;
}

type CompliancePanelProps = {
  activePolicyContext?: string;
};

export function CompliancePanel({ activePolicyContext }: CompliancePanelProps) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [findings, setFindings] = useState<ComplianceFinding[]>([]);

  const groupedFindings = useMemo(() => {
    const grouped = new Map<string, ComplianceFinding[]>();

    for (const finding of findings) {
      const severity = normalizeSeverity(finding.severity);
      const current = grouped.get(severity) || [];
      current.push(finding);
      grouped.set(severity, current);
    }

    return Array.from(grouped.entries()).sort(
      (a, b) => SEVERITY_ORDER[a[0]] - SEVERITY_ORDER[b[0]],
    );
  }, [findings]);

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

      {activePolicyContext ? (
        <p className="rf-compliance-policy-context" role="status">
          Active policy context: {activePolicyContext}
        </p>
      ) : null}

      <p className="rf-compliance-disclaimer" role="note">
        AI-backed compliance insights are guidance, not legal approval.
      </p>

      {error ? (
        <p role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}

      {groupedFindings.length ? (
        <div className="rf-findings-groups" aria-label="Compliance findings">
          {groupedFindings.map(([severity, severityFindings]) => (
            <section key={severity} className="rf-finding-group">
              <h3>
                <span className={`rf-severity-badge is-${severity}`}>
                  {severity.toUpperCase()}
                </span>{" "}
                {severityFindings.length} finding
                {severityFindings.length === 1 ? "" : "s"}
              </h3>

              <ul>
                {severityFindings.map((finding, index) => (
                  <li
                    key={`${finding.issue || "issue"}-${severity}-${index}`}
                    className="rf-finding-card"
                  >
                    <p>
                      <strong>Issue:</strong> {finding.issue || "N/A"}
                    </p>
                    <p>
                      <strong>Details:</strong> {finding.details || "N/A"}
                    </p>
                    <p>
                      <strong>Remediation Hint:</strong>{" "}
                      {toRemediationHint(finding.suggestion)}
                    </p>
                    <p>
                      <strong>Location:</strong> {finding.location || "N/A"}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}
    </section>
  );
}
