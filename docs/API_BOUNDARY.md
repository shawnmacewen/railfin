## task-00218 — Event-triggered campaign enrollment hooks

Protected internal Campaign trigger route:
- `POST /api/internal/campaigns/triggers/events`

### Event trigger payload contract

Request body (strict allowlist):
- `eventId: string` (required)
- `contactId?: string`
- `email?: string` (required when `contactId` is omitted)
- `triggerType: "registration_submitted" | "registration_intent"` (required)
- `source?: Record<string, string | number | boolean | null>` (optional scalar-only metadata)

Validation posture:
- fail-closed strict object + key allowlist
- `eventId` required
- either `contactId` or valid `email` required
- invalid triggerType rejected
- deterministic safe `fieldErrors` payloads; no raw payload echo

### Trigger processing behavior

- Contacts are resolved deterministically by `contactId` first, then by lowercase email match.
- Eligible campaigns are active campaigns that match contact targeting constraints.
- Enrollment trigger creates campaign enrollments through the existing enrollment service path.

### Duplicate guard

Deterministic duplicate prevention key:
- `campaignId + contactId + eventId + triggerType`

Guard is enforced by checking existing `campaign_enrollment_events` entries with `event_type = "enrollment_trigger_received"` and matching trigger context in `details_json` before attempting enrollment creation.

### Auditability

On accepted trigger enrollments, trigger context is persisted in enrollment event `details_json`, including:
- `eventId`
- `contactId`
- `contactEmail`
- `triggerType`
- `source` metadata

### Events registration integration

`POST /api/internal/events/registrations` now invokes the trigger processor after successful registration creation and returns additive trigger processing metadata under `data.campaignTrigger`.

## task-00215 — Campaigns execution engine skeleton (enrollments + step progression)

Protected internal Campaign execution routes now include:
- `GET/POST /api/internal/campaigns/[campaignId]/enrollments`
- `POST /api/internal/campaigns/enrollments/[enrollmentId]/transition`

### Enrollment contracts (v1 skeleton)

`POST /api/internal/campaigns/[campaignId]/enrollments`
- Request body (strict allowlist):
  - `contactId: string` (required)
  - `startNow?: boolean` (default `true`)
- Success:
  - `{ ok: true, data: Enrollment }`

`GET /api/internal/campaigns/[campaignId]/enrollments`
- Success:
  - `{ ok: true, data: { items: Enrollment[], total: number } }`

`POST /api/internal/campaigns/enrollments/[enrollmentId]/transition`
- Request body (strict allowlist):
  - `actorType: "manual" | "engine" | "system"` (required)
  - `contactContext?: Record<string, unknown>` (for deterministic condition evaluation)
  - `forceStatus?: "pending" | "active" | "paused" | "completed" | "exited"`
- Success:
  - `{ ok: true, data: { enrollment: Enrollment, events: EnrollmentEvent[] } }`

### Step progression behavior (deterministic skeleton)

- `email` step:
  - does not send through external provider yet.
  - writes an `email_send_intent` transition detail event.
- `wait` step:
  - computes and persists `nextEligibleAt` from `waitMinutes`.
- `condition` step:
  - evaluates `condition_rules_json` deterministically with `if|or` operator against provided `contactContext`.
  - selects yes/no branch sequence scaffold and records branch decision details.

### Enrollment state + observability

- Enrollment state transitions maintain consistency for:
  - `enrollment_status`
  - `active_sequence_id`
  - `active_step_id`
  - `next_eligible_at`
- Transition events are persisted in `campaign_enrollment_events` with:
  - `event_type`, `actor_type`, `details_json`, `created_at`

### Manual SQL delta (required)

For environments that already applied earlier campaign bootstrap SQL, run additive SQL:
- add `next_eligible_at` to `campaign_enrollments`
- add `campaign_enrollment_events` table + indexes

(See `docs/campaigns_bootstrap.sql` for canonical idempotent DDL.)

## task-00211 — Contacts generalization pass (CRM leads -> contacts bridge hardening)

Protected internal CRM routes now include:
- `GET/POST /api/internal/crm/contacts`
- `PATCH /api/internal/crm/contacts/[contactId]`
- `GET/POST /api/internal/crm/leads` (compatibility bridge over contacts-first model when available)

### Contacts-first normalization mapping

Lead fields are normalized to contacts schema as:
- `name -> fullName`
- `email -> primaryEmail`
- `phone -> primaryPhone`
- `status -> lead.stage` (same enum: `new|contacted|qualified|closed`)
- `source -> source`

Compatibility behavior:
- contacts list/read paths resolve from `public.contacts` first.
- if `public.contacts` is not yet present, read falls back to `public.leads` mapping.
- lead create writes to `public.contacts` first; if contacts persistence is unavailable, write falls back to `public.leads`.

