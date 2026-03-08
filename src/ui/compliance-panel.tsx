"use client";

import React, { useEffect, useMemo, useState } from "react";

export type ComplianceFinding = {
  severity?: string;
  issue?: string;
  details?: string;
  suggestion?: string;
  location?: string;
  locationLabel?: string | null;
};

type ComplianceCheckResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  findings?: ComplianceFinding[];
  meta?: {
    degraded?: boolean;
    providerChain?: {
      attempts?: Array<{
        provider?: string;
        ok?: boolean;
      }>;
      primary?: string;
    };
  };
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

function normalizeLocationDisplay(location?: string | null): string | null {
  const text = (location || "").trim();
  if (!text) return null;

  const normalized = text.toLowerCase();
  if (["unknown", "unknown:0:0", "n/a", "na", "none", "null"].includes(normalized)) {
    return null;
  }

  return text;
}

function getLocationDisplay(finding: ComplianceFinding): string | null {
  return normalizeLocationDisplay(finding.locationLabel) || normalizeLocationDisplay(finding.location);
}

function getFindingKey(finding: ComplianceFinding, severity: string, index: number) {
  return `${finding.issue || "issue"}-${severity}-${index}`;
}

function createContentSignature(content?: string, contentType?: string, policySet?: string) {
  const normalizedContent = (content || "").replace(/\s+/g, " ").trim();
  return JSON.stringify({
    content: normalizedContent,
    contentType: contentType || "",
    policySet: policySet || "",
  });
}

function getProtectedZoneWarning(finding: ComplianceFinding): string | null {
  const source = [finding.issue, finding.details, finding.suggestion, finding.locationLabel, finding.location]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

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

  return `Protected/prohibited transform zone detected (${zones.join(", ")}). Apply manually with extra review.`;
}

export type SelectedFindingContext = {
  findingId: string;
  issue: string;
  severity: string;
  location: string;
  remediationHint: string;
};

type CompliancePanelProps = {
  activePolicyContext?: string;
  content?: string;
  contentType?: "blog" | "linkedin" | "newsletter" | "x-thread";
  policySet?: string;
  resetToken?: number;
  onApplyRemediationHint?: (hint: string, finding: ComplianceFinding) => void;
  onRemindRemediationHint?: (hint: string, finding: ComplianceFinding) => void;
  onSelectedFindingChange?: (selected: SelectedFindingContext | null) => void;
};

