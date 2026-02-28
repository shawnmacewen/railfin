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

## Compliance Panel (MVP)

- `src/ui/compliance-panel.tsx` wires the `Run Compliance Check` action to `POST /api/internal/compliance/check` (internal stub endpoint contract).
- UI handles loading/error states and renders findings using the API shape fields: `severity`, `issue`, `details`, `suggestion`, `location`.
- Behavior is intentionally minimal and contract-first (no styling overhaul in this task).

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
