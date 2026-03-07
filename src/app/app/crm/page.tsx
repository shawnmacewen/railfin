"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Card } from "../../../ui/primitives";

type LeadStatus = "new" | "contacted" | "qualified" | "closed";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  createdAt: string;
};

type LeadsListResponse =
  | { ok: true; data: { items: Lead[]; total: number } }
  | { ok: false; error?: string };

type LeadCreateResponse =
  | { ok: true; data: Lead }
  | { ok: false; error?: string; fieldErrors?: Array<{ field?: string; message?: string }> };

const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

function formatDate(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleString();
}

function matchesLeadSearch(lead: Lead, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [lead.name, lead.email, lead.source ?? "", lead.status].some((value) =>
    value.toLowerCase().includes(normalized),
  );
}

export default function CrmPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/internal/crm/leads", { method: "GET", credentials: "include" });
      const payload = (await response.json().catch(() => null)) as LeadsListResponse | null;

      if (!response.ok || !payload?.ok) {
        setItems([]);
        setLoadError(payload && "error" in payload && payload.error ? payload.error : "Could not load leads right now.");
        return;
      }

      setItems(Array.isArray(payload.data.items) ? payload.data.items : []);
    } catch {
      setItems([]);
      setLoadError("Could not load leads right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const filteredItems = useMemo(
    () => items.filter((lead) => matchesLeadSearch(lead, searchQuery)),
    [items, searchQuery],
  );

  const hasLeads = items.length > 0;
  const hasFilteredLeads = filteredItems.length > 0;

  return (
    <div className="rf-crm-page">
      <Card>
        <div className="rf-crm-table-toolbar">
          <h2 className="rf-library-section-title">Leads</h2>
          <div className="rf-crm-toolbar-actions">
            <button
              type="button"
              className="rf-crm-add-button"
              onClick={() => {
                setIsCreateOpen((prev) => !prev);
                setSaveError(null);
                setSaveSuccess(null);
              }}
              aria-expanded={isCreateOpen}
              aria-controls="rf-crm-create-lead"
            >
              {isCreateOpen ? "Close New Lead" : "Add New Lead"}
            </button>
            <div className="rf-crm-search-wrap">
              <label htmlFor="crm-lead-search" className="rf-sr-only">Search leads</label>
              <input
                id="crm-lead-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search name, email, source, or status"
              />
            </div>
          </div>
        </div>

        {isCreateOpen ? (
          <div id="rf-crm-create-lead" className="rf-crm-create-panel">
            <h3 className="rf-library-section-title">Create Lead</h3>
            <form
              className="rf-events-form"
              onSubmit={async (event) => {
                event.preventDefault();
                setSaveError(null);
                setSaveSuccess(null);
                setIsSaving(true);

                try {
                  const response = await fetch("/api/internal/crm/leads", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                      name,
                      email,
                      phone: phone || undefined,
                      source: source || undefined,
                      status,
                    }),
                  });

                  const payload = (await response.json().catch(() => null)) as LeadCreateResponse | null;

                  if (!response.ok || !payload?.ok) {
                    const validationMessage = payload && !payload.ok
                      ? payload.fieldErrors?.map((item) => item.message).filter(Boolean).join(" ")
                      : "";
                    const fallback = payload && !payload.ok ? payload.error : null;
                    setSaveError(validationMessage || fallback || "Could not save lead.");
                    return;
                  }

                  setName("");
                  setEmail("");
                  setPhone("");
                  setSource("");
                  setStatus("new");
                  setSaveSuccess("Lead created.");
                  await loadLeads();
                } catch {
                  setSaveError("Could not save lead.");
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              <label htmlFor="crm-name">Name</label>
              <input id="crm-name" value={name} onChange={(event) => setName(event.target.value)} required />

              <label htmlFor="crm-email">Email</label>
              <input id="crm-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

              <label htmlFor="crm-phone">Phone (optional)</label>
              <input id="crm-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />

              <label htmlFor="crm-source">Source (optional)</label>
              <input id="crm-source" value={source} onChange={(event) => setSource(event.target.value)} />

              <label htmlFor="crm-status">Status</label>
              <select id="crm-status" value={status} onChange={(event) => setStatus(event.target.value as LeadStatus)}>
                {STATUS_OPTIONS.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>

              <button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Create Lead"}</button>
            </form>

            {saveError ? <p className="rf-status rf-status-error" role="alert">{saveError}</p> : null}
            {saveSuccess ? <p className="rf-status rf-status-success" role="status">{saveSuccess}</p> : null}
          </div>
        ) : null}

        {isLoading ? (
          <p className="rf-status rf-status-muted" role="status">Loading leads...</p>
        ) : loadError ? (
          <div className="rf-events-empty-state">
            <p className="rf-status rf-status-error" role="alert">Unable to load leads: {loadError}</p>
            <button type="button" onClick={() => void loadLeads()}>Retry</button>
          </div>
        ) : hasLeads ? (
          hasFilteredLeads ? (
            <>
              <div className="rf-crm-table-scroll">
                <table className="rf-crm-table">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Source</th>
                      <th scope="col">Status</th>
                      <th scope="col">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((lead) => (
                      <tr key={lead.id}>
                        <td>{lead.name}</td>
                        <td>{lead.email}</td>
                        <td>{lead.phone ?? "—"}</td>
                        <td>{lead.source ?? "—"}</td>
                        <td>{lead.status}</td>
                        <td>{formatDate(lead.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="rf-crm-cards" aria-label="Leads list">
                {filteredItems.map((lead) => (
                  <li key={`card-${lead.id}`} className="rf-crm-card">
                    <h4>{lead.name}</h4>
                    <p><strong>Email:</strong> {lead.email}</p>
                    <p><strong>Phone:</strong> {lead.phone ?? "—"}</p>
                    <p><strong>Source:</strong> {lead.source ?? "—"}</p>
                    <p><strong>Status:</strong> {lead.status}</p>
                    <p><strong>Created:</strong> {formatDate(lead.createdAt)}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="rf-status rf-status-muted">No leads match “{searchQuery.trim()}”.</p>
          )
        ) : (
          <p className="rf-status rf-status-muted">No leads yet. Use Add New Lead to create your first record.</p>
        )}
      </Card>
    </div>
  );
}