export function CompliancePanel({
  activePolicyContext,
  content,
  contentType,
  policySet,
  resetToken,
  onApplyRemediationHint,
  onRemindRemediationHint,
  onSelectedFindingChange,
}: CompliancePanelProps) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [findings, setFindings] = useState<ComplianceFinding[]>([]);
  const [selectedFindingKey, setSelectedFindingKey] = useState<string | null>(null);
  const [runSummary, setRunSummary] = useState<string | null>(null);
  const [runDegraded, setRunDegraded] = useState(false);
  const [lastCheckSignature, setLastCheckSignature] = useState<string | null>(null);

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

  const selectedFindingMeta = useMemo(() => {
    if (!selectedFindingKey) return null;

    for (const [severity, severityFindings] of groupedFindings) {
      for (let index = 0; index < severityFindings.length; index += 1) {
        const finding = severityFindings[index];
        const findingKey = getFindingKey(finding, severity, index);

        if (findingKey === selectedFindingKey) {
          return {
            finding,
            severity,
            remediationHint: toRemediationHint(finding.suggestion),
          };
        }
      }
    }

    return null;
  }, [groupedFindings, selectedFindingKey]);

  useEffect(() => {
    if (!onSelectedFindingChange) {
      return;
    }

    if (!selectedFindingMeta || !selectedFindingKey) {
      onSelectedFindingChange(null);
      return;
    }

    onSelectedFindingChange({
      findingId: selectedFindingKey,
      issue: selectedFindingMeta.finding.issue || "N/A",
      severity: selectedFindingMeta.severity,
      location: getLocationDisplay(selectedFindingMeta.finding) || "Location unavailable",
      remediationHint: selectedFindingMeta.remediationHint,
    });
  }, [onSelectedFindingChange, selectedFindingKey, selectedFindingMeta]);

  const currentContentSignature = useMemo(
    () => createContentSignature(content, contentType, policySet),
    [content, contentType, policySet],
  );

  const isResultStale = Boolean(lastCheckSignature && currentContentSignature !== lastCheckSignature);

  useEffect(() => {
    if (resetToken === undefined) {
      return;
    }

    setFindings([]);
    setSelectedFindingKey(null);
    setError(null);
    setRunSummary(null);
    setRunDegraded(false);
    setLastCheckSignature(null);
  }, [resetToken]);

  const runComplianceCheck = async () => {
    if (running) return;

    const trimmedContent = content?.trim() ?? "";
    if (!trimmedContent) {
      setFindings([]);
      setSelectedFindingKey(null);
      setLastCheckSignature(null);
      setError("Add editor content before running compliance check.");
      return;
    }

    setRunning(true);
    setError(null);
    setRunSummary(null);
    setRunDegraded(false);

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
        setLastCheckSignature(null);
        setError(payload?.error || payload?.message || "Compliance check failed.");
        return;
      }

      const nextFindings = Array.isArray(payload?.findings) ? payload.findings : [];
      const degraded = Boolean(payload?.meta?.degraded);
      const provider =
        payload?.meta?.providerChain?.attempts?.find((attempt) => attempt?.ok)?.provider ||
        payload?.meta?.providerChain?.primary ||
        "runtime";

      setFindings(nextFindings);
      setSelectedFindingKey(null);
      setLastCheckSignature(currentContentSignature);
      setRunDegraded(degraded);
      setRunSummary(
        degraded
          ? `Compliance completed in degraded fallback mode (${provider}). Review findings carefully before publishing.`
          : `Compliance check completed successfully (${provider}).`,
      );
    } catch {
      setFindings([]);
      setSelectedFindingKey(null);
      setLastCheckSignature(null);
      setRunSummary(null);
      setRunDegraded(false);
      setError("Compliance check failed. Please try again.");
    } finally {
      setRunning(false);
    }
  };

  const hasContent = Boolean(content?.trim());

  return (
    <section className="rf-compliance-panel" aria-live="polite">
      <div className="rf-compliance-toolbar">
        <button type="button" onClick={runComplianceCheck} disabled={running || !hasContent}>
          {running ? "Running Compliance Check..." : "Run Compliance Check"}
        </button>

        {activePolicyContext ? (
          <p className="rf-compliance-policy-context" role="status">
            Active policy context: {activePolicyContext}
          </p>
        ) : null}

        {runSummary ? (
          <p className={`rf-status rf-compliance-run-summary ${runDegraded ? "rf-status-muted" : "rf-status-success"}`} role="status">
            {runSummary}
          </p>
        ) : null}

        {isResultStale ? (
          <p className="rf-status rf-status-error" role="status">
            Content changed since last check. Findings shown below may be stale until you rerun compliance.
          </p>
        ) : null}

        <p className="rf-compliance-disclaimer" role="note">
          AI-backed compliance insights are guidance, not legal approval.
        </p>
      </div>

      <div className="rf-compliance-results" aria-label="Compliance findings region">
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

            <div className="rf-severity-chip-row" aria-label="Severity summary chips">
              {Object.keys(SEVERITY_ORDER).map((severity) => (
                <span key={`summary-${severity}`} className={`rf-severity-chip is-${severity}`}>
                  <span className={`rf-severity-badge is-${severity}`}>{severity.toUpperCase()}</span>
                  <span>{severityCounts[severity]}</span>
                </span>
              ))}
            </div>

          </section>

          {groupedFindings.map(([severity, severityFindings]) => (
            <section key={severity} className="rf-finding-group">
              <h3>
                <span className={`rf-severity-badge is-${severity}`}>{severity.toUpperCase()}</span>{" "}
                {severityFindings.length} finding
                {severityFindings.length === 1 ? "" : "s"}
              </h3>

              <ul>
                {severityFindings.map((finding, index) => {
                  const findingKey = getFindingKey(finding, severity, index);
                  const remediationHint = toRemediationHint(finding.suggestion);
                  const isSelected = selectedFindingKey === findingKey;

                  const locationDisplay = getLocationDisplay(finding);

                  return (
                    <li key={findingKey} className={`rf-finding-card${isSelected ? " is-selected" : ""}`}>
                      <p>
                        <strong>Issue:</strong> {finding.issue || "N/A"}
                      </p>
                      <p>
                        <strong>Details:</strong> {finding.details || "N/A"}
                      </p>
                      <p>
                        <strong>Remediation Hint:</strong> {remediationHint}
                      </p>
                      <div className="rf-finding-actions" aria-label="Finding actions">
                        <button type="button" onClick={() => setSelectedFindingKey(findingKey)}>
                          {isSelected ? "Selected" : "Select Finding"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onApplyRemediationHint?.(remediationHint, finding)}
                          disabled={!onApplyRemediationHint}
                        >
                          Apply Hint
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemindRemediationHint?.(remediationHint, finding)}
                          disabled={!onRemindRemediationHint}
                        >
                          Remind Later
                        </button>
                      </div>
                      {locationDisplay ? (
                        <p>
                          <strong>Location:</strong> {locationDisplay}
                        </p>
                      ) : null}
                      {getProtectedZoneWarning(finding) ? (
                        <p className="rf-status rf-status-error">{getProtectedZoneWarning(finding)}</p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