### Contacts list filters and validation posture

`GET /api/internal/crm/contacts`
- Optional query params:
  - `search`: case-insensitive match over name/email/phone/source/stage
  - `stage`: exact stage filter
  - `source`: exact source filter

`POST /api/internal/crm/contacts` and `PATCH /api/internal/crm/contacts/[contactId]`
- Request body (strict allowlist):
  - `fullName` (required)
  - `primaryEmail` (required)
  - `primaryPhone` (optional)
  - `source` (optional)
  - `stage` (required enum `new|contacted|qualified|closed`)
- Fail-closed validation:
  - strict JSON object body + strict key allowlist
  - bounded lengths + email format checks
  - safe `fieldErrors` only (no raw payload reflection)

### Manual migration/backfill path (idempotent)

If historical lead rows exist and contacts table is newly introduced, run manual SQL:
- `docs/crm_contacts_backfill_from_leads.sql`

The file includes:
- idempotent contacts table/bootstrap DDL
- idempotent upsert backfill from `public.leads` to `public.contacts`
- verification queries (`count` checks + missing-id join check)

## task-00209 — Campaigns API engine v1 (internal)

Protected internal routes (all auth-gated via `requireInternalApiAuth`) now include:
- `GET/POST /api/internal/campaigns`
- `GET /api/internal/campaigns/[campaignId]`
- `GET/POST /api/internal/campaigns/[campaignId]/sequences`
- `PATCH /api/internal/campaigns/[campaignId]/sequences/[sequenceId]`
- `GET/POST /api/internal/campaigns/sequences/[sequenceId]/steps`
- `PATCH /api/internal/campaigns/sequences/[sequenceId]/steps/[stepId]`
- `GET/POST /api/internal/campaigns/[campaignId]/social-posts`
- `PATCH /api/internal/campaigns/[campaignId]/social-posts/[postId]`
- `GET /api/internal/campaigns/[campaignId]/calendar`
- `POST /api/internal/campaigns/targeting/preview`

### Persistence posture

Campaign engine endpoints now persist against Supabase phase-1 bootstrap tables through:
- `src/lib/supabase/campaigns.ts`

No in-memory writes are used for campaigns create/sequence/step/social operations.

### Targeting preview contract (deterministic)

`POST /api/internal/campaigns/targeting/preview` success payload includes:
- `counts: { matchedContacts, totalContacts }`
- `sampleContactIds: string[]` (deterministic stable ordering, up to 10 IDs)
- `segmentIds`, `applied`, and compatibility note field

Validation posture remains fail-closed with strict key allowlists and safe `fieldErrors` for unsupported or malformed payloads.

### Condition step contract (if/or branching)

Condition step shape used across create/update flows:
- `{ type:"condition", operator:"if"|"or", rules:[{field, comparator, value}], yesSequenceId:string, noSequenceId:string }`

Validation requirements:
- operator required and bounded to `if|or`
- at least one rule; each rule strictly requires `field`, `comparator`, `value`
- both `yesSequenceId` and `noSequenceId` required

## task-00207 — Campaigns module phase-1 foundation (internal)

Protected internal routes added for campaign foundation and contacts-first targeting:
- `GET/POST /api/internal/campaigns`
- `POST /api/internal/campaigns/targeting/preview`
- `GET /api/internal/crm/contacts`

### Campaign create/list contract

`GET /api/internal/campaigns`
- Success: `{ ok: true, data: { items: Campaign[], total: number } }`

`POST /api/internal/campaigns`
- Request body (strict allowlist):
  - `name: string` (required)
  - `objective?: string`
  - `status?: "draft" | "active" | "paused" | "archived"` (default `draft`)
  - `targeting: { segmentIds?: string[], contactIds?: string[], leadStages?: ("new"|"contacted"|"qualified"|"closed")[] }`
  - `sequences: Array<{ name: string, steps: CampaignStep[] }>` (at least one sequence)

`CampaignStep` variants:
- `email`: `{ type: "email", subject: string, body: string }`
- `wait`: `{ type: "wait", waitMinutes: integer (1..10080) }`
- `condition`: `{ type: "condition", operator: "if"|"or", rules: [{ field, comparator, value }...], yesSequenceId: string, noSequenceId: string }`

Validation posture:
- fail-closed strict object/field allowlists
- bounded string lengths and required fields per step variant
- no fake success on invalid payloads (`400` + `{ ok:false, error:"Validation failed", fieldErrors[] }`)

Current persistence mode:
- Phase-1 uses in-memory campaign contract store (compile-safe foundation).
- DB schema bootstrap is documented and manually applied for persistence readiness.

