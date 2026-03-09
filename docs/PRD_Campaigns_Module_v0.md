# PRD — Campaigns Module v0 (phase-1 foundation)

- Status: Draft (authoritative for task-00207 phase-1)
- Milestone alignment: v0.3 Campaigns foundation after v0.2 Events
- Owner lanes: DEV + UI + COO + SEC

## 1) Product goal

Railfin Campaigns coordinates outreach across:
1. email drip campaigns
2. social post scheduling on a shared calendar
3. future event-linked drip sequences

The module must support branching campaign logic and contact segmentation while keeping execution safe, auditable, and fail-closed.

## 2) Scope by release

### MVP (phase-1 + phase-2)
- Campaign definitions with one or more sequences
- Sequence steps: `email`, `wait`, `condition`
- Condition support for `if/or` branching rules
- Contacts-first targeting (contacts + lead metadata)
- Segment references for targeting criteria
- Social post scheduling records tied to campaign calendar
- Internal API contracts for campaign create/list + targeting preview
- Manual SQL bootstrap for schema readiness

### v2 roadmap
- Event-trigger campaign enrollment paths (event registration/attendance outcomes)
- Calendar drag-and-drop scheduling UX
- Segment rule execution engine (dynamic eval, not reference-only)
- Enrollment state machine worker (step transitions + wait scheduling)
- Delivery integrations (ESP/social APIs) + retries + suppression controls
- Full contact merge/dedupe and attribution history

## 3) Contacts-first targeting (required posture)

CRM evolves from lead-only records toward **contacts as the canonical person entity**.

- `contacts` becomes system-of-record for targeting.
- Lead state is retained as metadata (`lead_stage`, optional scoring/owner/tags), not a separate silo.
- Existing lead records remain bridge-compatible by mapping to contact shape.
- Campaign targeting accepts:
  - explicit `contactIds`
  - `leadStages` filter (for lead-state segmentation)
  - `segmentIds` (rule-set references)

Design rule: Campaigns targets people (`contacts`), never raw lead-only tables directly.

## 4) Functional requirements

## 4.1 Campaign composition
- A campaign includes one or more named sequences.
- A sequence includes ordered steps.
- Step types:
  - `email`: requires subject + body
  - `wait`: requires positive wait minutes
  - `condition`: requires operator (`if|or`), at least one rule, and yes/no sequence targets

## 4.2 Branching logic rules
- `condition.operator = if`: all rules in rule set must pass (AND semantics).
- `condition.operator = or`: any rule in rule set may pass (OR semantics).
- `condition` step must define both `yesSequenceId` and `noSequenceId`.
- Condition evaluation is deterministic at the enrollment step boundary.
- If condition dependencies are missing/invalid, execution fails closed for that enrollment and records diagnostic state.

## 4.3 Targeting + segmentation
- MVP targeting preview resolves counts from contacts read model.
- `segmentIds` are accepted as references in MVP; full dynamic segment rule execution is v2.
- Segment filters must be additive (intersection) with explicit `contactIds` and `leadStages` when provided.

## 4.4 Social scheduling + calendar
- Social post entities attach to campaigns and can be scheduled.
- Calendar items provide a unified timeline across email sends, social posts, and event-trigger placeholders.

## 4.5 Event-trigger roadmap (v2)
- Event signals (registration, attendance, no-show) can enroll contacts into campaign entry sequences.
- Trigger mapping example:
  - registration complete -> start pre-event nurture sequence
  - attended -> follow-up upsell sequence
  - no-show -> reactivation sequence

## 5) Data model proposal

- `campaigns`
  - id, name, objective, status, targeting_json, created_at, updated_at
- `campaign_sequences`
  - id, campaign_id, name, sequence_order, created_at
- `campaign_steps`
  - id, sequence_id, step_order, step_type (`email|wait|condition`), step payload columns, created_at
- `campaign_enrollments`
  - id, campaign_id, contact_id, enrollment_status, active_sequence_id, active_step_id, enrolled_at, last_transition_at
- `campaign_social_posts`
  - id, campaign_id, platform, status, content, scheduled_for, created_at
- `campaign_calendar_items`
  - id, campaign_id, item_type, starts_at, ends_at, title, metadata_json, created_at
- `contacts`
  - id, full_name, primary_email, primary_phone, source, lead_stage, lead_score, owner_user_id, tags, metadata_json, created_at, updated_at
- `segments`
  - id, name, description, rule_json, is_dynamic, created_at, updated_at

Phase-1 SQL bootstrap file: `docs/campaigns_bootstrap.sql`

## 6) API boundary proposal (internal protected)

- `GET /api/internal/campaigns`
  - returns campaign list (phase-1 in-memory contracts)
- `POST /api/internal/campaigns`
  - creates campaign definition with strict validation
  - fail-closed on unsupported fields or malformed step structures
- `POST /api/internal/campaigns/targeting/preview`
  - validates targeting inputs and returns matched/total contact counts
  - phase-1 note: segment rules accepted as references; dynamic execution deferred
- `GET /api/internal/crm/contacts`
  - returns contacts-first read model (lead-enriched bridge from existing CRM persistence)

All internal routes require auth guard and return `Cache-Control: no-store`.

## 7) Non-goals (phase-1)

- No outbound email/social sends
- No background scheduler worker
- No event-trigger execution runtime yet
- No full campaign builder UI yet

## 8) Delivery plan

### Phase-1 (this task)
- PRD + architecture/API docs
- SQL bootstrap document
- Internal API stubs/contracts
- Campaigns page foundation visibility

### Phase-2
- Campaign builder UI (sequence + step editor)
- Contacts/segments selector UI with targeting preview
- Persist campaigns to DB tables from bootstrap

### Phase-3
- Enrollment executor + wait handling
- Event-trigger enrollment hooks
- Delivery-provider integration hardening
