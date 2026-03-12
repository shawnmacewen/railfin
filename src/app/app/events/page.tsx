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

  const hasEvents = useMemo(() => items.length > 0, [items.length]);

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
      <Card>
        <div className="rf-events-hero">
          <div>
            <h2 className="rf-sr-only">Events</h2>
            <p className="rf-status rf-status-muted">
              Plan, draft, and coordinate your event workflow in one place.
            </p>
          </div>
          <Link href="/app/events/new" className="rf-events-create-cta">
            Create Event
          </Link>
        </div>
      </Card>

      <Card>
        <h3 className="rf-library-section-title">Upcoming Events</h3>

        {error ? (
          <p className="rf-status rf-status-error" role="alert">
            {error}
          </p>
        ) : null}

        {status ? (
          <p className="rf-status rf-status-success" role="status">
            {status}
          </p>
        ) : null}

        {isLoading ? (
          <p className="rf-status rf-status-muted" role="status" aria-live="polite">
            Loading events...
          </p>
        ) : hasEvents ? (
          <ul className="rf-events-list">
            {items.map((event) => (
              <li key={event.id} className="rf-events-item">
                <h4>{event.title}</h4>
                <p className="rf-status rf-status-muted">{formatEventDate(event.date)}</p>
                <p className="rf-status rf-status-muted">{event.location}</p>
                <div className="rf-crm-row-actions">
                  <button
                    type="button"
                    onClick={() => router.push(`/app/events/new?eventId=${encodeURIComponent(event.id)}`)}
                  >
                    Edit
                  </button>
                  <button type="button" className="rf-inline-delete" onClick={() => void onDelete(event.id, event.title)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rf-events-empty-state">
            <p className="rf-status rf-status-muted">No events yet. Start by creating your first event.</p>
            <Link href="/app/events/new" className="rf-inline-link">
              Open event setup
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
