"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Card } from "../../../ui/primitives";

type CampaignStatus = "draft" | "active" | "paused" | "archived";
type CampaignStepType = "email" | "wait" | "condition";

type CampaignStep = {
  id: string;
  type: CampaignStepType;
};

type CampaignSequence = {
  id: string;
  name: string;
  steps: CampaignStep[];
};

type CampaignItem = {
  id: string;
  name: string;
  objective: string | null;
  status: CampaignStatus;
  targeting: {
    segmentIds: string[];
    contactIds: string[];
    leadStages: string[];
  };
  sequences: CampaignSequence[];
  createdAt: string;
};

type CampaignListResponse =
  | { ok: true; data: { items: CampaignItem[]; total: number } }
  | { ok: false; error?: string };

type CampaignCreateResponse =
  | { ok: true; data: CampaignItem }
  | { ok: false; error?: string; fieldErrors?: Array<{ field?: string; message?: string }> };

type TargetingPreviewResponse =
  | {
      ok: true;
      data: {
        counts: {
          matchedContacts: number;
          totalContacts: number;
        };
      };
    }
  | { ok: false; error?: string };

const STATUS_OPTIONS: CampaignStatus[] = ["draft", "active", "paused", "archived"];

function formatDate(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleString();
}

function formatStepLabel(type: CampaignStepType): string {
  if (type === "email") return "Email";
  if (type === "wait") return "Wait";
  return "Condition";
}

