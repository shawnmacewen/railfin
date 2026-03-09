import { internalCampaignEventTriggerProcess } from "../campaigns/contracts";
import { AttendanceIntent, EventStatus, createEventRecord, createRegistrationRecord, listEventRecords, readEventRecord } from "./store";

type ValidationError = { field: string; message: string };
type EventCreateBody = { title?: unknown; date?: unknown; summary?: unknown; location?: unknown; status?: unknown };
type RegistrationCreateBody = { eventId?: unknown; name?: unknown; email?: unknown; phone?: unknown; attendanceIntent?: unknown };

const ALLOWED_EVENT_STATUSES: EventStatus[] = ["draft", "scheduled", "cancelled", "completed"];
const ALLOWED_ATTENDANCE_INTENTS: AttendanceIntent[] = ["attending", "not-attending", "unsure"];

function isPlainObject(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function hasOnlyKeys(value: Record<string, unknown>, allowed: string[]): boolean { return Object.keys(value).every((k) => allowed.includes(k)); }
function isEventStatus(value: unknown): value is EventStatus { return typeof value === "string" && ALLOWED_EVENT_STATUSES.includes(value as EventStatus); }
function isAttendanceIntent(value: unknown): value is AttendanceIntent { return typeof value === "string" && ALLOWED_ATTENDANCE_INTENTS.includes(value as AttendanceIntent); }
function looksLikeIsoDate(value: string): boolean { const asDate = new Date(value); return !Number.isNaN(asDate.getTime()); }
function isValidEmail(value: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function normalizeString(value: unknown): string { return typeof value === "string" ? value.trim() : ""; }

export function internalEventsList() {
  const items = listEventRecords();
  return { ok: true as const, data: { items, total: items.length } };
}

export function internalEventsCreate(input: { body?: EventCreateBody }) {
  const body = input.body;
  if (!isPlainObject(body)) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "body must be a JSON object." } satisfies ValidationError] };
  if (!hasOnlyKeys(body, ["title", "date", "summary", "location", "status"])) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "Unsupported fields in request body." } satisfies ValidationError] };

  const title = normalizeString(body.title);
  const date = normalizeString(body.date);
  const summary = normalizeString(body.summary);
  const location = normalizeString(body.location);
  const statusCandidate = body.status === undefined ? "draft" : body.status;
  const fieldErrors: ValidationError[] = [];

  if (!title) fieldErrors.push({ field: "title", message: "title is required." }); else if (title.length > 140) fieldErrors.push({ field: "title", message: "title must be 140 characters or fewer." });
  if (!date) fieldErrors.push({ field: "date", message: "date is required." }); else if (!looksLikeIsoDate(date)) fieldErrors.push({ field: "date", message: "date must be a valid ISO date string." });
  if (!summary) fieldErrors.push({ field: "summary", message: "summary is required." }); else if (summary.length > 2000) fieldErrors.push({ field: "summary", message: "summary must be 2000 characters or fewer." });
  if (!location) fieldErrors.push({ field: "location", message: "location is required." }); else if (location.length > 160) fieldErrors.push({ field: "location", message: "location must be 160 characters or fewer." });
  if (!isEventStatus(statusCandidate)) fieldErrors.push({ field: "status", message: "status must be one of draft, scheduled, cancelled, completed." });

  if (fieldErrors.length > 0) return { ok: false as const, error: "Validation failed", fieldErrors };
  const status = statusCandidate as EventStatus;
  return { ok: true as const, data: createEventRecord({ title, date, summary, location, status }) };
}

export async function internalRegistrationSubmit(input: { body?: RegistrationCreateBody }) {
  const body = input.body;
  if (!isPlainObject(body)) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "body must be a JSON object." } satisfies ValidationError] };
  if (!hasOnlyKeys(body, ["eventId", "name", "email", "phone", "attendanceIntent"])) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "Unsupported fields in request body." } satisfies ValidationError] };

  const eventId = normalizeString(body.eventId);
  const name = normalizeString(body.name);
  const email = normalizeString(body.email).toLowerCase();
  const phone = body.phone === undefined ? "" : normalizeString(body.phone);
  const attendanceIntent = body.attendanceIntent;
  const fieldErrors: ValidationError[] = [];

  if (!eventId) fieldErrors.push({ field: "eventId", message: "eventId is required." });
  if (!name) fieldErrors.push({ field: "name", message: "name is required." }); else if (name.length > 120) fieldErrors.push({ field: "name", message: "name must be 120 characters or fewer." });
  if (!email) fieldErrors.push({ field: "email", message: "email is required." }); else if (!isValidEmail(email) || email.length > 320) fieldErrors.push({ field: "email", message: "email must be a valid email address." });
  if (phone && phone.length > 32) fieldErrors.push({ field: "phone", message: "phone must be 32 characters or fewer." });
  if (!isAttendanceIntent(attendanceIntent)) fieldErrors.push({ field: "attendanceIntent", message: "attendanceIntent must be one of attending, not-attending, unsure." });

  if (fieldErrors.length > 0) return { ok: false as const, error: "Validation failed", fieldErrors };
  if (!readEventRecord(eventId)) return { ok: false as const, error: "Event not found" };

  const intent = attendanceIntent as AttendanceIntent;
  const registration = createRegistrationRecord({ eventId, name, email, phone: phone || null, attendanceIntent: intent });

  const triggerResult = await internalCampaignEventTriggerProcess({
    body: {
      eventId,
      email,
      triggerType: "registration_submitted",
      source: { channel: "events.registration", registrationId: registration.id, attendanceIntent: intent },
    },
  });

  return {
    ok: true as const,
    data: {
      ...registration,
      campaignTrigger: triggerResult.ok
        ? triggerResult.data
        : { ok: false, error: triggerResult.error, fieldErrors: "fieldErrors" in triggerResult ? triggerResult.fieldErrors : undefined },
    },
  };
}
