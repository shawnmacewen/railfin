"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

type LeadMutationResponse =
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
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const closeAnyModal = useCallback(() => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setSaveError(null);
    setIsSaving(false);
    setEditingLeadId(null);
  }, []);

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/internal/crm/leads", { method: "GET", credentials: "include" });
      const payload = (await response.json().catch(() => null)) as LeadsListResponse | null;

      if (!response.ok || !payload?.ok) {
        setItems([]);
        setLoadError(payload && "error" in payload && payload.error ? payload.error : "Could not load contacts right now.");
        return;
      }

      setItems(Array.isArray(payload.data.items) ? payload.data.items : []);
    } catch {
      setItems([]);
      setLoadError("Could not load contacts right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    if (!isCreateOpen && !isEditOpen) return;

    const focusTimer = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAnyModal();
        return;
      }

      if (event.key !== "Tab") return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [closeAnyModal, isCreateOpen, isEditOpen]);

  const filteredItems = useMemo(
    () => items.filter((lead) => matchesLeadSearch(lead, searchQuery)),
    [items, searchQuery],
  );

  const totalContacts = items.length;
  const hasLeads = items.length > 0;
  const hasFilteredLeads = filteredItems.length > 0;

  const openCreateModal = () => {
    setEditingLeadId(null);
    setName("");
    setEmail("");
    setPhone("");
    setSource("");
    setStatus("new");
    setSaveError(null);
    setSaveSuccess(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setName(lead.name);
    setEmail(lead.email);
    setPhone(lead.phone ?? "");
    setSource(lead.source ?? "");
    setStatus(lead.status);
    setSaveError(null);
    setSaveSuccess(null);
    setIsEditOpen(true);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);
    setIsSaving(true);

    const isEdit = Boolean(editingLeadId);

    try {
      const response = await fetch(
        isEdit ? `/api/internal/crm/contacts/${encodeURIComponent(editingLeadId as string)}` : "/api/internal/crm/leads",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(
            isEdit
              ? {
                  fullName: name,
                  primaryEmail: email,
                  primaryPhone: phone || undefined,
                  source: source || undefined,
                  stage: status,
                }
              : {
                  name,
                  email,
                  phone: phone || undefined,
                  source: source || undefined,
                  status,
                },
          ),
        },
      );

      const payload = (await response.json().catch(() => null)) as LeadMutationResponse | null;

      if (!response.ok || !payload?.ok) {
        const validationMessage = payload && !payload.ok
          ? payload.fieldErrors?.map((item) => item.message).filter(Boolean).join(" ")
          : "";
        const fallback = payload && !payload.ok ? payload.error : null;
        setSaveError(validationMessage || fallback || `Could not ${isEdit ? "update" : "save"} contact.`);
        return;
      }

      await loadLeads();
      setSaveSuccess(isEdit ? "Contact updated." : "Contact created.");
      closeAnyModal();
    } catch {
      setSaveError(`Could not ${isEdit ? "update" : "save"} contact.`);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    setSaveError(null);

    try {
      const response = await fetch(`/api/internal/crm/contacts/${encodeURIComponent(pendingDeleteId)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        setSaveError("Delete is not available yet in this environment.");
        return;
      }

      setItems((prev) => prev.filter((lead) => lead.id !== pendingDeleteId));
      setSaveSuccess("Contact deleted.");
      setPendingDeleteId(null);
    } catch {
      setSaveError("Could not delete contact.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rf-crm-page">
      <Card>
        <div className="rf-crm-table-toolbar">
          <div className="rf-crm-toolbar-left">
            <h2 className="rf-library-section-title">Contacts</h2>
            <div className="rf-crm-search-wrap">
              <label htmlFor="crm-lead-search" className="rf-sr-only">Search contacts</label>
              <input
                id="crm-lead-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search name, email, source, or status"
              />
            </div>
          </div>
          <div className="rf-crm-toolbar-actions">
            <span className="rf-crm-count-badge" aria-label={`Total contacts: ${totalContacts}`}>
              {totalContacts}
            </span>
            <button
              ref={triggerRef}
              type="button"
              className="rf-crm-add-button"
              onClick={openCreateModal}
              aria-haspopup="dialog"
              aria-expanded={isCreateOpen || isEditOpen}
              aria-controls="rf-crm-contact-modal"
            >
              Add Contact
            </button>
          </div>
        </div>

        {saveSuccess ? <p className="rf-status rf-status-success" role="status">{saveSuccess}</p> : null}
        {saveError ? <p className="rf-status rf-status-error" role="alert">{saveError}</p> : null}

        {isCreateOpen || isEditOpen ? (
          <div
            className="rf-crm-modal-backdrop"
            onClick={(event) => {
              if (event.target === event.currentTarget) closeAnyModal();
            }}
          >
            <div
              id="rf-crm-contact-modal"
              ref={modalRef}
              className="rf-crm-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="rf-crm-contact-modal-title"
            >
              <div className="rf-crm-modal-header">
                <h3 id="rf-crm-contact-modal-title" className="rf-library-section-title">
                  {isEditOpen ? "Edit Contact" : "Create Contact"}
                </h3>
                <button type="button" className="rf-crm-modal-close" aria-label="Close contact modal" onClick={closeAnyModal}>×</button>
              </div>

              <form className="rf-events-form" onSubmit={onSubmit}>
                <label htmlFor="crm-name">Name</label>
                <input id="crm-name" ref={nameInputRef} value={name} onChange={(event) => setName(event.target.value)} required />

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

                <div className="rf-crm-modal-actions">
                  <button type="button" onClick={closeAnyModal}>Cancel</button>
                  <button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : isEditOpen ? "Save Contact" : "Create Contact"}</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {pendingDeleteId ? (
          <div className="rf-crm-delete-confirm" role="alertdialog" aria-modal="true" aria-labelledby="crm-delete-title">
            <p id="crm-delete-title">Delete this contact?</p>
            <p className="rf-status rf-status-muted">This action cannot be undone.</p>
            <div className="rf-crm-modal-actions">
              <button type="button" onClick={() => setPendingDeleteId(null)} disabled={isDeleting}>Cancel</button>
              <button type="button" onClick={() => void confirmDelete()} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <p className="rf-status rf-status-muted" role="status">Loading contacts...</p>
        ) : loadError ? (
          <div className="rf-events-empty-state">
            <p className="rf-status rf-status-error" role="alert">Unable to load contacts: {loadError}</p>
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
                      <th scope="col">Actions</th>
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
                        <td>
                          <div className="rf-crm-row-actions">
                            <button type="button" onClick={() => openEditModal(lead)}>Edit</button>
                            <button type="button" onClick={() => setPendingDeleteId(lead.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="rf-crm-cards" aria-label="Contacts list">
                {filteredItems.map((lead) => (
                  <li key={`card-${lead.id}`} className="rf-crm-card">
                    <h4>{lead.name}</h4>
                    <p><strong>Email:</strong> {lead.email}</p>
                    <p><strong>Phone:</strong> {lead.phone ?? "—"}</p>
                    <p><strong>Source:</strong> {lead.source ?? "—"}</p>
                    <p><strong>Status:</strong> {lead.status}</p>
                    <p><strong>Created:</strong> {formatDate(lead.createdAt)}</p>
                    <div className="rf-crm-row-actions">
                      <button type="button" onClick={() => openEditModal(lead)}>Edit</button>
                      <button type="button" onClick={() => setPendingDeleteId(lead.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="rf-status rf-status-muted">No contacts match “{searchQuery.trim()}”.</p>
          )
        ) : (
          <p className="rf-status rf-status-muted">No contacts yet. Use Add Contact to create your first record.</p>
        )}
      </Card>
    </div>
  );
}
