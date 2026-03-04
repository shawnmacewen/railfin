"use client";

import { useMemo, useState } from "react";

import { Card } from "../../../../ui/primitives";

type EventFormState = {
  title: string;
  date: string;
  summary: string;
  location: string;
};

const INITIAL_FORM: EventFormState = {
  title: "",
  date: "",
  summary: "",
  location: "",
};

export default function NewEventPage() {
  const [form, setForm] = useState<EventFormState>(INITIAL_FORM);
  const [status, setStatus] = useState<string | null>(null);

  const isSubmitDisabled = useMemo(() => !form.title.trim() || !form.date, [form.date, form.title]);

  return (
    <Card>
      <h2 className="rf-library-section-title">Create Event · Step 1</h2>
      <p className="rf-status rf-status-muted">Capture event basics. Registration and messaging come next.</p>

      <form
        className="rf-events-form"
        onSubmit={(event) => {
          event.preventDefault();
          setStatus("Step 1 saved locally. Next step plumbing is not connected yet.");
        }}
      >
        <label htmlFor="event-title">Event title</label>
        <input
          id="event-title"
          name="title"
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          placeholder="Railfin Spring Launch Meetup"
          required
        />

        <label htmlFor="event-date">Event date</label>
        <input
          id="event-date"
          name="date"
          type="date"
          value={form.date}
          onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
          required
        />

        <label htmlFor="event-summary">Summary</label>
        <textarea
          id="event-summary"
          name="summary"
          value={form.summary}
          onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
          placeholder="What this event is about"
        />

        <label htmlFor="event-location">Location</label>
        <input
          id="event-location"
          name="location"
          value={form.location}
          onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
          placeholder="Downtown HQ · Austin, TX"
        />

        <button type="submit" disabled={isSubmitDisabled}>
          Continue to Step 2
        </button>
      </form>

      {status ? (
        <p className="rf-status rf-status-success" role="status">
          {status}
        </p>
      ) : null}
    </Card>
  );
}
