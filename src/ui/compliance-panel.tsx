"use client";

import React, { useMemo, useState } from "react";

export type ComplianceFinding = {
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
  content?: string;
  contentType?: "blog" | "linkedin" | "newsletter" | "x-thread";
  policySet?: string;
  onApplyRemediationHint?: (hint: string, finding: ComplianceFinding) => void;
  onRemindRemediationHint?: (hint: string, finding: ComplianceFinding) => void;
};

export function CompliancePanel({
  activePolicyContext,
  content,
  contentType,
  policySet,
  onApplyRemediationHint,
  onRemindRemediationHint,
}: CompliancePanelProps) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [findings, setFindings] = useState<ComplianceFinding[]>([]);
  const [selectedFindingKey, setSelectedFindingKey] = useState<string | null>(null);

  const groupedFindings = useMemo(() => {
    const grouped = new Map<string, ComplianceFinding[]>();

    for (const finding of findings) {
      const severity = normalizeSeverity(finding.severity);
      const current = grouped.get(severity) || [];
      current.push(finding);
      grouped.set(severity, current);
    }

    return Array.from(grouped.entries()).sort((a, b) => SEVERITY_ORDER[a[0]] - SEVERITY_ORDER[b[0]]);
  }, [findings]);

  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      unknown: 0,
    };

    for (const finding of findings) {
      counts[normalizeSeverity(finding.severity)] += 1;
    }

    return counts;
  }, [findings]);

  const runComplianceCheck = async () => {
    if (running) return;

    const trimmedContent = content?.trim() ?? "";
    if (!trimmedContent) {
      setFindings([]);
      setSelectedFindingKey(null);
      setError("Add editor content before running compliance check.");
      return;
    }

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
        body: JSON.stringify({
          content: trimmedContent,
          ...(contentType ? { contentType } : {}),
          ...(policySet ? { policySet } : {}),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as ComplianceCheckResponse;

      if (!response.ok || payload?.ok === false) {
        setFindings([]);
        setSelectedFindingKey(null);
        setError(payload?.error || payload?.message || "Compliance check failed.");
        return;
      }

      const nextFindings = Array.isArray(payload?.findings) ? payload.findings : [];
      setFindings(nextFindings);
      setSelectedFindingKey(null);
    } catch {
      setFindings([]);
      setSelectedFindingKey(null);
      setError("Compliance check failed. Please try again.");
    } finally {
      setRunning(false);
    }
  };

  const hasContent = Boolean(content?.trim());

  return (
    <section aria-live="polite">
      <button type="button" onClick={runComplianceCheck} disabled={running || !hasContent}>
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
          <section className="rf-findings-summary" aria-label="Findings summary">
            <h3>Findings Summary</h3>
            <p className="rf-status rf-status-muted" role="status">
              Total findings: {findings.length}
            </p>
            <ul>
              {Object.keys(SEVERITY_ORDER).map((severity) => (
                <li key={`summary-${severity}`}>
                  <span className={`rf-severity-badge is-${severity}`}>{severity.toUpperCase()}</span>
                  <span>{severityCounts[severity]} findings</span>
                </li>
              ))}
            </ul>
          </section>

          {groupedFindings.map(([severity, severityFindings]) => (
            <section key={severity} className="rf-finding-group">
              <h3>
                <span className={`rf-severity-badge is-${severity}`}>{severity.toUpperCase()}</span> {" "}
                {severityFindings.length} finding
                {severityFindings.length === 1 ? "" : "s"}
              </h3>

              <ul>
                {severityFindings.map((finding, index) => {
                  const findingKey = `${finding.issue || "issue"}-${severity}-${index}`;
                  const remediationHint = toRemediationHint(finding.suggestion);
                  const isSelected = selectedFindingKey === findingKey;

                  return (
                    <li
                      key={findingKey}
                      className={`rf-finding-card${isSelected ? " is-selected" : ""}`}
                    >
                      <p>
                        <strong>Issue:</strong> {finding.issue || "N/A"}
                      </p>
                      <p>
                        <strong>Details:</strong> {finding.details || "N/A"}
                      </p>
                      <p>
                        <strong>Remediation Hint:</strong> {remediationHint}
                      </p>
                      <div className="rf-finding-actions" aria-label="Remediation actions">
                        <button type="button" onClick={() => setSelectedFindingKey(findingKey)}>
                          {isSelected ? "Hint Selected" : "Select Hint"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onApplyRemediationHint?.(remediationHint, finding)}
                          disabled={!isSelected}
                        >
                          Apply Selected
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemindRemediationHint?.(remediationHint, finding)}
                          disabled={!isSelected}
                        >
                          Remind Later
                        </button>
                      </div>
                      <p>
                        <strong>Location:</strong> {finding.location || "N/A"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      ) : null}
    </section>
  );
}
