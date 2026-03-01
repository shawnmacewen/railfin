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

## Library UX behavior (task-00063)

- `src/app/app/library/page.tsx` now renders a usable library UI (`LibraryPageContent`) instead of placeholder copy.
- `src/ui/library-page.tsx` behavior:
  - fetches drafts from `GET /api/internal/content/list`
  - includes search input (`type="search"`) and refetches when query changes
  - shows explicit **loading**, **error**, and **empty** states
  - renders draft list cards (title, created timestamp, body excerpt) on success
- Empty-state copy distinguishes between:
  - no drafts at all
  - no search matches for current query
- Styling for list/card presentation is added in `src/app/globals.css` under `rf-library-*` classes.

## Configure UX behavior (task-00065)

- `src/app/app/configure/page.tsx` now renders `ConfigurePageContent` from `src/ui/configure-page.tsx` instead of placeholder text.
- Configure screen includes:
  - provider status placeholders for **Codex (Primary)** and **Fallback Provider**
  - free-text **Policy guidance** textarea for operator-entered policy instructions
  - Save/Cancel action row with dirty-state guards (`disabled` unless changes exist)
- Save/Cancel UX state contract:
  - Save enters `saving` state (`Saving...`, `aria-busy`) and ends with success/error feedback message
  - Cancel restores last saved policy text and shows discard feedback
  - No-op save attempt (no dirty changes) returns explicit `No changes to save.` feedback
- Styling follows existing app-shell design-system conventions using existing primitives (`Card`, `Button`, `Badge`) plus scoped `rf-configure-*` classes in `src/app/globals.css`.

## Library → Create handoff (task-00069)

- Library rows now include **Open in Create** action linking to `/app/create?draftId=<id>`.
- Create editor (`src/ui/editor-shell.tsx`) reads `draftId` from query params and fetches `GET /api/internal/content/draft?id=<id>`.
- On successful load, editor content hydrates with the selected draft body and surfaces status text (`Opened draft: <title>`).
- Existing editor save/compliance behavior remains intact (same save button states and compliance panel composition).

## Configure → Create UX integration polish (task-00072)

- Create flow (`src/ui/editor-shell.tsx`) now surfaces a persistent save-state line above the editor form:
  - `Draft save status: Not saved yet.`
  - `Draft save status: Saving…`
  - `Draft save status: Saved.`
  - `Draft save status: Save failed.`
- Create flow also reads configure policy metadata from `GET /api/internal/configure/policy` and shows:
  - `Policy last updated: <localized timestamp>` when `updatedAt` is available
  - `Policy last updated: unavailable` when metadata is missing/unreachable
- Integration constraints preserved:
  - Compliance panel remains mounted in Create flow (`<CompliancePanel />` unchanged)
  - Library handoff via `draftId` query parameter remains the same and still hydrates editor body/title

## Active policy context in compliance area (task-00075)

- Compliance area now shows a concise policy-context line directly above the compliance disclaimer:
  - `Active policy context: Configure policy updated <localized timestamp>.`
  - fallback: `Active policy context: No configure policy metadata available.`
- The context line is sourced from the same configure-policy metadata already loaded in Create flow (`GET /api/internal/configure/policy`), avoiding additional endpoint calls.
- Existing behavior is preserved:
  - Compliance run action and findings rendering are unchanged.
  - Library→Create handoff (`draftId` query load) remains unchanged.

## RC1 visual consistency pass (task-00078)

- Scope: light consistency pass only (no functional or route contract changes).
- Shared page-heading treatment across Create/Library/Configure now uses:
  - `.rf-page-header`
  - `.rf-page-title`
  - `.rf-page-subtitle`
- Shared status/feedback treatment across the same views now uses:
  - `.rf-status`
  - `.rf-status-muted`
  - `.rf-status-success`
  - `.rf-status-error`
- RC1 constraints:
  - Preserve existing behavior for Library→Create handoff (`draftId`), Configure save/cancel flow, and compliance run/findings flow.
  - Keep changes lightweight and visual-consistency-focused (spacing, header rhythm, status presentation).

## Create save-draft API wiring restored (task-00082)

- `src/ui/editor-shell.tsx` Save Draft action now performs a real `POST /api/internal/content/draft` call instead of mock timeout success.
- Request payload includes:
  - `body` (full editor content)
  - `title` (existing loaded draft title when present, otherwise derived from first content line with safe fallback `Untitled Draft`)
- Save UX semantics remain intact:
  - existing status line cycle (`saving` / `saved` / `error`)
  - save button disable behavior remains tied to content + in-flight state
- Save feedback now reports backend draft hints when available (`title` and `id`) and surfaces API error details from `fieldErrors`/`error` when save fails.
- Existing Create behaviors were preserved:
  - `draftId` query hydration/load path
  - configure policy metadata indicator used by Create/compliance context
