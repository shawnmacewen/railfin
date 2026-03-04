"use client";

import { useMemo, useState } from "react";

import { Card } from "../../../../ui/primitives";

type EventFormState = {
  title: string;
  date: string;
  summary: string;
  location: string;
};

type CommunicationTouchpoint = {
  offsetDays: string;
  sendTime: string;
  subject: string;
  body: string;
};

const INITIAL_FORM: EventFormState = {
  title: "",
  date: "",
  summary: "",
  location: "",
};

const INITIAL_TOUCHPOINTS: CommunicationTouchpoint[] = [
  {
    offsetDays: "14",
    sendTime: "09:00",
    subject: "Reminder: {{event_title}} is coming up",
    body: "Hi {{first_name}},\n\nYou're invited to {{event_title}} on {{event_date}} at {{event_location}}. Save your seat and invite your team.",
  },
  {
    offsetDays: "7",
    sendTime: "09:00",
    subject: "One week out: {{event_title}} details",
    body: "Hi {{first_name}},\n\nWe're one week away from {{event_title}}. Here is what you'll learn: {{event_summary}}.",
  },
  {
    offsetDays: "1",
    sendTime: "08:30",
    subject: "Tomorrow: final details for {{event_title}}",
    body: "Hi {{first_name}},\n\n{{event_title}} starts tomorrow. Location: {{event_location}}. We'll see you there.",
  },
];

export default function NewEventPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<EventFormState>(INITIAL_FORM);
  const [touchpointCount, setTouchpointCount] = useState<1 | 2 | 3>(1);
  const [touchpoints, setTouchpoints] = useState<CommunicationTouchpoint[]>(INITIAL_TOUCHPOINTS);
  const [status, setStatus] = useState<string | null>(null);

  const isStep1Complete = useMemo(() => Boolean(form.title.trim() && form.date), [form.date, form.title]);

  const visibleTouchpoints = useMemo(
    () => touchpoints.slice(0, touchpointCount),
    [touchpointCount, touchpoints],
  );

  return (
    <Card>
      <h2 className="rf-library-section-title">Create Event · Step {step}</h2>
      <p className="rf-status rf-status-muted">
        {step === 1
          ? "Capture event basics, then continue to communication planning."
          : "Plan 1-3 pre-event email touchpoints with editable schedule metadata and placeholders."}
      </p>

      <p className="rf-status rf-status-muted" aria-live="polite">
        Wizard progress: Step {step} of 2
      </p>

      {step === 1 ? (
        <form
          className="rf-events-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!isStep1Complete) {
              setStatus("Please complete Event title and Event date before continuing.");
              return;
            }
            setStep(2);
            setStatus("Step 1 saved locally. Continue by configuring pre-event communications.");
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

          <button type="submit" disabled={!isStep1Complete}>
            Continue to Step 2
          </button>
        </form>
      ) : (
        <form
          className="rf-events-form"
          onSubmit={(event) => {
            event.preventDefault();
            setStatus(`Step 2 saved locally with ${touchpointCount} planned touchpoint${touchpointCount > 1 ? "s" : ""}.`);
          }}
        >
          <label htmlFor="touchpoint-count">Number of pre-event touchpoints</label>
          <select
            id="touchpoint-count"
            name="touchpointCount"
            value={String(touchpointCount)}
            onChange={(event) => setTouchpointCount(Number(event.target.value) as 1 | 2 | 3)}
          >
            <option value="1">1 touchpoint</option>
            <option value="2">2 touchpoints</option>
            <option value="3">3 touchpoints</option>
          </select>

          {visibleTouchpoints.map((touchpoint, index) => (
            <fieldset key={`touchpoint-${index}`}>
              <legend>Touchpoint {index + 1}</legend>

              <label htmlFor={`touchpoint-${index}-offset`}>Send before event (days)</label>
              <input
                id={`touchpoint-${index}-offset`}
                type="number"
                min={1}
                max={90}
                value={touchpoint.offsetDays}
                onChange={(event) =>
                  setTouchpoints((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, offsetDays: event.target.value } : item,
                    ),
                  )
                }
              />

              <label htmlFor={`touchpoint-${index}-time`}>Scheduled send time (local)</label>
              <input
                id={`touchpoint-${index}-time`}
                type="time"
                value={touchpoint.sendTime}
                onChange={(event) =>
                  setTouchpoints((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, sendTime: event.target.value } : item,
                    ),
                  )
                }
              />

              <label htmlFor={`touchpoint-${index}-subject`}>Email subject placeholder</label>
              <input
                id={`touchpoint-${index}-subject`}
                value={touchpoint.subject}
                onChange={(event) =>
                  setTouchpoints((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, subject: event.target.value } : item,
                    ),
                  )
                }
              />

              <label htmlFor={`touchpoint-${index}-body`}>Email body placeholder</label>
              <textarea
                id={`touchpoint-${index}-body`}
                rows={4}
                value={touchpoint.body}
                onChange={(event) =>
                  setTouchpoints((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, body: event.target.value } : item,
                    ),
                  )
                }
              />
            </fieldset>
          ))}

          <div>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setStatus("Returned to Step 1. Event basics are still available.");
              }}
            >
              Back to Step 1
            </button>{" "}
            <button type="submit">Save communication plan</button>
          </div>
        </form>
      )}

      {status ? (
        <p className="rf-status rf-status-success" role="status">
          {status}
        </p>
      ) : null}
    </Card>
  );
}