### Campaign targeting preview contract

`POST /api/internal/campaigns/targeting/preview`
- Request body (strict allowlist):
  - `contactIds?: string[]`
  - `segmentIds?: string[]`
  - `leadStages?: ("new"|"contacted"|"qualified"|"closed")[]`
- Success:
  - `{ ok: true, data: { segmentIds, applied: { contactIds, leadStages }, counts: { matchedContacts, totalContacts }, note } }`
- Phase-1 behavior:
  - resolves against contacts-first read model
  - accepts `segmentIds` as references; dynamic segment-rule execution deferred to v2

### Contacts-first CRM bridge contract

`GET /api/internal/crm/contacts`
- Returns contacts-first shape mapped from current CRM lead persistence:
  - `{ id, fullName, primaryEmail, primaryPhone, source, lead: { stage, isConverted }, createdAt }`
- Success:
  - `{ ok: true, data: { items: Contact[], total: number } }`
- BLOCKED/runtime errors:
  - returns explicit blocked payload from persistence layer with safe diagnostics

### Campaigns SQL bootstrap (manual apply)

No migration runner is configured in repository scripts for campaigns foundation tables.
Apply manually in Supabase SQL editor/psql:

- `docs/campaigns_bootstrap.sql`

## task-00187 — CRM leads phase 1 contracts (internal)

- Added protected internal CRM leads routes: `GET/POST /api/internal/crm/leads`.
- Lead create contract fields: `name`, `email`, optional `phone`, optional `source`, required `status`.
- Allowed status values (fail-closed): `new`, `contacted`, `qualified`, `closed`.
- Validation posture: strict JSON object + allowlisted keys, required/bounded fields, email format checks, safe validation payloads (`Validation failed` + `fieldErrors`).
- Persistence path: Supabase table `public.leads` via `src/lib/supabase/leads.ts` with explicit BLOCKED diagnostics when env/table access is unavailable.
- No outbound automations/messaging in this phase.

### CRM leads SQL bootstrap (manual apply)

No migration runner is configured in repository scripts for this table; apply manually in Supabase SQL editor/psql:

```sql
create table if not exists public.leads (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  source text,
  status text not null check (status in ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_email_idx on public.leads(lower(email));
```

## task-00158 — Create mode alignment (Topics + AI prompt) on shared generate pipeline

- No generate endpoint schema change required. `POST /api/internal/content/generate` request/response contracts remain unchanged.
- UI contract clarification (`src/ui/editor-shell.tsx`):
  - Both Topics mode and AI prompt mode now trigger the same generate pipeline (`runGenerate(...)`).
  - Topics mode composes a deterministic prompt scaffold client-side when freeform prompt text is not used.
  - Existing request context fields (`contentType`, `topics`, `purposes`) continue to be passed to backend prompt scaffolding unchanged.

## task-00157 — Generate contract extension (topics/purposes context injection)

Default generate prompt/context location (current source of truth):
- `src/api/internal/content/generate.ts`
  - `buildGenerationPrompt(...)` — canonical prompt scaffold used by generation runtime.
  - `generateDraftForContentType(...)` — passes request context into `buildGenerationPrompt` before provider execution.

Contract additions for `POST /api/internal/content/generate`:
- Optional `topics: Array<"tax-season-2026" | "ai-and-jobs" | "financial-wellness">`
- Optional `purposes: Array<"lead-outreach" | "social-growth" | "follower-growth">`
- Validation behavior:
  - values must be arrays of supported enums when provided
  - duplicate values are de-duplicated
  - omitted fields resolve to empty arrays
- Prompt scaffold injection behavior:
  - `buildGenerationPrompt` now appends `Selected topics: ...` and `Selected purposes: ...`
  - when empty/omitted, scaffold uses `none selected` (backward-compatible default)

## task-00150 update — Lexical data-contract hardening (serialization/load/compliance boundaries)

- Added a dedicated Lexical data-contract normalization layer in `src/ui/lexical-contract.ts` to enforce safe editor boundary handling for draft HTML.
- **Serialization boundary hardening:** editor change output is now sanitized/normalized before state persistence (disallowed tags removed, unsafe attributes stripped, anchor href protocol allowlist applied, oversized payloads bounded).
- **Deserialization/load boundary hardening:** draft open path now normalizes legacy/malformed body content into safe canonical HTML for Lexical hydration. Plain-text legacy bodies are converted to paragraph HTML deterministically.
- **Compliance extraction hardening:** compliance input now derives from deterministic HTML-to-text normalization with explicit max-length cap (bounded operator payload) to avoid unstable or unbounded extraction.
- API envelope shapes remain unchanged for `/api/internal/content/draft` and `/api/internal/compliance/check`; changes are internal normalization safeguards only.

