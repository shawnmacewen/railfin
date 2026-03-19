import { createContactInTable, deleteContactFromTable, getContactFromTable, listContactsFromTable, updateContactInTable, type ContactStage } from "../../../lib/supabase/contacts";
import { listLeadsFromTable } from "../../../lib/supabase/leads";
import type { DataScope } from "../../../lib/supabase/scope";
import { contactFromContactTable, contactFromLead, type ContactRecord } from "./normalization";

type ValidationError = { field: string; message: string };

type ContactBody = {
  fullName?: unknown;
  primaryEmail?: unknown;
  primaryPhone?: unknown;
  source?: unknown;
  stage?: unknown;
};

const ALLOWED_STAGES: ContactStage[] = ["new", "contacted", "qualified", "closed"];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStage(value: unknown): value is ContactStage {
  return typeof value === "string" && ALLOWED_STAGES.includes(value as ContactStage);
}

function applyFilters(items: ContactRecord[], filters: { search?: string; stage?: string; source?: string }) {
  const search = (filters.search ?? "").trim().toLowerCase();
  const stage = (filters.stage ?? "").trim().toLowerCase();
  const source = (filters.source ?? "").trim().toLowerCase();

  return items.filter((item) => {
    if (stage && item.lead.stage.toLowerCase() !== stage) return false;
    if (source && (item.source ?? "").toLowerCase() !== source) return false;

    if (!search) return true;
    const haystack = [item.fullName, item.primaryEmail, item.primaryPhone ?? "", item.source ?? "", item.lead.stage].join(" ").toLowerCase();
    return haystack.includes(search);
  });
}

function validateContactBody(body: ContactBody | undefined):
  | { ok: true; data: { fullName: string; primaryEmail: string; primaryPhone: string | null; source: string | null; stage: ContactStage } }
  | { ok: false; error: string; fieldErrors: ValidationError[] } {
  if (!isPlainObject(body)) return { ok: false, error: "Validation failed", fieldErrors: [{ field: "body", message: "body must be a JSON object." }] };
  if (!hasOnlyKeys(body, ["fullName", "primaryEmail", "primaryPhone", "source", "stage"])) return { ok: false, error: "Validation failed", fieldErrors: [{ field: "body", message: "Unsupported fields in request body." }] };

  const fullName = normalizeString(body.fullName);
  const primaryEmail = normalizeString(body.primaryEmail).toLowerCase();
  const primaryPhone = body.primaryPhone === undefined ? "" : normalizeString(body.primaryPhone);
  const source = body.source === undefined ? "" : normalizeString(body.source);
  const stage = body.stage;

  const fieldErrors: ValidationError[] = [];
  if (!fullName) fieldErrors.push({ field: "fullName", message: "fullName is required." });
  else if (fullName.length > 120) fieldErrors.push({ field: "fullName", message: "fullName must be 120 characters or fewer." });

  if (!primaryEmail) fieldErrors.push({ field: "primaryEmail", message: "primaryEmail is required." });
  else if (!isValidEmail(primaryEmail) || primaryEmail.length > 320) fieldErrors.push({ field: "primaryEmail", message: "primaryEmail must be a valid email address." });

  if (primaryPhone && primaryPhone.length > 32) fieldErrors.push({ field: "primaryPhone", message: "primaryPhone must be 32 characters or fewer." });
  if (source && source.length > 80) fieldErrors.push({ field: "source", message: "source must be 80 characters or fewer." });
  if (!isStage(stage)) fieldErrors.push({ field: "stage", message: "stage must be one of new, contacted, qualified, closed." });

  if (fieldErrors.length > 0) return { ok: false, error: "Validation failed", fieldErrors };

  return { ok: true, data: { fullName, primaryEmail, primaryPhone: primaryPhone || null, source: source || null, stage: stage as ContactStage } };
}

export async function internalContactsList(filters: { search?: string; stage?: string; source?: string; scope?: DataScope } = {}) {
  const scope = filters.scope ?? { ownerUserId: process.env.INTERNAL_API_DEFAULT_OWNER_ID ?? "legacy-owner" };
  const listed = await listContactsFromTable(scope);
  if (!listed.ok) {
    if (listed.blocked.error.includes("public.contacts table is missing")) {
      const leadListed = await listLeadsFromTable(scope);
      if (!leadListed.ok) return { ok: false as const, error: leadListed.blocked.error, blocked: leadListed.blocked };
      const items = applyFilters(leadListed.leads.map((lead) => contactFromLead(lead)), filters);
      return { ok: true as const, data: { items, total: items.length } };
    }
    return { ok: false as const, error: listed.blocked.error, blocked: listed.blocked };
  }

  const items = applyFilters(listed.contacts.map((contact) => contactFromContactTable(contact)), filters);
  return { ok: true as const, data: { items, total: items.length } };
}

export async function internalContactsCreate(input: { body?: ContactBody; scope: DataScope }) {
  const validated = validateContactBody(input.body);
  if (!validated.ok) return validated;

  const created = await createContactInTable({ ...validated.data, scope: input.scope });
  if (!created.ok) return { ok: false as const, error: created.blocked.error, blocked: created.blocked };
  return { ok: true as const, data: contactFromContactTable(created.contact) };
}

export async function internalContactsUpdate(input: { contactId: string; body?: ContactBody; scope: DataScope }) {
  const contactId = normalizeString(input.contactId);
  if (!contactId) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "contactId", message: "contactId is required." }] };

  const validated = validateContactBody(input.body);
  if (!validated.ok) return validated;

  const updated = await updateContactInTable({ id: contactId, ...validated.data, scope: input.scope });
  if (!updated.ok) return { ok: false as const, error: updated.blocked.error, blocked: updated.blocked };
  if (!updated.contact) return { ok: false as const, error: "Contact not found" };
  return { ok: true as const, data: contactFromContactTable(updated.contact) };
}

export async function internalContactsGet(input: { contactId: string; scope: DataScope }) {
  const contactId = normalizeString(input.contactId);
  if (!contactId) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "contactId", message: "contactId is required." }] };

  const found = await getContactFromTable(contactId, input.scope);
  if (!found.ok) return { ok: false as const, error: found.blocked.error, blocked: found.blocked };
  if (!found.contact) return { ok: false as const, error: "Contact not found" };
  return { ok: true as const, data: contactFromContactTable(found.contact) };
}

export async function internalContactsDelete(input: { contactId: string; scope: DataScope }) {
  const contactId = normalizeString(input.contactId);
  if (!contactId) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "contactId", message: "contactId is required." }] };

  const deleted = await deleteContactFromTable(contactId, input.scope);
  if (!deleted.ok) return { ok: false as const, error: deleted.blocked.error, blocked: deleted.blocked };
  if (!deleted.deleted) return { ok: false as const, error: "Contact not found" };
  return { ok: true as const, data: { id: contactId, deleted: true } };
}
