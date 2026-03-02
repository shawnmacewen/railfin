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

`ComplianceFinding` response object fields (exactly):

- `severity: string`
- `issue: string`
- `details: string`
- `suggestion: string`
- `location: string`

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
- Required: `contentType: "blog" | "linkedin" | "newsletter" | "x-thread"`
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

- Success: `{ ok: true, data: { draft, generationMeta } }`
  - `draft`: `{ id, contentType, prompt, text, status, createdAt }`
  - `generationMeta`: includes `provider`, `notes`, and `providerChain` diagnostics metadata
- Validation error: `{ ok: false, error: string }` with `400`
  - conflicting top-level+nested control values -> `Validation failed` with `fieldErrors[]`
  - missing/blank prompt -> `Missing prompt`
  - missing/invalid `contentType` -> `Invalid contentType`
  - invalid `template` -> `Invalid template`
  - invalid `preset` object, unknown preset keys, or unsupported `tone`/`intent` values -> `Invalid preset`
  - invalid `controlProfile` value -> `Invalid controlProfile`
  - invalid `controls` object, unknown controls keys, or unsupported `lengthTarget`/`formatStyle`/`audience`/`objective` values -> `Invalid controls`
- Provider outage/invalid-output path: still returns `ok: true` with service-specific fallback `draft.text` and `generationMeta.degraded: true`
- Degraded quality hint: when diagnostics classify primary failure as `provider_config`, generation notes include a non-secret operator hint to check `OPENAI_API_KEY` runtime configuration.

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

### `location` normalization

`location` is normalized to canonical string format:

- `file:line:column`

Examples:

- `controls/access-control.yaml:12:3`
- `unknown:0:0` (fallback when source location is missing/invalid)

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
- `/app/configure` → configure scaffold placeholder

Compatibility / convenience routes:

- `/app/editor` → redirects to `/app/create` (legacy preview compatibility)
- `/create`, `/library`, `/campaigns`, `/configure` → redirect to their `/app/*` equivalents

Guard compatibility note:

- Middleware matcher remains `/app/:path*`; guard behavior is unchanged.

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