## task-00148 update — Create editor serialization contract (Lexical phase 1)

- Create editor persistence remains on `POST /api/internal/content/draft` with unchanged envelope shape, but `body` now stores Lexical-authored **HTML** (serialized rich text) rather than plain textarea text for new/updated drafts.
- Compliance contract remains unchanged: `POST /api/internal/compliance/check` continues to receive a plain `content` string; UI now derives this from Lexical text content extraction before request submission.
- Generate contract remains unchanged: UI receives generated plain text and maps it into Lexical HTML for editor hydration.
- Backward compatibility: existing plain-text draft bodies still load (treated as text content by the Lexical loader path).

# API Boundary

## Internal Protected Operations

Protected internal operations must resolve auth/session context before executing business logic.

Use `getCurrentAuthContext()` from `src/lib/supabase/server.ts` as the server-side prerequisite check:

- If `isAuthenticated` is `false`, return `401 Unauthorized`.
- If `isAuthenticated` is `true`, proceed with internal operation using `user`/`session` as needed.

This keeps auth/session handling centralized and enables a later swap from MVP placeholder wiring to full Supabase server auth without refactoring endpoint call sites.

## Auth Action Contract (MVP)

`POST /auth/login` is currently a contract endpoint for UI integration only:

- Request JSON: `{ email: string, password: string, next?: string }`
- Success response: `200` with `{ ok: true, message?: string, redirectTo: string }`
- Error response: `400` with `{ ok: false, error: string }`

Notes:
- `next` is optional and sanitized to internal redirects only (`/` fallback).
- No real Supabase credential verification or session issuance happens at this stage.

## Compliance Check Contract (AI-backed, openai-primary)

`POST /api/internal/compliance/check` is an AI-backed endpoint with OpenAI API as the authoritative runtime path.

Request JSON:

- Required: `content: string` (source text to evaluate)
- Optional: `contentType: "blog" | "linkedin" | "newsletter" | "x-thread"`
- Optional: `policySet: string`

Response JSON:

- Success response: `200` with `{ ok: true, findings: ComplianceFinding[] }`
- Validation error response: `400` with `{ ok: false, error: string }` (for missing content)
- Provider failures/timeouts: endpoint returns a safe fallback success payload with normalized findings (contract preserved)

`ComplianceFinding` response object fields:

- `severity: string`
- `issue: string`
- `details: string`
- `suggestion: string`
- `location: string` (legacy compatibility field; may be empty when unknown)
- `locationLabel: string | null` (stable UI display field; `null` when unavailable)

### Evaluation context path

- Before provider execution, compliance check resolves the latest saved Configure policy text from `GET` parity source (`public.configure_policy` via internal configure policy module).
- The resolved policy text is included in the provider prompt under `Latest configure policy guidance`.
- If policy retrieval is unavailable/blocked, compliance check degrades safely by using empty guidance text and preserves the response contract.

### Provider behavior

- Authoritative provider path: `openai-api` (always selected in runtime)
- Fallback provider wiring (`codex`) remains documented but execution is explicitly deferred/non-blocking for this phase
- If OpenAI runtime fails or times out, endpoint returns safe fallback findings to keep UI response handling stable
- Runtime diagnostics are returned in `meta.providerChain` (provider names + classified attempt outcomes only; no prompt/body/secret data), including `fallbackDeferred: true`
- Evidence capture rule: when verifying runtime health, record only `providerChain.primary`, `fallbackDeferred`, and first-attempt `{ ok, errorKind }` plus degraded flag; do not record prompts, generated body text, or secrets.

## Remediation apply contract (phase 1 safe-scoped)

`POST /api/internal/compliance/remediation/apply` applies remediation context for exactly one selected finding to the current in-memory Create draft context.

Request JSON:

- Required: `currentContent: string`
- Required: `findingId: string`
- Required: `finding: { issue?: string, severity?: string, location?: string, remediationHint?: string }`
- Required: `draftContextId: string`
- Required: `activeDraftContextId: string`

Safety/validation behavior (fail-closed):

- Rejects missing/blank required fields with `400` + `{ ok:false, error:"Validation failed", fieldErrors[] }`.
- Rejects context mismatch when `draftContextId !== activeDraftContextId` (current-context-only enforcement).
- Enforces bounded input/content size and bounded edit outcome limits (max changed chars/lines). Overflow fails closed with validation error.
- Performs deterministic controlled remediation block replacement only using explicit remediation context markers; no hidden transforms or cross-draft mutation/persistence side effects.

Response JSON:

