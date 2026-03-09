"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Card } from "../../../ui/primitives";

type CampaignStatus = "draft" | "active" | "paused" | "archived";
type CampaignStepType = "email" | "wait" | "condition";
type CampaignConditionOperator = "if" | "or";

type CampaignRule = { field: string; comparator: string; value: string };

type CampaignStep =
  | { id: string; type: "email"; subject: string; body: string }
  | { id: string; type: "wait"; waitMinutes: number }
  | {
      id: string;
      type: "condition";
      operator: CampaignConditionOperator;
      rules: CampaignRule[];
      yesSequenceId: string;
      noSequenceId: string;
    };

type CampaignSequence = { id: string; name: string; steps: CampaignStep[] };

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
  | { ok: true; data: { counts: { matchedContacts: number; totalContacts: number } } }
  | { ok: false; error?: string };

type ContactsListResponse =
  | { ok: true; data: { items: Array<{ id: string; lead?: { stage?: string } }>; total: number } }
  | { ok: false; error?: string };

type SocialPostItem = {
  id: string;
  platform: string;
  content: string;
  scheduled_for: string;
  status: string;
};

type SocialPostListResponse = { ok: true; data: { items: SocialPostItem[]; total: number } } | { ok: false; error?: string };
type SocialPostCreateResponse = { ok: true; data: SocialPostItem } | { ok: false; error?: string; fieldErrors?: Array<{ message?: string }> };
type CalendarItemsResponse = { ok: true; data: { items: Array<{ id: string; title?: string; starts_at?: string; platform?: string; status?: string }> } } | { ok: false; error?: string };

type DraftStep = {
  id: string;
  type: CampaignStepType;
  emailSubject: string;
  emailBody: string;
  waitMinutes: string;
  conditionOperator: CampaignConditionOperator;
  conditionRulesText: string;
  yesSequenceId: string;
  noSequenceId: string;
};

type DraftSequence = {
  id: string;
  name: string;
  steps: DraftStep[];
};

const STATUS_OPTIONS: CampaignStatus[] = ["draft", "active", "paused", "archived"];
const STEP_TYPE_OPTIONS: CampaignStepType[] = ["email", "wait", "condition"];
const SOCIAL_PLATFORMS = ["linkedin", "x", "facebook", "instagram"];

function formatDate(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleString();
}

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function defaultDraftStep(type: CampaignStepType = "email"): DraftStep {
  return {
    id: createId("step"),
    type,
    emailSubject: "",
    emailBody: "",
    waitMinutes: "60",
    conditionOperator: "if",
    conditionRulesText: '[{"field":"lead.stage","comparator":"equals","value":"qualified"}]',
    yesSequenceId: "",
    noSequenceId: "",
  };
}

function defaultDraftSequence(name = "Primary sequence"): DraftSequence {
  return {
    id: createId("sequence"),
    name,
    steps: [defaultDraftStep("email")],
  };
}

function parseRulesJson(raw: string): CampaignRule[] {
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((item): item is CampaignRule => Boolean(item) && typeof item === "object" && typeof (item as CampaignRule).field === "string" && typeof (item as CampaignRule).comparator === "string" && typeof (item as CampaignRule).value === "string")
    .map((rule) => ({ field: rule.field.trim(), comparator: rule.comparator.trim(), value: rule.value.trim() }));
}

