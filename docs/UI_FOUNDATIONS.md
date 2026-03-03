# UI Foundations

## task-00130 — Campaign package UX phase 1

- `src/ui/editor-shell.tsx` extends Create generation controls with explicit mode selection:
  - **Single draft** mode keeps existing one-output generation behavior.
  - **Campaign package** mode generates a multi-channel set (Blog, LinkedIn, Newsletter, X Thread) from the same source prompt.
- Generation History now stores/restores outputs in a structured shape:
  - single generations are shown as one variant entry
  - package generations are grouped and rendered with per-variant metadata + restore actions
  - each variant can be restored directly into editor content with matching content-type context
- Existing flows are preserved (save, compliance, review workbench, remediation apply/undo); changes are additive and low-friction.
- `src/app/globals.css` adds compact `rf-*` styling for generation mode controls and package variant cards.

## task-00127 — Review workbench tidy pass 1

- `src/ui/editor-shell.tsx` reduces create-review clutter while preserving all remediation capabilities:
  - generation history panel spacing/header rhythm tightened for better scanability
  - review workbench now has clearer hierarchy via cardized sections and tighter spacing for selected-finding details/actions
  - selected-finding actions, protected-zone warning, and session apply history remain available with no contract/flow changes
- `src/app/globals.css` refines spacing/hierarchy for review workbench and generation history using existing `rf-*` conventions (no broad shell redesign).
- Existing create/save/generate/compliance/remediation behaviors are preserved; this is a targeted tidy pass ahead of broader UX cleanup.

## task-00124 — Auto-remediation UX phase 2

- `src/ui/editor-shell.tsx` now includes an explicit **Undo Last Apply** action in Review Workbench (manual, single-step rollback of the most recent remediation apply).
- Added protected/prohibited transform-zone warnings in Create remediation workflow when selected finding context suggests sensitive regions (legal/disclaimer, citation/attribution, compliance metadata).
- `src/ui/compliance-panel.tsx` now surfaces the same protected-zone warning at both finding-card level and selected-finding action panel for clearer operator visibility before apply actions.
- Preserved existing create/save/generate/compliance/history flows and endpoint contracts; changes remain additive and low-friction under existing `rf-*` style conventions.


## task-00121 — Auto-remediation UX phase 1

- `src/ui/editor-shell.tsx` now exposes a clearer manual-only auto-remediation affordance in Review Workbench:
  - explicit note that apply is manual and scoped to one selected finding
  - apply actions remain disabled unless a single finding context is selected
- Added stronger remediation status/preview feedback in Create flow:
  - explicit apply-in-progress/apply-error/apply-success review feedback messages
  - before/after remediation preview now includes bounded change summary (`changedChars`/`changedLines`) when returned by the API
- Preserved existing workflows and contracts:
  - generate/save/compliance/history paths unchanged
  - existing remediation apply history and apply+regenerate flow remain available
- Styling and naming remain aligned to existing `rf-*` conventions (no shell/layout redesign).

## task-00118 — Create generation history panel

- `src/ui/editor-shell.tsx` now tracks an in-session generation history (last MAX_GENERATION_HISTORY outputs) scoped to the current Create context (active draft when `draftId` is present, otherwise current new-draft session).
- Added a compact **Generation History** panel in Create that shows for each entry:
  - content type badge
  - runtime state badge (OK vs DEGRADED)
  - generated timestamp and provider hint (when available)
  - short preview snippet
- Added low-friction **Restore to Editor** action per history entry, which rehydrates the editor content and updates generation status feedback without changing save/generate/compliance API contracts.
- Existing behavior preserved:
  - save flow unchanged
  - generate request contract unchanged
  - compliance + review workbench interactions unchanged
- `src/app/globals.css` adds `rf-generation-history*` styles aligned with existing `rf-*` conventions.

## task-00114 — Content + review UX polish for live AI runtime

- `src/ui/editor-shell.tsx` now distinguishes generation outcomes using existing `generationMeta` metadata:
  - explicit successful runtime message when primary generation succeeds
  - explicit degraded fallback message when `generationMeta.degraded` is true
  - runtime/provider hint surfaced in review feedback for operator clarity
- `src/ui/compliance-panel.tsx` now reads compliance `meta` metadata and shows run-result state:
  - successful runtime completion status
  - degraded fallback completion status when `meta.degraded` is present
- `src/app/globals.css` includes shared `rf-status` variants (muted/success/error) to keep feedback low-friction and consistent with existing `rf-*` patterns.
- Existing workflows are preserved:
  - Create generate/save flow unchanged in request contracts
  - Compliance check and review workbench actions preserved
  - Library→Create draft-open behavior unaffected

## task-00111 — Review workbench phase 6 (apply + regenerate)

- `src/ui/editor-shell.tsx` adds a quick selected-finding workflow in Review Workbench:
  - **Apply Selected Context** to stage remediation context directly from currently selected compliance finding
  - **Apply + Regenerate Draft** to apply selected remediation context and immediately run draft generation in one action
- Generation flow in `EditorShell` now uses a shared helper so standard Generate and apply+regenerate both preserve existing request contracts (`POST /api/internal/content/generate` with `{ prompt, contentType }`).
- Existing behavior remains preserved:
  - save flow/status feedback unchanged
  - compliance check flow/disclaimer unchanged
  - selected-finding/context/history behavior remains low-friction and additive