- Success: `{ ok: true, data: { nextContent, previousBlock, appliedBlock, summary, undoToken, audit } }`
  - `summary`: bounded diff summary with `changedChars`, `changedLines`, `findingId`, `draftContextId`
  - `undoToken`: one-step undo token for the most recent apply in the current session scope
  - `audit`: deterministic apply audit metadata (id, UTC timestamp, actor, context id, finding id, before/after snippet hash, outcome, undo linkage id)
- Error: `400` with fail-closed validation payload as above

`POST /api/internal/compliance/remediation/undo` reverts the last successful apply for the current session scope only.

Undo request JSON:

- Required: `undoToken: string`
- Required: `currentContent: string`

Undo response JSON:

- Success: `{ ok: true, data: { nextContent, summary } }`
- Error: `400` on invalid/expired token or validation failure

Caching/auth:

- Requires internal auth guard (same as other `/api/internal/*` routes).
- Returns sensitive responses with `Cache-Control: no-store`.

## AI Service Contract Decision (task-00087)

Railfin uses a **single shared AI credential path** for AI-backed internal services, while maintaining **two distinct service contracts**:

1. **Generate service contract** (content generation)
2. **Compliance service contract** (policy/compliance checks)

This is an architecture boundary rule to prevent drift and accidental contract coupling.

### Shared key/env path (both services)

- Shared provider-selection env: `AI_PROVIDER` (currently ignored for production runtime; openai-api is pinned as primary)
- Shared primary key path: `OPENAI_API_KEY`
- Shared fallback key path: `CODEX_API_KEY` (fallback execution deferred in this phase)

Operational rule:

- Both Generate and Compliance services resolve credentials from the same env path family above.
- No service-specific secret naming forks should be introduced unless an explicit ADR supersedes this decision.

### Dual-service contract separation (must remain independent)

Even with shared key/config, each service keeps its own:

- Prompt template and system instructions
- Request schema and validation rules
- Response schema and normalization logic
- Safety policy and failure-mode handling

Generate and Compliance must not reuse one another’s response type as a shortcut.

### Provider behavior (applies to both services)

- Runtime primary is pinned to OpenAI API for production (`openai-api` authoritative path).
- Attempt OpenAI provider first.
- Secondary provider wiring remains in codebase but fallback execution is deferred for this phase.
- On OpenAI runtime error/timeout/invalid response, return each service’s safe degraded contract output (service-specific; contract-preserving).

### Generate contract (`POST /api/internal/content/generate`)

Request JSON:

- Required: `prompt: string`
- Optional: `mode: "single" | "package"` (defaults to `single`)
- In `single` mode (default):
  - Required: `contentType: "blog" | "linkedin" | "newsletter" | "x-thread"`
  - `package` payload is rejected
- In `package` mode:
  - `contentType` must be omitted
  - Required: `package: { assets: Array<{ assetType: "email" | "linkedin" | "x-thread", prompt?: string }> }`
  - `assets` constraints: 1..3 items, unique `assetType`, strict key validation (`assetType`, optional `prompt` only)
  - Per-asset `prompt` is optional and must be non-empty when provided; max length matches top-level prompt limit
- Optional: `template: "default" | "conversion"` (defaults to `default`)
- Optional: `tone: "professional" | "friendly" | "bold"`
- Optional: `intent: "educate" | "engage" | "convert"`
- Optional: `preset: { tone?: "professional" | "friendly" | "bold", intent?: "educate" | "engage" | "convert" }`
  - Missing tone/intent values default to `{ tone: "professional", intent: "educate" }`
  - Supports both top-level and nested values; when both are supplied they must match
  - Unknown keys are rejected (strict object validation)
- Optional: `controlProfile: "social-quick" | "balanced-default" | "deep-outline"`
  - Missing `controlProfile` defaults to `"balanced-default"`
  - Each profile maps to controls defaults:
    - `social-quick` -> `{ lengthTarget: "short", formatStyle: "bullet", audience: "general", objective: "awareness" }`
    - `balanced-default` -> `{ lengthTarget: "medium", formatStyle: "standard", audience: "practitioner", objective: "consideration" }`
    - `deep-outline` -> `{ lengthTarget: "long", formatStyle: "outline", audience: "executive", objective: "decision" }`
- Optional: `audience: "executive" | "practitioner" | "general"`
- Optional: `objective: "awareness" | "consideration" | "decision"`
- Optional: `controls: { lengthTarget?: "short" | "medium" | "long", formatStyle?: "standard" | "bullet" | "outline", audience?: "executive" | "practitioner" | "general", objective?: "awareness" | "consideration" | "decision" }`
  - Missing `controls` uses selected `controlProfile` mapping
  - Partial controls are allowed; missing fields fall back to selected profile defaults
  - Supports both top-level and nested audience/objective; when both are supplied they must match
  - Unknown keys are rejected (strict object validation)