export default function CampaignsPage() {
  const [items, setItems] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [status, setStatus] = useState<CampaignStatus>("draft");
  const [selectedSegment, setSelectedSegment] = useState("all-contacts");
  const [draftSequences, setDraftSequences] = useState<DraftSequence[]>([defaultDraftSequence()]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [targetingSummary, setTargetingSummary] = useState<{ matched: number; total: number } | null>(null);
  const [targetingSamples, setTargetingSamples] = useState<string[]>([]);
  const [isTargetingLoading, setIsTargetingLoading] = useState(false);
  const [targetingError, setTargetingError] = useState<string | null>(null);

  const [socialPlatform, setSocialPlatform] = useState("linkedin");
  const [socialContent, setSocialContent] = useState("");
  const [socialScheduledFor, setSocialScheduledFor] = useState("");
  const [socialItems, setSocialItems] = useState<SocialPostItem[]>([]);
  const [socialCalendarItems, setSocialCalendarItems] = useState<Array<{ id: string; title?: string; starts_at?: string; platform?: string; status?: string }>>([]);
  const [isSocialLoading, setIsSocialLoading] = useState(true);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [socialCalendarError, setSocialCalendarError] = useState<string | null>(null);
  const [isSocialSaving, setIsSocialSaving] = useState(false);
  const [socialSaveError, setSocialSaveError] = useState<string | null>(null);

  const selectedCampaign = useMemo(() => items.find((item) => item.id === selectedCampaignId) ?? items[0] ?? null, [items, selectedCampaignId]);

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
      if (loaded.length > 0) {
        setSelectedCampaignId((current) => current ?? loaded[0].id);
      }
    } catch {
      setItems([]);
      setLoadError("Could not load campaigns right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTargetingPreview = useCallback(async () => {
    setIsTargetingLoading(true);
    setTargetingError(null);
    setTargetingSamples([]);

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

      setTargetingSummary({ matched: payload.data.counts.matchedContacts, total: payload.data.counts.totalContacts });

      const contactsRes = await fetch("/api/internal/crm/contacts", { method: "GET", credentials: "include" });
      const contactsPayload = (await contactsRes.json().catch(() => null)) as ContactsListResponse | null;
      if (contactsRes.ok && contactsPayload?.ok) {
        setTargetingSamples(contactsPayload.data.items.slice(0, 5).map((item) => item.id));
      }
    } catch {
      setTargetingSummary(null);
      setTargetingError("Targeting preview unavailable.");
    } finally {
      setIsTargetingLoading(false);
    }
  }, [selectedSegment]);

  const loadSocial = useCallback(async () => {
    setIsSocialLoading(true);
    setSocialError(null);
    setSocialCalendarError(null);

    try {
      const [postsRes, calendarRes] = await Promise.all([
        fetch("/api/internal/campaigns/social-posts", { method: "GET", credentials: "include" }),
        fetch("/api/internal/campaigns/calendar-items", { method: "GET", credentials: "include" }),
      ]);

      const postsPayload = (await postsRes.json().catch(() => null)) as SocialPostListResponse | null;
      if (postsRes.status === 404) {
        setSocialItems([]);
        setSocialError("Social scheduling endpoint not available yet.");
      } else if (!postsRes.ok || !postsPayload?.ok) {
        setSocialItems([]);
        setSocialError(postsPayload && "error" in postsPayload && postsPayload.error ? postsPayload.error : "Could not load scheduled social posts.");
      } else {
        setSocialItems(Array.isArray(postsPayload.data.items) ? postsPayload.data.items : []);
      }

      const calendarPayload = (await calendarRes.json().catch(() => null)) as CalendarItemsResponse | null;
      if (calendarRes.status === 404) {
        setSocialCalendarItems([]);
        setSocialCalendarError("Calendar items endpoint not available yet.");
      } else if (!calendarRes.ok || !calendarPayload?.ok) {
        setSocialCalendarItems([]);
        setSocialCalendarError(calendarPayload && "error" in calendarPayload && calendarPayload.error ? calendarPayload.error : "Could not load calendar items.");
      } else {
        setSocialCalendarItems(Array.isArray(calendarPayload.data.items) ? calendarPayload.data.items : []);
      }
    } catch {
      setSocialItems([]);
      setSocialCalendarItems([]);
      setSocialError("Could not load scheduled social posts.");
      setSocialCalendarError("Could not load calendar items.");
    } finally {
      setIsSocialLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCampaigns();
    void loadSocial();
  }, [loadCampaigns, loadSocial]);

  useEffect(() => {
    if (!isCreateOpen) return;
    void loadTargetingPreview();
  }, [isCreateOpen, loadTargetingPreview]);

  return (
    <div className="rf-campaigns-page">
      <Card>
        <div className="rf-events-hero">
          <div>
            <h2 className="rf-library-section-title">Campaigns</h2>
            <p className="rf-status rf-status-muted">Campaign builder v2: clearer sequence editing, cleaner targeting preview, and tighter social scheduling.</p>
          </div>
          <button
            type="button"
            className="rf-events-create-cta"
            onClick={() => {
              setIsCreateOpen(true);
              setSaveError(null);
            }}
          >
            Create Campaign
          </button>
        </div>
      </Card>

      {isCreateOpen ? (
        <div className="rf-crm-modal-backdrop" onClick={(event) => event.target === event.currentTarget && setIsCreateOpen(false)}>
          <div className="rf-crm-modal rf-campaigns-create-modal" role="dialog" aria-modal="true" aria-labelledby="rf-campaign-create-title">
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

                try {
                  const sequencesPayload = draftSequences.map((sequence) => ({
                    name: sequence.name.trim() || "Untitled sequence",
                    steps: sequence.steps.map((step) => {
                      if (step.type === "email") {
                        return { type: "email" as const, subject: step.emailSubject.trim(), body: step.emailBody.trim() };
                      }
                      if (step.type === "wait") {
                        return { type: "wait" as const, waitMinutes: Number(step.waitMinutes || "0") };
                      }
                      return {
                        type: "condition" as const,
                        operator: step.conditionOperator,
                        rules: parseRulesJson(step.conditionRulesText),
                        yesSequenceId: step.yesSequenceId.trim(),
                        noSequenceId: step.noSequenceId.trim(),
                      };
                    }),
                  }));

                  const response = await fetch("/api/internal/campaigns", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name,
                      objective,
                      status,
                      targeting: { segmentIds: selectedSegment ? [selectedSegment] : [], contactIds: [], leadStages: [] },
                      sequences: sequencesPayload,
                    }),
                  });

                  const payload = (await response.json().catch(() => null)) as CampaignCreateResponse | null;
                  if (!response.ok || !payload?.ok) {
                    const validationMessage = payload && !payload.ok ? payload.fieldErrors?.map((item) => item.message).filter(Boolean).join(" ") : "";
                    const fallback = payload && !payload.ok ? payload.error : null;
                    setSaveError(validationMessage || fallback || "Could not create campaign.");
                    return;
                  }

                  setName("");
                  setObjective("");
                  setStatus("draft");
                  setDraftSequences([defaultDraftSequence()]);
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
                {STATUS_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>

              <div className="rf-campaigns-targeting-stub">
                <h4>Targeting preview</h4>
                <label htmlFor="campaign-segment">Source segment</label>
                <select id="campaign-segment" value={selectedSegment} onChange={(event) => setSelectedSegment(event.target.value)}>
                  <option value="all-contacts">All Contacts</option>
                  <option value="recent-leads">Recent Leads</option>
                  <option value="qualified-followup">Qualified Follow-up</option>
                </select>

                {isTargetingLoading ? <p className="rf-status rf-status-muted">Loading targeting preview...</p> : null}
                {!isTargetingLoading && !targetingError && targetingSummary ? (
                  <div className="rf-campaigns-targeting-summary" aria-label="Contacts summary">
                    <div><p className="rf-campaigns-helper">Matched contacts</p><strong>{targetingSummary.matched}</strong></div>
                    <div><p className="rf-campaigns-helper">Total contacts</p><strong>{targetingSummary.total}</strong></div>
                    <p className="rf-status rf-status-muted">Sample IDs: {targetingSamples.length > 0 ? targetingSamples.join(", ") : "No sample IDs available."}</p>
                  </div>
                ) : null}
                {!isTargetingLoading && !targetingError && !targetingSummary ? <p className="rf-campaigns-empty-note">No targeting preview data yet.</p> : null}
                {targetingError ? <p className="rf-campaigns-empty-note">{targetingError}</p> : null}
              </div>

              <div className="rf-campaigns-builder-stack">
                <div className="rf-crm-table-toolbar">
                  <div>
                    <h4 className="rf-library-section-title">Sequence builder</h4>
                    <p className="rf-campaigns-helper">Group steps by intent (email, wait, condition) for easier review.</p>
                  </div>
                  <button
                    type="button"
                    className="rf-crm-add-button"
                    onClick={() => setDraftSequences((prev) => [...prev, defaultDraftSequence(`Sequence ${prev.length + 1}`)])}
                  >
                    Add Sequence
                  </button>
                </div>

                {draftSequences.map((sequence, sequenceIndex) => (
                  <article key={sequence.id} className="rf-campaigns-sequence-card">
                    <label htmlFor={`sequence-name-${sequence.id}`}>Sequence name</label>
                    <input
                      id={`sequence-name-${sequence.id}`}
                      value={sequence.name}
                      onChange={(event) => {
                        const next = event.target.value;
                        setDraftSequences((prev) => prev.map((item) => (item.id === sequence.id ? { ...item, name: next } : item)));
                      }}
                      required
                    />

                    <div className="rf-crm-table-toolbar">
                      <p className="rf-status rf-status-muted">Steps ({sequence.steps.length})</p>
                      <button
                        type="button"
                        className="rf-crm-add-button"
                        onClick={() => {
                          setDraftSequences((prev) => prev.map((item) => {
                            if (item.id !== sequence.id) return item;
                            return { ...item, steps: [...item.steps, defaultDraftStep(STEP_TYPE_OPTIONS[item.steps.length % STEP_TYPE_OPTIONS.length])] };
                          }));
                        }}
                      >
                        Add Step
                      </button>
                    </div>

                    <div className="rf-campaigns-step-list">
                      {sequence.steps.map((step) => (
                        <section key={step.id} className="rf-campaigns-step-card">
                          <div className="rf-campaigns-step-head">
                            <strong>{step.type === "email" ? "Email step" : step.type === "wait" ? "Wait step" : "Condition step"}</strong>
                          </div>
                          <label htmlFor={`step-type-${step.id}`}>Step type</label>
                          <select
                            id={`step-type-${step.id}`}
                            value={step.type}
                            onChange={(event) => {
                              const nextType = event.target.value as CampaignStepType;
                              setDraftSequences((prev) => prev.map((item) => {
                                if (item.id !== sequence.id) return item;
                                return {
                                  ...item,
                                  steps: item.steps.map((candidate) => (candidate.id === step.id ? { ...candidate, type: nextType } : candidate)),
                                };
                              }));
                            }}
                          >
                            {STEP_TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>

                          {step.type === "email" ? (
                            <>
                              <label htmlFor={`email-subject-${step.id}`}>Subject</label>
                              <input
                                id={`email-subject-${step.id}`}
                                value={step.emailSubject}
                                onChange={(event) => {
                                  const next = event.target.value;
                                  setDraftSequences((prev) => prev.map((item) => item.id !== sequence.id ? item : { ...item, steps: item.steps.map((candidate) => candidate.id === step.id ? { ...candidate, emailSubject: next } : candidate) }));
                                }}
                                required
                              />
                              <label htmlFor={`email-body-${step.id}`}>Body</label>
                              <textarea
                                id={`email-body-${step.id}`}
                                value={step.emailBody}
                                onChange={(event) => {
                                  const next = event.target.value;
                                  setDraftSequences((prev) => prev.map((item) => item.id !== sequence.id ? item : { ...item, steps: item.steps.map((candidate) => candidate.id === step.id ? { ...candidate, emailBody: next } : candidate) }));
                                }}
                                required
                              />
                            </>
                          ) : null}

                          {step.type === "wait" ? (
                            <>
                              <label htmlFor={`wait-minutes-${step.id}`}>Wait minutes</label>
                              <input
                                id={`wait-minutes-${step.id}`}
                                type="number"
                                min={1}
                                max={10080}
                                value={step.waitMinutes}
                                onChange={(event) => {
                                  const next = event.target.value;
                                  setDraftSequences((prev) => prev.map((item) => item.id !== sequence.id ? item : { ...item, steps: item.steps.map((candidate) => candidate.id === step.id ? { ...candidate, waitMinutes: next } : candidate) }));
                                }}
                                required
                              />
                            </>
                          ) : null}

                          {step.type === "condition" ? (
                            <>
                              <p className="rf-campaigns-helper">Set logic and branch paths for yes/no outcomes.</p>
                              <label htmlFor={`condition-operator-${step.id}`}>Rule logic</label>
                              <select
                                id={`condition-operator-${step.id}`}
                                value={step.conditionOperator}
                                onChange={(event) => {
                                  const next = event.target.value as CampaignConditionOperator;
                                  setDraftSequences((prev) => prev.map((item) => item.id !== sequence.id ? item : { ...item, steps: item.steps.map((candidate) => candidate.id === step.id ? { ...candidate, conditionOperator: next } : candidate) }));
                                }}
                              >
                                <option value="if">if (all required)</option>
                                <option value="or">or (any match)</option>
                              </select>
                              <label htmlFor={`condition-rules-${step.id}`}>Rules JSON</label>
                              <textarea
                                id={`condition-rules-${step.id}`}
                                value={step.conditionRulesText}
                                onChange={(event) => {
                                  const next = event.target.value;
                                  setDraftSequences((prev) => prev.map((item) => item.id !== sequence.id ? item : { ...item, steps: item.steps.map((candidate) => candidate.id === step.id ? { ...candidate, conditionRulesText: next } : candidate) }));
                                }}
                              />
                              <label htmlFor={`condition-yes-${step.id}`}>Yes path sequence ID</label>
                              <input
                                id={`condition-yes-${step.id}`}
                                value={step.yesSequenceId}
                                onChange={(event) => {
                                  const next = event.target.value;
                                  setDraftSequences((prev) => prev.map((item) => item.id !== sequence.id ? item : { ...item, steps: item.steps.map((candidate) => candidate.id === step.id ? { ...candidate, yesSequenceId: next } : candidate) }));
                                }}
                                required
                              />
                              <label htmlFor={`condition-no-${step.id}`}>No path sequence ID</label>
                              <input
                                id={`condition-no-${step.id}`}
                                value={step.noSequenceId}
                                onChange={(event) => {
                                  const next = event.target.value;
                                  setDraftSequences((prev) => prev.map((item) => item.id !== sequence.id ? item : { ...item, steps: item.steps.map((candidate) => candidate.id === step.id ? { ...candidate, noSequenceId: next } : candidate) }));
                                }}
                                required
                              />
                            </>
                          ) : null}
                        </section>
                      ))}
                    </div>

                    {sequenceIndex > 0 ? (
                      <button
                        type="button"
                        onClick={() => setDraftSequences((prev) => prev.filter((item) => item.id !== sequence.id))}
                      >
                        Remove Sequence
                      </button>
                    ) : null}
                  </article>
                ))}
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
          <div className="rf-events-empty-state"><p className="rf-status rf-status-muted">No campaigns yet. Create one to start building sequences.</p></div>
        ) : (
          <div className="rf-campaigns-table-scroll">
            <table className="rf-crm-table">
              <thead><tr><th>Name</th><th>Status</th><th>Objective</th><th>Created</th></tr></thead>
              <tbody>
                {items.map((campaign) => (
                  <tr key={campaign.id} className={campaign.id === selectedCampaign?.id ? "is-active" : undefined} onClick={() => setSelectedCampaignId(campaign.id)}>
                    <td>{campaign.name}</td><td>{campaign.status}</td><td>{campaign.objective || "—"}</td><td>{formatDate(campaign.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="rf-campaigns-detail-grid">
        <Card>
          <h3 className="rf-library-section-title">Sequence detail</h3>
          {selectedCampaign ? (
            <div className="rf-campaigns-sequence-list">
              {selectedCampaign.sequences.map((sequence) => (
                <article key={sequence.id} className="rf-campaigns-sequence-card">
                  <h4>{sequence.name}</h4>
                  <ul>
                    {sequence.steps.map((step) => (
                      <li key={step.id}>
                        {step.type === "email" ? `Email: ${step.subject}` : null}
                        {step.type === "wait" ? `Wait: ${step.waitMinutes} min` : null}
                        {step.type === "condition" ? `Condition (${step.operator}) yes:${step.yesSequenceId || "—"} / no:${step.noSequenceId || "—"}` : null}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          ) : (
            <p className="rf-status rf-status-muted">Select a campaign to view sequence details.</p>
          )}
        </Card>

        <Card>
          <h3 className="rf-library-section-title">Scheduled social posts</h3>
          <form
            className="rf-events-form"
            onSubmit={async (event) => {
              event.preventDefault();
              setIsSocialSaving(true);
              setSocialSaveError(null);
              try {
                const response = await fetch("/api/internal/campaigns/social-posts", {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ platform: socialPlatform, content: socialContent, scheduled_for: socialScheduledFor }),
                });

                const payload = (await response.json().catch(() => null)) as SocialPostCreateResponse | null;
                if (response.status === 404) {
                  setSocialSaveError("Social scheduling endpoint not available yet.");
                  return;
                }
                if (!response.ok || !payload?.ok) {
                  const validationMessage = payload && !payload.ok ? payload.fieldErrors?.map((item) => item.message).filter(Boolean).join(" ") : "";
                  const fallback = payload && !payload.ok ? payload.error : null;
                  setSocialSaveError(validationMessage || fallback || "Could not schedule social post.");
                  return;
                }

                setSocialContent("");
                setSocialScheduledFor("");
                await loadSocial();
              } catch {
                setSocialSaveError("Could not schedule social post.");
              } finally {
                setIsSocialSaving(false);
              }
            }}
          >
            <div className="rf-campaigns-social-form-row">
              <div>
                <label htmlFor="social-platform">Platform</label>
                <select id="social-platform" value={socialPlatform} onChange={(event) => setSocialPlatform(event.target.value)}>
                  {SOCIAL_PLATFORMS.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="social-scheduled-for">Scheduled for</label>
                <input id="social-scheduled-for" type="datetime-local" value={socialScheduledFor} onChange={(event) => setSocialScheduledFor(event.target.value)} required />
                <p className="rf-campaigns-helper">Date/time uses your local browser timezone.</p>
              </div>
            </div>
            <label htmlFor="social-content">Content</label>
            <textarea id="social-content" value={socialContent} onChange={(event) => setSocialContent(event.target.value)} required />
            <div className="rf-crm-modal-actions"><button type="submit" disabled={isSocialSaving}>{isSocialSaving ? "Scheduling..." : "Schedule post"}</button></div>
            {socialSaveError ? <p className="rf-status rf-status-error">{socialSaveError}</p> : null}
          </form>

          <div className="rf-campaigns-social-grid">
            <section className="rf-campaigns-calendar-scaffold">
              <h4>Scheduled posts list</h4>
              {isSocialLoading ? <p className="rf-status rf-status-muted">Loading social posts...</p> : null}
              {socialError ? <p className="rf-status rf-status-error">{socialError}</p> : null}
              {!isSocialLoading && !socialError && socialItems.length === 0 ? <p className="rf-status rf-status-muted">No scheduled social posts.</p> : null}
              {!isSocialLoading && !socialError && socialItems.length > 0 ? (
                <ul>
                  {socialItems.map((post) => <li key={post.id}><strong>{post.platform}</strong> <span className="rf-campaigns-status-chip">{post.status}</span> {formatDate(post.scheduled_for)}</li>)}
                </ul>
              ) : null}
            </section>

            <section className="rf-campaigns-calendar-scaffold">
              <h4>Calendar / timeline</h4>
              {isSocialLoading ? <p className="rf-status rf-status-muted">Loading calendar items...</p> : null}
              {socialCalendarError ? <p className="rf-status rf-status-error">{socialCalendarError}</p> : null}
              {!isSocialLoading && !socialCalendarError && socialCalendarItems.length === 0 ? <p className="rf-status rf-status-muted">No calendar items.</p> : null}
              {!isSocialLoading && !socialCalendarError && socialCalendarItems.length > 0 ? (
                <ul>
                  {socialCalendarItems.map((item) => <li key={item.id}><strong>{item.title || item.platform || "Scheduled item"}</strong> <span className="rf-campaigns-status-chip">{item.status || "pending"}</span> {item.starts_at ? formatDate(item.starts_at) : "No start time"}</li>)}
                </ul>
              ) : null}
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
