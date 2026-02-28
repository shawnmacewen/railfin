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

## Compliance Check Contract (AI-backed, fallback-safe)

`POST /api/internal/compliance/check` is an AI-backed endpoint with a Codex-first provider path and ChatGPT API fallback.

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

### Provider behavior

- Preferred provider path: `codex`
- Fallback-capable path: `chatgpt-api`
- Primary provider can be selected via `AI_PROVIDER` (`codex` default)
- If primary provider fails or times out, the endpoint automatically retries with the secondary provider
- If all providers fail, endpoint returns safe fallback findings to keep UI response handling stable

### `location` normalization

`location` is normalized to canonical string format:

- `file:line:column`

Examples:

- `controls/access-control.yaml:12:3`
- `unknown:0:0` (fallback when source location is missing/invalid)

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