Response JSON:

- Success (single mode): `{ ok: true, data: { draft, generationMeta } }`
  - `draft`: `{ id, contentType, prompt, text, status, createdAt }`
  - `generationMeta`: includes `provider`, `notes`, and `providerChain` diagnostics metadata
- Success (package mode): `{ ok: true, data: { package, generationMeta } }`
- UI contract note: Create package UX issues one package-mode request per generate action (`mode: "package"` + `package.assets`) and does not fan out single-mode calls.
  - `package`: `{ id, mode, prompt, assets, export, createdAt }`
  - `assets[]`: `{ assetType, draft, generationMeta }` where `draft` preserves single-draft shape per asset variant
  - `export`: structured downstream payload with versioned schema + normalized content blocks:
    - `{ schemaVersion, generatedAt, assetCount, assets[] }`
    - `assets[]`: `{ assetType, contentType, sourceDraftId, prompt, text, blocks[] }`
    - `blocks[]`: `{ id, type: "paragraph" | "bullet" | "thread-post", text, order }`
  - top-level `generationMeta.degraded` signals whether any asset degraded
- Validation error: `{ ok: false, error: string }` with `400`
  - conflicting top-level+nested control values -> `Validation failed` with `fieldErrors[]`
  - invalid `mode` value -> `Validation failed` with `fieldErrors[]`
  - invalid package shape, disallowed single/package field mix, duplicate asset types, or per-asset prompt violations -> `Validation failed` with `fieldErrors[]`
  - missing/blank prompt -> `Missing prompt`
  - missing/invalid `contentType` -> `Invalid contentType`
  - invalid `template` -> `Invalid template`
  - invalid `preset` object, unknown preset keys, or unsupported `tone`/`intent` values -> `Invalid preset`
  - invalid `controlProfile` value -> `Invalid controlProfile`
  - invalid `controls` object, unknown controls keys, or unsupported `lengthTarget`/`formatStyle`/`audience`/`objective` values -> `Invalid controls`
- Provider outage/invalid-output path: still returns `ok: true` with service-specific fallback `draft.text` and `generationMeta.degraded: true`
- Degraded quality hint: when diagnostics classify primary failure as `provider_config`, generation notes include a non-secret operator hint to check `OPENAI_API_KEY` runtime configuration.

Strict export assembly validation (package mode):

- Export payload assembly is validated before response return (fail-closed on invalid export shape).
- Enforces schema version pin, asset count/array parity, unique `assetType`, valid mapped `contentType`, and non-empty `sourceDraftId`/`prompt`/`text`.
- Enforces each normalized block has valid `id`, supported `type`, non-empty `text`, and positive integer `order`.

Strict response validation behavior:

- Model completion is parsed as strict JSON only.
- Parsed payload must be an object with non-empty `text: string`.
- Optional `notes` field is accepted only when it is a string.
- Invalid/missing fields trigger safe degraded fallback output (contract preserved).

### Minimal implementation checklist (follow-up coding)

- [x] Add/confirm `POST /api/internal/content/generate` contract docs with explicit request/response schema.
- [x] Keep Generate and Compliance prompts in separate modules/files.
- [x] Add service-specific output validators (no shared lax parser for both).
- [ ] Add per-service safety assertions in tests (e.g., no legal-approval wording in Compliance outputs).
- [x] Add provider-chain tests proving primary/fallback/degraded behavior using deterministic provider injection harness (`src/ai/runtime/providerChain.test.ts`).

### Compliance location normalization

Compliance findings now normalize location data into a UI-friendly contract:

- `locationLabel` is derived from the richest available source in this order:
  - explicit `location` string (when meaningful)
  - object location fields (`file/path/source`, `section`, `line`, `column`)
  - top-level finding fields (`file/source/section/line/column`)
- Unknown placeholders (`unknown`, `unknown:0:0`, `N/A`, etc.) normalize to `locationLabel: null`.
- `location` remains in the response for backward compatibility and mirrors `locationLabel` (or empty string when unavailable).

Examples:

- `privacy.md:42:7`
- `terms.md (disclaimer section)`
- `locationLabel: null` when no meaningful source location is provided

## Configure policy contract (`GET/POST /api/internal/configure/policy`)

Configure policy text is exposed via an internal endpoint pair designed for stable UI integration.

### Endpoints

- `GET /api/internal/configure/policy`
  - Returns the current policy text payload.
- `POST /api/internal/configure/policy`
  - Saves policy text and returns the persisted record shape.

### Request contract

- `POST` body:
  - `{ policyText?: string }`

Validation behavior:

