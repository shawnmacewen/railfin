import { randomUUID } from "crypto";

export type EventStatus = "draft" | "scheduled" | "cancelled" | "completed";
export type AttendanceIntent = "attending" | "not-attending" | "unsure";

export type InternalEventRecord = { id: string; title: string; date: string; summary: string; location: string; status: EventStatus; createdAt: string };
export type InternalRegistrationRecord = { id: string; eventId: string; name: string; email: string; phone: string | null; attendanceIntent: AttendanceIntent; createdAt: string };

const eventStore = new Map<string, InternalEventRecord>();
const registrationStore = new Map<string, InternalRegistrationRecord[]>();

export function createEventRecord(input: { title: string; date: string; summary: string; location: string; status: EventStatus }): InternalEventRecord {
  const record: InternalEventRecord = { id: randomUUID(), title: input.title, date: input.date, summary: input.summary, location: input.location, status: input.status, createdAt: new Date().toISOString() };
  eventStore.set(record.id, record);
  return record;
}

export function listEventRecords(): InternalEventRecord[] { return Array.from(eventStore.values()).sort((a, b) => a.date.localeCompare(b.date)); }
export function readEventRecord(eventId: string): InternalEventRecord | null { return eventStore.get(eventId) ?? null; }

export function updateEventRecord(input: { eventId: string; title: string; date: string; summary: string; location: string; status: EventStatus }): InternalEventRecord | null {
  const existing = eventStore.get(input.eventId);
  if (!existing) return null;
  const updated: InternalEventRecord = {
    ...existing,
    title: input.title,
    date: input.date,
    summary: input.summary,
    location: input.location,
    status: input.status,
  };
  eventStore.set(input.eventId, updated);
  return updated;
}

export function deleteEventRecord(eventId: string): boolean {
  const deleted = eventStore.delete(eventId);
  if (deleted) registrationStore.delete(eventId);
  return deleted;
}

export function createRegistrationRecord(input: { eventId: string; name: string; email: string; phone: string | null; attendanceIntent: AttendanceIntent }): InternalRegistrationRecord {
  const record: InternalRegistrationRecord = { id: randomUUID(), eventId: input.eventId, name: input.name, email: input.email, phone: input.phone, attendanceIntent: input.attendanceIntent, createdAt: new Date().toISOString() };
  const eventRegistrations = registrationStore.get(input.eventId) ?? [];
  eventRegistrations.push(record);
  registrationStore.set(input.eventId, eventRegistrations);
  return record;
}