- `src/app/globals.css` adds compact `rf-review-workbench-actions` styles aligned with existing `rf-*` UI patterns.

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

- `src/ui/compliance-panel.tsx` wires the `Run Compliance Check` action to `POST /api/internal/compliance/check` with editor-backed request payload (`content`, optional `contentType`, optional `policySet`).
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

## task-00093 — Review tools kickoff in Create flow

- `src/ui/compliance-panel.tsx` now includes a first review-tools layer on top of existing compliance findings:
  - findings summary card with total + per-severity counts (`critical`, `high`, `medium`, `low`, `unknown`)
  - per-finding quick actions for remediation workflow (`Apply Hint`, `Remind Later`)
- `src/ui/editor-shell.tsx` now wires review quick actions without changing API contracts.
- Existing guardrail/disclaimer messaging is preserved unchanged:
  - **"AI-backed compliance insights are guidance, not legal approval."**
- Existing save, generate, and compliance-check flows are preserved:
  - no endpoint contract changes
  - no route/layout redesign
  - review actions are additive UI affordances only
- Styling stays within existing railfin-ui patterns and primitives (`rf-status`, severity badges, card-like sections).

## task-00102 — Review workbench phase 4

- `src/ui/editor-shell.tsx` now includes a compact **Review Workbench** section in Create that surfaces:
  - the currently selected finding context (issue, severity, location, remediation hint)
  - current-session remediation apply history (latest entries)
- `src/ui/compliance-panel.tsx` now emits selected-finding context to parent editor state via `onSelectedFindingChange`, keeping selection UX and existing action controls intact.
- `src/app/globals.css` adds compact `rf-review-workbench*` styles consistent with existing railfin `rf-*` conventions.
- Preserved behavior constraints:
  - no generation/save/compliance API contract changes
  - existing compliance disclaimer, status messaging, and remediation apply flow retained

## task-00099 — Review tools UX phase 3

- `src/ui/editor-shell.tsx` now provides clearer remediation apply context with an **Applied Remediation Context** panel:
  - captures previous remediation block (if present) and the newly applied block
  - shows side-by-side before/after context to reduce ambiguity while revising
  - preserves controlled remediation block replacement behavior (`[Compliance Remediation Draft Context] ...`)
- `src/ui/compliance-panel.tsx` keeps selection and action handling obvious and low-friction:
  - selected-finding action controls remain centralized and persist in the summary panel
  - action controls (`Apply Selected`, `Remind Later`, `Clear Selection`) are always visible and explicitly disabled until a finding is selected
  - selected context includes issue/severity/remediation/location details
- Styling updates in `src/app/globals.css` remain aligned with existing railfin patterns (`rf-*` classes), including stronger selected-action panel prominence and remediation preview card styling.
- Preserved behavior constraints:
  - no generation/save/compliance contract changes
  - existing status + legal-disclaimer messaging retained

## task-00096 — Review tools UX phase 2

- `src/ui/compliance-panel.tsx` now presents severity totals as compact summary chips for faster scan/readability (`critical`, `high`, `medium`, `low`, `unknown`).
- Added a dedicated **Selected Finding Actions** panel in the summary area:
  - shows selected finding issue/remediation/location context
  - centralizes `Apply Selected` / `Remind Later` actions for clearer decision flow
  - provides explicit empty-state guidance until a finding is selected
- Finding cards remain grouped by severity and keep explicit selection affordance (`Select Finding`) with selected-card highlighting.
- Preserved behavior constraints:
  - existing save/generate/compliance request paths unchanged
  - existing status/disclaimer messaging retained
  - no API contract or endpoint shape changes

## task-00094 — Review tools actions phase 1

- `src/ui/compliance-panel.tsx` extends review actions with explicit finding selection:
  - each finding card now includes `Select Hint`
  - selected-card state is visually highlighted and gates downstream actions
  - remediation actions are now explicit (`Apply Selected`, `Remind Later`) and only enabled for the selected finding
- `src/ui/editor-shell.tsx` applies selected remediation hints into a controlled, editable draft context block:
  - inserts a bounded `[Compliance Remediation Draft Context] ... [/Compliance Remediation Draft Context]` block
  - includes issue/severity/location + selected remediation hint
  - replaces prior remediation block when reapplying, avoiding unbounded repeated append noise
- Preserved behavior constraints:
  - existing save/generate/compliance request paths unchanged
  - existing status messaging/disclaimer retained
  - no API contract changes

## task-00092 — Create generation kickoff (AI runtime wired)

- `src/ui/editor-shell.tsx` now wires a **Generate Draft** action to `POST /api/internal/content/generate`.
- Create UI sends `{ prompt: content, contentType }` with a selectable content type (`blog`, `linkedin`, `newsletter`, `x-thread`).
- Generation flow adds explicit UX states without changing save/compliance behavior:
  - `generating` pending state
  - generated success message from `generationMeta.notes`
  - inline error state on generation failure
- On success, generated `draft.text` hydrates editor content in-place so existing save/compliance flows continue unchanged.
- Existing compliance guardrail language remains intact in the compliance panel: **"AI-backed compliance insights are guidance, not legal approval."**

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
