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

export default function CrmPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  const hasLeads = useMemo(() => items.length > 0, [items.length]);

  return (
    <div className="rf-crm-page">
      <Card>
        <h2 className="rf-library-section-title">Contact CRM</h2>
        <p className="rf-status rf-status-muted">Track leads with a lightweight phase-1 pipeline.</p>
      </Card>

      <Card>
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
      </Card>

      <Card>
        <h3 className="rf-library-section-title">Leads</h3>
        {isLoading ? (
          <p className="rf-status rf-status-muted" role="status">Loading leads...</p>
        ) : loadError ? (
          <div className="rf-events-empty-state">
            <p className="rf-status rf-status-error" role="alert">Unable to load leads: {loadError}</p>
            <button type="button" onClick={() => void loadLeads()}>Retry</button>
          </div>
        ) : hasLeads ? (
          <ul className="rf-crm-lead-list">
            {items.map((lead) => (
              <li key={lead.id} className="rf-crm-lead-item">
                <div>
                  <strong>{lead.name}</strong>
                  <p className="rf-status rf-status-muted">{lead.email}</p>
                  {lead.phone ? <p className="rf-status rf-status-muted">{lead.phone}</p> : null}
                  {lead.source ? <p className="rf-status rf-status-muted">Source: {lead.source}</p> : null}
                </div>
                <div>
                  <p className="rf-status rf-status-muted">Status: {lead.status}</p>
                  <p className="rf-status rf-status-muted">{formatDate(lead.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rf-status rf-status-muted">No leads yet. Create your first lead above.</p>
        )}
      </Card>
    </div>
  );
}
