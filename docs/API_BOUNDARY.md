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

## Compliance Check Contract (MVP)

`POST /api/internal/compliance/check` is currently a contract endpoint for UI integration only.

Response JSON:

- Success response: `200` with `{ ok: true, findings: ComplianceFinding[] }`
- Error response: standard non-2xx shape (UI consumes `error`/`message` defensively)

`ComplianceFinding` response object fields (exactly):

- `severity: string`
- `issue: string`
- `details: string`
- `suggestion: string`
- `location: string`

### `location` normalization

`location` is normalized to canonical string format:

- `file:line:column`

Examples:

- `controls/access-control.yaml:12:3`
- `unknown:0:0` (fallback when source location is missing/invalid)

Notes:
- Endpoint is stubbed contract wiring only.
- No real model invocation behavior is changed in this stage.

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
