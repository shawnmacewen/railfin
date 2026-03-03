# PRD — Events Module (v0)

## Goal
Enable teams to create and run events end-to-end from Railfin, including promotion content, registration capture, day-of attendance check-in, and post-event follow-up communication.

## Scope (v0)
1. Create Event
- Event title, description, date/time, location, organizer, capacity
- Event status: Draft, Published, Completed

2. Event Promotion Content
- Generate event announcement email draft
- Generate event social post drafts (LinkedIn / X-thread / other channels)
- Keep generated variants editable before publishing

3. Registration Form
- Public form to register for an event
- Basic attendee fields (name, email, optional company/role)
- Registration status tracking (registered, checked-in, no-show)

4. Day-of Check-In via QR
- Generate unique attendee QR code at registration
- Check-in flow validates QR and marks attendee as present
- Prevent duplicate check-ins for same attendee

5. Post-Event Communication Logic
- Send follow-up communications after event completion
- Branch content by attendance outcome:
  - Attended flow
  - Did-not-attend flow

> Note: Email delivery plumbing is deferred. v0 should support templates/content generation and queued communication records, with sending wired later.

## Out of Scope (v0)
- Payment/ticketing
- Advanced CRM sync
- Complex role-based event permissions
- Multi-event series automation

## User Stories
- As a marketer, I can create and publish an event with core details.
- As a marketer, I can generate and edit event promotion content quickly.
- As an attendee, I can register via an event form.
- As an event operator, I can check attendees in by scanning QR codes.
- As a marketer, I can send different post-event follow-ups to attendees vs non-attendees.

## Functional Requirements
- Event CRUD with validation for required fields
- Registration endpoint + data store
- QR generation + check-in endpoint
- Attendance state transitions with audit timestamps
- Post-event communication workflow states and templates

## UX Requirements
- Events area in app navigation
- Clear event lifecycle states visible to operators
- Check-in screen optimized for speed and scan reliability
- Human-readable status indicators for registrations and attendance

## Data Model (initial)
- events
- event_registrations
- event_checkins
- event_communications
- event_content_variants

## Success Metrics (v0)
- Time to create event + first promo drafts
- Registration completion rate
- Check-in throughput on event day
- Post-event follow-up completion by attendance segment

## Risks / Open Questions
- QR anti-fraud strategy (short-lived tokens vs signed payload)
- Throughput and connectivity constraints at venue check-in
- Consent/compliance handling for communications by region

## Delivery Notes
- Build in iterative slices:
  1) Event entity + UI shell
  2) Registration form + storage
  3) QR + check-in flow
  4) Post-event communication branching
  5) Email send integration (deferred plumbing)
