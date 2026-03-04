import Link from "next/link";

import { Card } from "../../../ui/primitives";

const upcomingEvents: Array<{ id: string; title: string; date: string; location: string }> = [];

export default function EventsPage() {
  const hasEvents = upcomingEvents.length > 0;

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
        {hasEvents ? (
          <ul className="rf-events-list">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="rf-events-item">
                <h4>{event.title}</h4>
                <p className="rf-status rf-status-muted">{event.date}</p>
                <p className="rf-status rf-status-muted">{event.location}</p>
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
