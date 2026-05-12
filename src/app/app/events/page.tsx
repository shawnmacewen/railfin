"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Card } from "../../../ui/primitives";

type EventItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  summary: string;
  status: "draft" | "scheduled" | "cancelled" | "completed";
};

type EventsListResponse =
  | { ok: true; data: { items: EventItem[]; total: number } }
  | { ok: false; error?: string };

function formatEventDate(input: string): string {
  const value = new Date(input);
  if (Number.isNaN(value.getTime())) return input;
  return value.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function daysUntil(input: string): number | null {
  const value = new Date(input);
  if (Number.isNaN(value.getTime())) return null;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTarget = new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  return Math.round((startOfTarget - startOfToday) / (1000 * 60 * 60 * 24));
}

export default function EventsPage() {
  const router = useRouter();
  const [items, setItems] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/internal/events", { method: "GET", credentials: "include" });
      const payload = (await response.json().catch(() => null)) as EventsListResponse | null;

      if (!response.ok || !payload?.ok) {
        setItems([]);
        setError(payload && "error" in payload && payload.error ? payload.error : "Could not load events right now.");
        return;
      }

      setItems(Array.isArray(payload.data?.items) ? payload.data.items : []);
    } catch {
      setItems([]);
      setError("Could not load events right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [items],
  );

  const nextEvent = sortedItems[0] ?? null;

  const kpis = useMemo(() => {
    const upcoming = sortedItems.filter((event) => (daysUntil(event.date) ?? 9999) >= 0).length;
    const draft = sortedItems.filter((event) => event.status === "draft").length;
    const cancelled = sortedItems.filter((event) => event.status === "cancelled").length;
    const thisWeek = sortedItems.filter((event) => {
      const days = daysUntil(event.date);
      return days !== null && days >= 0 && days <= 7;
    }).length;
    return { upcoming, draft, cancelled, thisWeek };
  }, [sortedItems]);

  const attentionItems = useMemo(() => {
    const issues: string[] = [];
    if (!nextEvent) {
      issues.push("No upcoming events scheduled yet — create your next event.");
      return issues;
    }

    const nextDays = daysUntil(nextEvent.date);
    if (nextDays !== null && nextDays <= 7 && nextEvent.status === "draft") {
      issues.push(`\"${nextEvent.title}\" is in ${Math.max(nextDays, 0)} day(s) and still in draft status.`);
    }
    if (nextDays !== null && nextDays <= 3) {
      issues.push(`\"${nextEvent.title}\" is approaching soon (${Math.max(nextDays, 0)} day(s)). Confirm comms are ready.`);
    }
    if (kpis.cancelled > 0) {
      issues.push(`${kpis.cancelled} cancelled event(s) need follow-up communication review.`);
    }
    if (issues.length === 0) {
      issues.push("No urgent blockers. Event pipeline looks healthy.");
    }
    return issues;
  }, [kpis.cancelled, nextEvent]);

  async function onDelete(eventId: string, title: string) {
    const confirmed = window.confirm(`Delete event \"${title}\"? This cannot be undone.`);
    if (!confirmed) return;

    setStatus(null);
    setError(null);

    try {
      const response = await fetch(`/api/internal/events/${encodeURIComponent(eventId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.error || "Could not delete event right now.");
        return;
      }

      setStatus("Event deleted.");
      await loadEvents();
    } catch {
      setError("Could not delete event right now.");
    }
  }

  return (
    <div className="rf-events-page">
      <div className="rf-events-dashboard-grid">
        <div className="rf-events-dashboard-main">
          <Card>
            <h3 className="rf-library-section-title">Attention</h3>
            <ul className="rf-events-attention-list">
              {attentionItems.map((item, index) => (
                <li key={`attention-${index}`}>{item}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="rf-library-section-title">Event Health Snapshot</h3>
            <div className="rf-events-kpi-grid">
              <div className="rf-events-kpi-item"><span>Upcoming</span><strong>{kpis.upcoming}</strong></div>
              <div className="rf-events-kpi-item"><span>This week</span><strong>{kpis.thisWeek}</strong></div>
              <div className="rf-events-kpi-item"><span>Draft</span><strong>{kpis.draft}</strong></div>
              <div className="rf-events-kpi-item"><span>Cancelled</span><strong>{kpis.cancelled}</strong></div>
            </div>
          </Card>
        </div>

        <div className="rf-events-dashboard-side">
          <Card>
            <div className="rf-events-hero">
              <h3 className="rf-library-section-title">Upcoming Events</h3>
              <Link href="/app/events/new" className="rf-events-create-cta">Create Event</Link>
            </div>

            {error ? <p className="rf-status rf-status-error" role="alert">{error}</p> : null}
            {status ? <p className="rf-status rf-status-success" role="status">{status}</p> : null}

            {isLoading ? (
              <p className="rf-status rf-status-muted" role="status" aria-live="polite">Loading events...</p>
            ) : sortedItems.length > 0 ? (
              <ul className="rf-events-list">
                {sortedItems.map((event, index) => (
                  <li key={event.id} className={`rf-events-item ${index === 0 ? "is-next" : ""}`}>
                    <h4>{event.title}</h4>
                    <p className="rf-status rf-status-muted">{formatEventDate(event.date)}</p>
                    <p className="rf-status rf-status-muted">{event.location}</p>
                    <div className="rf-crm-row-actions">
                      <button type="button" onClick={() => router.push(`/app/events/new?eventId=${encodeURIComponent(event.id)}`)}>Edit</button>
                      <button type="button" className="rf-inline-delete" onClick={() => void onDelete(event.id, event.title)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rf-events-empty-state">
                <p className="rf-status rf-status-muted">No events yet. Start by creating your first event.</p>
                <Link href="/app/events/new" className="rf-inline-link">Open event setup</Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
