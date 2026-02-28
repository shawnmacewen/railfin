# UI Foundations

## Login

Implemented MVP login action wiring in `src/ui/login.tsx` with the following behavior:

- Submit handler posts to `/auth/login` with JSON payload containing:
  - `email`
  - `password`
  - optional `next` when present in the URL query
- Request is sent with `credentials: include` and `X-Requested-With: XMLHttpRequest` for SEC middleware compatibility.
- Form enters a `submitting` state during request lifecycle:
  - fields and submit button are disabled while pending
  - submit button label changes to `Signing in...`
  - `aria-busy` is set on form
- Error behavior:
  - displays response `error` / `message` inline via `role="alert"`
  - falls back to a generic sign-in error if request fails
- Success behavior:
  - redirect priority: `payload.redirectTo` → safe `next` value → `/`
  - `next` is sanitized to internal paths only (`/...`) before use

### Guard Contract Notes

- `/login?next=...` remains middleware-compatible: client forwards `next` only when present and only if it is an internal path (`/` prefix), otherwise it falls back to `/`.

## Compliance Panel (MVP + AI insights UX)

- `src/ui/compliance-panel.tsx` wires the `Run Compliance Check` action to `POST /api/internal/compliance/check` (internal stub endpoint contract).
- Existing loading/error flow is preserved (`Running Compliance Check...`, inline `role="alert"` on failure).
- Findings are now grouped by normalized severity (`critical`, `high`, `medium`, `low`, `unknown`) and rendered as grouped cards.
- Severity is surfaced with clear visual badges (`.rf-severity-badge` variants) for fast scan/readability.
- Each finding includes a concise **Remediation Hint** (trimmed from `suggestion` with safe fallback guidance).
- UI includes explicit compliance disclaimer: **"AI-backed compliance insights are guidance, not legal approval."**
- No shell/layout redesign: app shell and existing editor flow remain intact.

## Editor Integration Note

- `src/ui/editor-shell.tsx` now composes the main editor flow and mounts `<CompliancePanel />` directly below editor save controls.
- Editor UX exposes visible action/feedback states: save button disabled logic, pending label (`Saving...`), success status, and inline validation/error feedback.

## Click Path (Preview Walkthrough)

- Open `/preview/login`
  - Enter email/password and click **Sign in** to validate login form submit/loading/error behavior.
- Open `/preview/editor`
  - Enter text in **Editor Content** and click **Save Draft** to exercise draft save controls + save feedback.
  - Click **Run Compliance Check** to view compliance panel behavior and findings render area.

## App Shell Foundation (task-00040)

### Shell structure

- `src/app/app/layout.tsx` mounts a reusable `<AppShell>` for all `/app/*` routes.
- `src/ui/app-shell.tsx` defines the shared two-column shell:
  - persistent left sidebar nav
  - top header with active page title and placeholders
  - main content slot for route content
- `src/app/globals.css` includes minimal structural classes (`rf-shell`, `rf-sidebar`, `rf-header`, `rf-content`) and primitive styling.

### Navigation contract

- Primary nav is fixed and ordered as:
  1. `Create` → `/app/create`
  2. `Library` → `/app/library`
  3. `Campaigns` → `/app/campaigns`
  4. `Configure` → `/app/configure`
- Active state is pathname-driven (`exact` or nested path prefix).
- `/app` redirects to `/app/create`.
- Legacy `/app/editor` now redirects to `/app/create` so existing editor/compliance flow remains reachable under the new Create nav item.

### Header contract

- Left: active nav label as page title.
- Right placeholders:
  - environment badge placeholder (`Env`)
  - user-menu placeholder (`User`, disabled button)

### Primitive wrappers

- Added in `src/ui/primitives.tsx`:
  - `Button`
  - `Card`
  - `Badge`
  - `NavItem`
- These are intentionally thin wrappers for consistency and future token/theme expansion without introducing a redesign.

## Branding (task-00046)

- Railfin v1 brand asset is stored at `public/brand/railfin-v1.png`.
- App favicon/icon is provided via `src/app/icon.png` (Next app-router icon file convention).
- Shell top-left branding in `src/ui/app-shell.tsx` now renders the Railfin logo + wordmark linking to `/app/create`.
- Supporting minimal shell brand styles are in `src/app/globals.css` (`.rf-brand`, `.rf-brand-logo`).

## Hosted Smoke UX Verification Rerun (task-00056)

Rerun completed after hosted path repair, verifying current route/component contracts without layout redesign.

- Verified route/component wiring:
  - `/login` and `/preview/login` render `LoginForm`
  - `/app/create` and `/preview/editor` render `EditorShell` (which mounts `CompliancePanel`)
- Re-verified login UX assumptions (`src/ui/login.tsx` + `src/app/auth/login/route.ts`):
  - submit/loading/error states present
  - internal-only `next` handling retained
  - redirect contract remains `payload.redirectTo -> safe next -> /`
- Re-verified create/save UX assumptions (`src/ui/editor-shell.tsx`):
  - save disabled for empty content
  - explicit saving/success/error feedback remains intact
- Re-verified compliance UX assumptions (`src/ui/compliance-panel.tsx`):
  - action loading/error states present
  - findings grouped by severity and rendered as cards
  - legal disclaimer rendering present: **"AI-backed compliance insights are guidance, not legal approval."**
- Confirmed provider/fallback behavior (`src/app/api/internal/compliance/check/route.ts`):
  - provider chain remains Codex-first with ChatGPT API fallback
  - safe fallback finding is returned when providers fail/time out