- Empty or missing `policyText` returns `400` with:
  - `{ ok: false, error: "Validation failed", fieldErrors: [{ field: "policyText", message: "Policy text is required" }] }`
- Oversized `policyText` (> `8000` chars) returns `400` with:
  - `{ ok: false, error: "Validation failed", fieldErrors: [{ field: "policyText", message: "Policy text must be 8000 characters or fewer" }] }`

Sensitive-response caching behavior:

- `GET/POST /api/internal/configure/policy` responses include `Cache-Control: no-store`.

### Response contract (UI-stable)

Success (`GET` and `POST`):

- `{ ok: true, data: { policyText: string, updatedAt: string, version: number }, meta: { persistence: "supabase-table", note: string } }`

Blocked mode (`GET` or `POST`, when persistence runtime/table access is unavailable):

- `{ ok: false, error: string, blocked: { kind: "BLOCKED", error: string, todo: string, missingEnv?: string[], requiredSql?: string } }`

### Current persistence mode

- Configure policy is persisted in Supabase table `public.configure_policy` (singleton row keyed by `scope="default"`).
- Runtime env required by endpoint:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- If env/table access is unavailable, endpoint returns explicit BLOCKED payload while preserving top-level UI contract shape (`ok`, `data`, `error`).

### Required SQL

```sql
create table if not exists public.configure_policy (
  scope text primary key,
  policy_text text not null default '',
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);
```

## App Shell Route Map (MVP wiring)

The app shell is anchored under guarded `/app/*` routes:

- `/app/create` → current editor flow host (`EditorShell`)
- `/app/library` → library scaffold placeholder
- `/app/campaigns` → campaigns scaffold placeholder
- `/app/configure` → configure policy surface
- `/app/configure/features` → configure features catalog
- `/app/configure/apis` → configure API contracts catalog (internal + external/planned)
- `/app/configure/changelog` → configure release changelog

Compatibility / convenience routes:

- `/app/editor` → redirects to `/app/create` (legacy preview compatibility)
- `/create`, `/library`, `/campaigns`, `/configure` → redirect to their `/app/*` equivalents

Guard compatibility note:

- Middleware matcher remains `/app/:path*`; guard behavior is unchanged.

## Configure APIs catalog source-of-truth note

`/app/configure/apis` is an operator visibility surface, not a runtime endpoint.

Catalog rows are intentionally deterministic and sourced from:
- active internal route handlers under `src/app/api/internal/**/route.ts`
- documented contracts in this file (`docs/API_BOUNDARY.md`)

Planned external integrations are explicitly labeled as placeholders to avoid implying shipped contracts.

## Draft persistence contract (`POST/GET /api/internal/content/draft`)

Draft persistence is table-backed via `public.drafts` and runtime-wired Supabase env access in `src/lib/supabase/drafts.ts`.

### Runtime env requirements (actively read)

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Required SQL

```sql
create table if not exists public.drafts (
  id text primary key,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);
```

### Request/query contract

- `POST /api/internal/content/draft`
  - Body: `{ title?: string, body?: string }`
  - Creates one persisted draft.
- `GET /api/internal/content/draft?id=<draftId>`
  - Returns one draft by id.
  - `draftId` is fail-closed validated as UUID before DB access; malformed values return `400` validation error.
- `GET /api/internal/content/draft?q=<query>&limit=<n>&offset=<n>`
  - Lists persisted drafts with optional basic search and pagination.
  - `q` searches `title` and `body` (case-insensitive partial match).
  - `limit` defaults to `20`, minimum `1`, maximum `100`.
  - `offset` defaults to `0`, minimum `0`.

### Response contract (UI-stable)

- Create success (`POST`):
  - `{ ok: true, data: { id, title, body, createdAt } }`
- Read success (`GET` with `id`):
  - `{ ok: true, data: { id, title, body, createdAt } }`
- List/search success (`GET` without `id`):
  - `{ ok: true, data: { items: Draft[], total: number, limit: number, offset: number, q: string } }`
- Not-found (`GET` with unknown `id`):
  - `{ ok: false, error: "Draft not found" }`

Sensitive-response caching behavior:

- `GET/POST /api/internal/content/draft` responses include `Cache-Control: no-store`.

### Explicit BLOCKED output

If runtime env is missing or table access fails, endpoint returns:

- `{ ok: false, error: string, blocked: { kind: "BLOCKED", error: string, missingEnv?: string[], requiredSql: string } }`

This keeps top-level `ok/error` behavior intact for UI while surfacing exact unblock requirements.

## Draft library list contract (`GET /api/internal/content/list`)

Library listing is wired to table-backed draft persistence (`public.drafts`) and supports simple search and pagination parameters.

### Query params