export default function CampaignsPage() {
  const [items, setItems] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [status, setStatus] = useState<CampaignStatus>("draft");
  const [selectedSegment, setSelectedSegment] = useState("all-contacts");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [targetingSummary, setTargetingSummary] = useState<{ matched: number; total: number } | null>(null);
  const [targetingError, setTargetingError] = useState<string | null>(null);

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/internal/campaigns", { method: "GET", credentials: "include" });
      const payload = (await response.json().catch(() => null)) as CampaignListResponse | null;

      if (!response.ok || !payload?.ok) {
        setItems([]);
        setLoadError(payload && "error" in payload && payload.error ? payload.error : "Could not load campaigns right now.");
        return;
      }

      const loaded = Array.isArray(payload.data.items) ? payload.data.items : [];
      setItems(loaded);
      if (!selectedCampaignId && loaded.length > 0) {
        setSelectedCampaignId(loaded[0].id);
      }
    } catch {
      setItems([]);
      setLoadError("Could not load campaigns right now.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCampaignId]);

  const loadTargetingPreview = useCallback(async () => {
    setTargetingError(null);

    try {
      const response = await fetch("/api/internal/campaigns/targeting/preview", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segmentIds: selectedSegment ? [selectedSegment] : [], contactIds: [], leadStages: [] }),
      });

      const payload = (await response.json().catch(() => null)) as TargetingPreviewResponse | null;
      if (!response.ok || !payload?.ok) {
        setTargetingSummary(null);
        setTargetingError(payload && "error" in payload && payload.error ? payload.error : "Targeting preview unavailable.");
        return;
      }

      setTargetingSummary({
        matched: payload.data.counts.matchedContacts,
        total: payload.data.counts.totalContacts,
      });
    } catch {
      setTargetingSummary(null);
      setTargetingError("Targeting preview unavailable.");
    }
  }, [selectedSegment]);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    if (!isCreateOpen) return;
    void loadTargetingPreview();
  }, [isCreateOpen, loadTargetingPreview]);

  const selectedCampaign = useMemo(
    () => items.find((item) => item.id === selectedCampaignId) ?? items[0] ?? null,
    [items, selectedCampaignId],
  );

  return (
    <div className="rf-campaigns-page">
      <Card>
        <div className="rf-events-hero">
          <div>
            <h2 className="rf-library-section-title">Campaigns</h2>
            <p className="rf-status rf-status-muted">Build campaign scaffolds on top of contacts-first targeting and internal sequence APIs.</p>
          </div>
          <button
            type="button"
            className="rf-events-create-cta"
            onClick={() => {
              setIsCreateOpen(true);
              setSaveError(null);
              setSaveSuccess(null);
            }}
          >
            Create Campaign
          </button>
        </div>
        {saveSuccess ? <p className="rf-status rf-status-success" role="status">{saveSuccess}</p> : null}
      </Card>

      {isCreateOpen ? (
        <div className="rf-crm-modal-backdrop" onClick={(event) => event.target === event.currentTarget && setIsCreateOpen(false)}>
          <div className="rf-crm-modal" role="dialog" aria-modal="true" aria-labelledby="rf-campaign-create-title">
            <div className="rf-crm-modal-header">
              <h3 id="rf-campaign-create-title" className="rf-library-section-title">Create Campaign</h3>
              <button type="button" className="rf-crm-modal-close" aria-label="Close create campaign modal" onClick={() => setIsCreateOpen(false)}>×</button>
            </div>

            <form
              className="rf-events-form"
              onSubmit={async (event) => {
                event.preventDefault();
                setIsSaving(true);
                setSaveError(null);
                setSaveSuccess(null);

                try {
                  const response = await fetch("/api/internal/campaigns", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name,
                      objective,
                      status,
                      targeting: {
                        segmentIds: selectedSegment ? [selectedSegment] : [],
                        contactIds: [],
                        leadStages: [],
                      },
                      sequences: [
                        {
                          name: "Primary sequence",
                          steps: [
                            { type: "email", subject: "Draft outreach", body: "Placeholder email step for phase 1." },
                            { type: "wait", waitMinutes: 1440 },
                            {
                              type: "condition",
                              operator: "if",
                              rules: [{ field: "lead.stage", comparator: "equals", value: "qualified" }],
                              yesSequenceId: "follow-up-yes",
                              noSequenceId: "follow-up-no",
                            },
                          ],
                        },
                      ],
                    }),
                  });

                  const payload = (await response.json().catch(() => null)) as CampaignCreateResponse | null;
                  if (!response.ok || !payload?.ok) {
                    const validationMessage = payload && !payload.ok
                      ? payload.fieldErrors?.map((item) => item.message).filter(Boolean).join(" ")
                      : "";
                    const fallback = payload && !payload.ok ? payload.error : null;
                    setSaveError(validationMessage || fallback || "Could not create campaign.");
                    return;
                  }

                  setSaveSuccess("Campaign created.");
                  setName("");
                  setObjective("");
                  setStatus("draft");
                  setSelectedCampaignId(payload.data.id);
                  setIsCreateOpen(false);
                  await loadCampaigns();
                } catch {
                  setSaveError("Could not create campaign.");
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              <label htmlFor="campaign-name">Name</label>
              <input id="campaign-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={140} />

              <label htmlFor="campaign-objective">Objective</label>
              <textarea id="campaign-objective" value={objective} onChange={(event) => setObjective(event.target.value)} maxLength={500} />

              <label htmlFor="campaign-status">Status</label>
              <select id="campaign-status" value={status} onChange={(event) => setStatus(event.target.value as CampaignStatus)}>
                {STATUS_OPTIONS.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>

              <div className="rf-campaigns-targeting-stub">
                <h4>Targeting (phase-1 stub)</h4>
                <label htmlFor="campaign-segment">Source segment placeholder</label>
                <select
                  id="campaign-segment"
                  value={selectedSegment}
                  onChange={(event) => setSelectedSegment(event.target.value)}
                >
                  <option value="all-contacts">All Contacts</option>
                  <option value="recent-leads">Recent Leads</option>
                  <option value="qualified-followup">Qualified Follow-up</option>
                </select>

                <div className="rf-campaigns-chip-row" aria-label="Contacts and lead-stage summary">
                  <span className="rf-badge">Contacts: {targetingSummary ? targetingSummary.matched : "—"} / {targetingSummary ? targetingSummary.total : "—"}</span>
                  <span className="rf-badge">Lead stage summary: read-only in v1</span>
                </div>
                {targetingError ? <p className="rf-status rf-status-error">{targetingError}</p> : null}
              </div>

              <div className="rf-crm-modal-actions">
                <button type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                <button type="submit" disabled={isSaving}>{isSaving ? "Creating..." : "Create Campaign"}</button>
              </div>
            </form>
            {saveError ? <p className="rf-status rf-status-error" role="alert">{saveError}</p> : null}
          </div>
        </div>
      ) : null}

      <Card>
        <h3 className="rf-library-section-title">Campaign list</h3>

        {isLoading ? (
          <p className="rf-status rf-status-muted" role="status">Loading campaigns...</p>
        ) : loadError ? (
          <div className="rf-events-empty-state">
            <p className="rf-status rf-status-error" role="alert">Unable to load campaigns: {loadError}</p>
            <button type="button" onClick={() => void loadCampaigns()}>Retry</button>
          </div>
        ) : items.length === 0 ? (
          <div className="rf-events-empty-state">
            <p className="rf-status rf-status-muted">No campaigns yet. Create a campaign to begin sequence planning.</p>
          </div>
        ) : (
          <div className="rf-campaigns-table-scroll">
            <table className="rf-crm-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Status</th>
                  <th scope="col">Objective</th>
                  <th scope="col">Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className={campaign.id === selectedCampaign?.id ? "is-active" : undefined}
                    onClick={() => setSelectedCampaignId(campaign.id)}
                  >
                    <td>{campaign.name}</td>
                    <td>{campaign.status}</td>
                    <td>{campaign.objective || "—"}</td>
                    <td>{formatDate(campaign.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="rf-campaigns-detail-grid">
        <Card>
          <h3 className="rf-library-section-title">Sequence scaffold</h3>
          {selectedCampaign ? (
            <div className="rf-campaigns-sequence-list">
              {selectedCampaign.sequences.map((sequence) => (
                <article key={sequence.id} className="rf-campaigns-sequence-card">
                  <h4>{sequence.name}</h4>
                  <ul>
                    {sequence.steps.map((step) => (
                      <li key={step.id}>{formatStepLabel(step.type)} placeholder</li>
                    ))}
                  </ul>
                  <p className="rf-status rf-status-muted">Coming next: branching editor (yes/no path mapping + visual flow).</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="rf-status rf-status-muted">Select a campaign to view sequence placeholders.</p>
          )}
        </Card>

        <Card>
          <h3 className="rf-library-section-title">Scheduled social posts (calendar scaffold)</h3>
          <div className="rf-campaigns-calendar-scaffold">
            <p className="rf-status rf-status-muted">Responsive placeholder area for post schedule list + calendar visualization.</p>
            <ul>
              <li>List mode: upcoming social post slots (hook to scheduling API in v2)</li>
              <li>Calendar mode: month/week toggle scaffold (drag/drop intentionally deferred)</li>
              <li>Mobile: stack list cards first, then compact calendar preview</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
