import { createLeadInTable, listLeadsFromTable, type LeadStatus } from "../../../lib/supabase/leads";

type ValidationError = { field: string; message: string };

type CreateLeadBody = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  source?: unknown;
  status?: unknown;
};

const ALLOWED_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

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

function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && ALLOWED_STATUSES.includes(value as LeadStatus);
}

export async function internalLeadsList() {
  const listed = await listLeadsFromTable();
  if (!listed.ok) {
    return { ok: false as const, error: listed.blocked.error, blocked: listed.blocked };
  }

  return { ok: true as const, data: { items: listed.leads, total: listed.leads.length } };
}

export async function internalLeadsCreate(input: { body?: CreateLeadBody }) {
  const body = input.body;
  if (!isPlainObject(body)) {
    return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "body must be a JSON object." } satisfies ValidationError] };
  }

  if (!hasOnlyKeys(body, ["name", "email", "phone", "source", "status"])) {
    return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "Unsupported fields in request body." } satisfies ValidationError] };
  }

  const name = normalizeString(body.name);
  const email = normalizeString(body.email).toLowerCase();
  const phone = body.phone === undefined ? "" : normalizeString(body.phone);
  const source = body.source === undefined ? "" : normalizeString(body.source);
  const status = body.status;

  const fieldErrors: ValidationError[] = [];
  if (!name) fieldErrors.push({ field: "name", message: "name is required." });
  else if (name.length > 120) fieldErrors.push({ field: "name", message: "name must be 120 characters or fewer." });

  if (!email) fieldErrors.push({ field: "email", message: "email is required." });
  else if (!isValidEmail(email) || email.length > 320) fieldErrors.push({ field: "email", message: "email must be a valid email address." });

  if (phone && phone.length > 32) fieldErrors.push({ field: "phone", message: "phone must be 32 characters or fewer." });
  if (source && source.length > 80) fieldErrors.push({ field: "source", message: "source must be 80 characters or fewer." });
  if (!isLeadStatus(status)) fieldErrors.push({ field: "status", message: "status must be one of new, contacted, qualified, closed." });

  if (fieldErrors.length > 0) {
    return { ok: false as const, error: "Validation failed", fieldErrors };
  }

  const created = await createLeadInTable({
    name,
    email,
    phone: phone || null,
    source: source || null,
    status: status as LeadStatus,
  });

  if (!created.ok) {
    return { ok: false as const, error: created.blocked.error, blocked: created.blocked };
  }

  return { ok: true as const, data: created.lead };
}