- `q` (optional): case-insensitive search over `title` and `body`
- `limit` (optional): requested page size (normalized server-side)
- `offset` (optional): starting index (normalized server-side)

### Response contract

- Success (`200`):
  - `{ ok: true, data: { items: Draft[], total: number, limit: number, offset: number, q: string } }`
- BLOCKED/runtime error (`500`):
  - `{ ok: false, error: string, blocked: { kind: "BLOCKED", error: string, missingEnv?: string[], requiredSql: string } }`


## Events v0.2 phase 1 contracts (internal)
- Added protected internal routes for event create/list and registration submit: `GET/POST /api/internal/events`, `POST /api/internal/events/registrations`.
- Event contract fields: `title`, `date`, `summary`, `location`, `status`.
- Registration contract fields: `name`, `email`, optional `phone`, `attendanceIntent`, with required `eventId` link.
- Fail-closed validation: strict body key allowlists, enum checks, required/bounded fields, safe error payloads.
- No outbound email/delivery side effects in this phase.

## Events DB bootstrap contract (task-00184)
- Canonical SQL bootstrap file: `docs/events_bootstrap.sql` (Supabase/Postgres-safe, idempotent `IF NOT EXISTS`).
- Canonical table/column mapping (API -> DB):
  - Event create/list: `events.id`, `title`, `date`, `summary`, `location`, `status`, `created_at`.
  - Registration submit: `event_registrations.id`, `event_id`, `name`, `email`, `phone`, `attendance_intent`, `created_at`.
- `event_registration_intents` is provisioned as defensive write-ahead/raw-intake storage for future ingestion hardening; phase-1 handlers do not yet persist to it.
- Enum boundaries are enforced by DB `CHECK` constraints to mirror API allowlists (`status`, `attendance_intent`).
- No DB migration runner is currently wired in repository scripts; operators must run bootstrap SQL manually in Supabase SQL Editor/psql for environment readiness.

### Events detail/mutation (task-00229)
- `GET /api/internal/events/[eventId]` → fetch single event for editor prefill.
- `PATCH|PUT /api/internal/events/[eventId]` → update full event payload (`title`, `date`, `summary`, `location`, `status`).
- `DELETE /api/internal/events/[eventId]` → delete event by id.
- Auth: internal API auth required.
- Cache: `Cache-Control: no-store` on success/error/unauthorized.
- Validation: strict allowlist + bounded fields + safe `fieldErrors`.

### Events regression verification (task-0031)
- Verified `GET|PATCH|PUT|DELETE /api/internal/events/[eventId]` remains active and contract-stable.
- Verified internal-auth guard and `Cache-Control: no-store` remain enforced on this route.

## task-00225 — Supabase auth + user/tenant scoping foundation (phase-1)

### Auth identity resolution (server-authoritative first)

Internal API auth now resolves identity in this order:
1. **Supabase JWT** (authoritative): bearer token / `sb-access-token` cookie validated via `supabase.auth.getUser(...)`.
2. **Compat mode** (temporary): same-origin + session cookie fallback when `INTERNAL_API_AUTH_COMPAT_MODE != off`.

Auth context shape used by scoped internal handlers:
- `userId`
- `tenantId` (single-org-per-user in phase-1; defaults to `userId` unless `app_metadata.tenant_id` is present)
- `source` (`supabase-jwt` | `compat`)

### Scoped tables + API enforcement (phase-1 implemented)

Phase-1 scoped table enforcement is active for:
- `public.drafts`
- `public.contacts`
- `public.leads`

Read/write queries for these tables now enforce:
- `owner_id = auth.userId`
- `tenant_id = auth.tenantId`

Scoped internal routes:
- `/api/internal/content/draft`
- `/api/internal/content/list`
- `/api/internal/crm/contacts`
- `/api/internal/crm/contacts/[contactId]`
- `/api/internal/crm/leads`
- remediation audit append paths (`/api/internal/compliance/remediation/*`) when writing draft audit history

### Migration/backfill (manual)

Canonical SQL: `docs/auth_segmentation_phase1.sql`

Includes:
- idempotent `add column if not exists` for `owner_id`, `tenant_id`
- deterministic backfill to `legacy-owner` / `legacy-tenant`
- `set not null` after backfill
- scoped indexes for owner/tenant queries
- rollback notes

### Cross-user isolation test matrix (API layer)

| Scenario | Expected |
|---|---|
| User A creates draft/contact/lead | Success (201/200) |
| User B reads User A draft/contact/lead id | Not found / empty list in B scope |
| User A list endpoints | Returns only A-owned rows |
| Missing JWT + compat off | 401 Unauthorized |
| Same-origin compat mode request | Allowed with legacy scope until full cutover |

