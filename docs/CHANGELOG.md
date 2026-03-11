## 2026-03-11 — CRM contact mutation UX (task-00228)
- Updated CRM top action label to **Add Contact**.
- Added contact Edit actions in both table and mobile card surfaces with prefilled modal edit flow.
- Added contact Delete actions in both surfaces with explicit confirmation prompt.
- Preserved responsive behavior and current create-contact flow.
- Build verification: `npm run build` passed.

## 2026-03-11 — Tiny configure smoke note (task-00225)
- Added subtle non-functional Configure footer note: **System status: operational** in `src/app/app/configure/page.tsx`.
- Updated docs: `docs/tasks.md`, `docs/CHANGELOG.md`, `docs/agent-reports/railfin-ui.md`.
- Build in isolated UI worktree remains blocked by runtime permission issue (`next: Permission denied`).

## 2026-03-09 — Campaign automation template packs UI (task-00219)
- Added event-focused Campaign template packs in Create flow: **Pre-event nurture**, **Registrant reminders**, and **Post-event follow-up**.
- Added template preview summary before apply (template description + sequence/step scaffold counts).
- Added **Apply template** action that injects scaffolded sequences/steps directly into the existing sequence builder for operator edits.
- Added overwrite guard: applying a template over modified draft sequences now prompts explicit confirmation (no silent replacement).
- Added apply-state UX (`Applying template...`) and safe error messaging when template insertion fails.
- Added responsive/additive styles for template-pack selector and preview cards in `src/app/globals.css`.
- Build verification: `npm run build` passed.

## 2026-03-09 — Event→campaign trigger flow security validation (task-00220)
- Re-validated auth/no-store protections on event-registration and campaign-enrollment trigger-adjacent routes.
- Re-validated fail-closed validation and safe error-shape posture (no raw request payload reflection).
- Logged critical caveat: duplicate enrollment prevention is not currently enforced at DB or contract layer (`campaign_id + contact_id` can be duplicated), so replay/malformed-but-valid requests can create multiple enrollments.
- Recommended hardening follow-up: add DB uniqueness (`campaign_enrollments(campaign_id, contact_id)`), handle conflict as deterministic safe response, and treat enrollment create paths as idempotent.
- Build verification: skipped (docs-only security verification).

## 2026-03-09 — Event-triggered campaign enrollment hooks (task-00218)
- Added an internal event-trigger enrollment path for campaigns and wired Events registration submissions to invoke it automatically.
- Added new protected endpoint: `POST /api/internal/campaigns/triggers/events` for internal trigger ingestion.
- Trigger ingestion now validates strict payload contract (`eventId`, `contactId` or `email`, `triggerType`, optional source metadata) and fails closed with safe field-level errors.
- Added deterministic duplicate guard so the same `contact + campaign + event + triggerType` context does not create duplicate enrollments.
- Enrollment trigger context is now persisted into enrollment event `details_json` for auditability.
- Existing Events registration API contract remains working; response now includes additive `campaignTrigger` processing summary metadata.

## 2026-03-09 — Campaigns execution/enrollment security validation pass (task-00217)
- Re-validated campaigns internal API guard posture: all currently shipped campaign handlers enforce internal auth guard before business logic and return no-store response headers.
- Re-validated fail-closed request validation and safe error mapping on campaign write/update surfaces (`Validation failed` + `fieldErrors`, strict allowlists, bounded values).
- Re-confirmed no unsafe request payload reflection in campaign error responses.
- Documented current scope caveat: repository does not yet contain dedicated campaigns execution/enrollment transition route handlers, so this pass records a pre-runtime baseline and expected controls for when those endpoints ship.
- Build verification: skipped (docs-only security verification).

## 2026-03-09 — Campaigns execution engine skeleton (task-00215)
- Added campaign enrollment execution endpoints for create/start, per-campaign enrollment listing, and transition execution.
- Added deterministic step progression scaffold for campaign enrollments:
  - email steps now record send-intent events only (no provider delivery yet)
  - wait steps now compute and persist next-eligible transition timestamps
  - condition steps now evaluate rules deterministically (`if` / `or`) and choose yes/no branch scaffolds
- Added enrollment transition observability with persisted audit events (`campaign_enrollment_events`) and stable status/active-sequence/active-step transition updates.
- Added strict fail-closed validation + safe field-level errors for the new execution request contracts.

## 2026-03-09 — Configure APIs catalog page in Configure section (task-00214)
- Added new Configure route `/app/configure/apis` and in-section nav entry **APIs**.
- Added searchable API catalog with two operator-facing sections: **Internal APIs** and **External APIs**.
- Internal catalog now shows endpoint path, methods, concise contract purpose, key params/body fields, and internal auth/session expectation.
- External catalog includes current login contract plus explicit planned placeholders for OpenAI runtime and email-provider integrations.
- Added deterministic source references for each catalog row so operators can trace contracts to route files/docs.

## 2026-03-09 — Campaigns builder UX polish v2 (task-00212)
- Improved Campaign create modal sequence editor readability with clearer step grouping and labels for email/wait/condition steps.
- Upgraded condition step UX with clearer rule logic wording (`if` all required vs `or` any match), better yes/no path field labels, and inline helper guidance.
- Tightened social scheduler form layout and clarified datetime input expectations; improved status visibility with refined compact status chips in posts and timeline lists.
- Refined targeting preview into a clearer summary card (matched/total + sample IDs) and cleaner explicit unavailable/empty states.
- Applied responsive spacing/layout polish across campaigns builder and scheduler surfaces.

## 2026-03-09 — Campaigns + Contacts API security verification pass (task-00213)
- Re-verified all new Campaigns internal API routes and the Contacts bridge endpoint enforce internal auth guard checks before business logic.
- Re-verified sensitive response cache posture: reviewed endpoints return `Cache-Control: no-store` on success/error, and unauthorized responses inherit no-store from shared auth helper.
- Re-verified fail-closed validation for Campaigns targeting preview, sequence/step CRUD payloads, and social post create/update payloads with deterministic `Validation failed` + `fieldErrors` responses.
- Confirmed safe error-shape posture: validation errors expose field-level diagnostics only and do not echo raw request payloads.
- Documented one operational caveat: temporary auth compat-mode remains a residual risk until strict server-authoritative auth rollout is complete and `INTERNAL_API_AUTH_COMPAT_MODE=off` is enforced.

## 2026-03-09 — CRM contacts generalization + leads bridge hardening (task-00211)
- Added contacts-first CRM persistence support with a new Supabase helper and explicit required SQL bootstrap metadata for `public.contacts`.
- Added `GET /api/internal/crm/contacts` filtering (`search`, `stage`, `source`) and added write endpoints for contacts create/update with strict fail-closed validation.
- Added contacts update route: `PATCH /api/internal/crm/contacts/[contactId]`.
- Hardened lead compatibility path so existing `GET/POST /api/internal/crm/leads` flows read/write through contacts-first mapping when available, preserving current CRM UI lead fields.
- Added manual idempotent migration/backfill SQL (`docs/crm_contacts_backfill_from_leads.sql`) with verification queries.
- Build verification: `npm run build` passed.

## 2026-03-09 — Campaigns API engine v1 shipped (task-00209)
- Replaced campaigns contract persistence from in-memory records to Supabase-backed table helpers in `src/lib/supabase/campaigns.ts`.
- Added campaigns detail + engine routes for sequences, steps, social post scheduling, and calendar timeline listing.
- Added strict validation contracts for sequence/step CRUD and social post create/update payloads with safe fail-closed `fieldErrors`.
- Added deterministic `sampleContactIds` in targeting preview response while keeping existing counts contract and compatibility for current Campaigns UI.
- Kept existing `GET/POST /api/internal/campaigns` contracts compatible with task-00208 UI behavior.
- Build verification: `npm run build` passed.

## 2026-03-09 — Campaigns UI builder v1 shipped (task-00210)
- Upgraded Campaigns page from foundation scaffold to usable v1 builder surface.
- Added sequence editor in campaign creation flow with add-sequence/add-step and step-type-specific forms for email, wait, and condition branches.
- Added stronger targeting preview UX with loading/empty/error states, count summary, and sample contact ID display.
- Added social scheduling surface with scheduled-post form, list panel, and calendar/timeline panel wiring to calendar-items endpoint when available.
- Added explicit graceful handling for missing phase-2 APIs with clear “not available yet” messaging instead of broken/blank states.
- Added responsive Campaigns layout/style updates to keep builder/scheduler surfaces stable on smaller screens.

## 2026-03-09 — Campaigns UI foundation v1 shipped (task-00208)
- Replaced Campaigns placeholder page with functional phase-1 UX including live list table, create action, and resilient loading/empty/error states.
- Added Create Campaign modal with required campaign fields plus phase-1 targeting stubs (segment selector placeholder and read-only contacts/lead-stage summary chips).
- Wired Campaigns UI to internal APIs from the prior foundation task (`GET/POST /api/internal/campaigns`, `POST /api/internal/campaigns/targeting/preview`).
- Added campaign detail scaffolding (sequence cards with email/wait/condition placeholders) and explicit “coming next” marker for branching editor.
- Added responsive scheduled social-post calendar scaffold panel (list/calendar placeholder, drag-drop intentionally deferred).

## 2026-03-09 — Campaigns phase-1 foundation + contacts-first targeting contracts (task-00207)
- Added Campaigns module PRD at `docs/PRD_Campaigns_Module_v0.md` covering MVP/v2 scope, contacts-first targeting migration (`leads -> contacts + lead metadata`), branching logic rules (`if/or`), and event-trigger roadmap.
- Added manual SQL bootstrap at `docs/campaigns_bootstrap.sql` for campaigns foundation tables: campaigns, sequences, steps, enrollments, social posts, calendar items, contacts, and segments.
- Added protected internal campaign APIs:
  - `GET/POST /api/internal/campaigns`
  - `POST /api/internal/campaigns/targeting/preview`
- Added protected contacts-first CRM bridge endpoint:
  - `GET /api/internal/crm/contacts`
- Added strict fail-closed validation contracts for campaign creation and targeting preview to avoid unsafe/fake success responses.
- Updated `/app/campaigns` foundation page copy to surface active phase-1 API entrypoints while keeping scope intentionally lean.

## 2026-03-08 — Create collapsed compliance controls stay top-anchored (task-00206)
- Fixed Create minimized compliance controls so reopen/run controls no longer fall to the bottom of the page when the panel is collapsed.
- Desktop collapsed layout now keeps a narrow right-side controls column, so controls remain top-aligned beside Create content.
- Mobile/tablet collapsed layout now reorders minimized controls above main Create content in single-column mode, keeping controls immediately reachable.
- Preserved non-overlap behavior (controls stay in normal page flow), compliance result caching, and responsive behavior.

## 2026-03-08 — Create prompt payload debug drawer on Create (task-00205)
- Added a compact **View prompt payload** debug toggle on the Create screen.
- Added an operator-focused debug drawer that shows the most recent generation payload in-session, including:
  - final assembled prompt string sent to model runtime
  - key metadata: mode, content type, template, tone, intent, controls, topics, purposes
- Added a **Copy payload** action to copy assembled prompt + metadata for troubleshooting.
- Extended generate API success payload with additive `data.debug` metadata so UI can render exact assembled prompt without changing existing generation/compliance/save behavior.

## 2026-03-08 — Create compliance rail overlap + control placement cleanup (task-00204)
- Fixed Create compliance minimized-state control so reopen button is anchored in normal page flow and no longer overlays editor controls/content.
- Moved collapse/minimize control into the compliance card header (inside the main container) and widened it with a clearer arrow + text label.
- Removed the blue vertical rail/divider between editor and compliance panes by dropping the narrow rail-control column and keeping separation via card spacing/layout.
- Preserved local compliance-result caching behavior from task-00203 by keeping the compliance card mounted while collapsed (`hidden`) and only toggling visibility.
- Preserved existing run compliance/findings/remediation behavior and Create unsaved-warning/responsive behavior.

## 2026-03-08 — Create compliance results persist while panel is minimized (task-00203)
- Create-page compliance findings now persist locally for the active Create session, even when the compliance panel is minimized and reopened.
- Compliance panel collapse now hides without unmounting, so prior findings and run summary return immediately on reopen.
- Added clear stale-results warning when content changes after a compliance run: findings stay visible but are marked as potentially outdated until rerun.
- Compliance cache now clears on successful Save Draft, while still clearing naturally when leaving Create or manually rerunning checks.
- No auto-rerun on panel toggle; existing run button and findings rendering remain unchanged.

## 2026-03-08 — Compliance finding location mapping + unknown fallback cleanup (task-00202)
- Compliance-check normalization now extracts location metadata from richer provider payload shapes (string/object `location`, plus `source`/`file`/`section`/`line`/`column` when present).
- Added additive finding field `locationLabel` (nullable) so UI can consume a stable normalized display location without parsing heuristics.
- Compliance finding cards no longer render placeholder `unknown:0:0`; when no meaningful location exists, the Location row is omitted.
- Selected remediation context and remediation block fallbacks now use friendly `Location unavailable` text.
- Existing compliance run/list/remediation behavior remains intact.

## 2026-03-08 — Create unsaved-warning + compliance panel cleanup (task-00201)
- Added Create-route unsaved-content guard for app-shell navigation: attempting to leave /app/create with meaningful unsaved generated/edited content now opens a clear stay-vs-leave warning dialog.
- Guard now covers left-nav/app-shell route changes and browser/tab close refresh while Create has unsaved meaningful edits.
- Tuned unsaved trigger to avoid noisy prompts: warning only appears when normalized content meaningfully differs from last saved/opened baseline.
- Reduced Compliance visual weight in Create rail: lighter card framing and less heavy treatment around run/summary states.
- Removed supporting compliance subtitle copy under Compliance Feedback and made successful API validation message more discreet.
- Removed Selected Finding Actions summary block; findings keep per-card selection plus remediation actions.
- Removed sticky/pinned behavior in compliance run area so controls and findings scroll naturally with panel content.

## 2026-03-08 — CRM Add New Lead moved to modal dialog (task-00200)
- Updated CRM page so clicking **Add New Lead** opens the create form in a modal dialog instead of expanding inline.
- Kept leads table/list as the primary in-page focus while create happens in an overlay.
- Added complete close behavior for the modal: **X**, **Cancel**, backdrop click, and keyboard **Escape**.
- Preserved existing validation and create behavior; failed saves continue to show clear errors in-context.
- After successful create, modal now closes automatically, lead list refreshes, and success feedback remains visible on the CRM page.
- Added dialog accessibility/focus semantics (`role="dialog"`, `aria-modal`, title association, open-focus + close-focus return, tab containment).

## 2026-03-08 — Tightened expanded left-nav width to reduce right-side whitespace (task-00199)
- Reduced expanded sidebar track widths in `src/app/globals.css` so labels sit in a tighter, cleaner column without changing icon/row geometry.
- Updated widths:
  - default: `minmax(14rem, 15rem) -> minmax(12.75rem, 13.5rem)`
  - `@media (max-width: 1200px)`: `13rem -> 12.25rem`
  - `@media (max-width: 860px)`: `12rem -> 11.5rem`
- Preserved collapsed rail behavior, hover-expand/auto-collapse interaction model, and anti-jitter alignment constraints.
- Preserved mobile/off-canvas nav behavior (`<=900px`) and drawer width contract.

## 2026-03-08 — Create toolbar tooltip + compliance panel collapse behavior fix (task-00198)
- Added delayed icon-toolbar tooltips in Create editor (~500ms show delay) with keyboard-friendly labels and ARIA tooltip semantics.
- Tooltips now stay visible while hovered/focused and dismiss with a short delayed hide when interaction ends.
- Updated Create compliance panel to default minimized on load, with a clear reopen control.
- On desktop, minimizing compliance now slides panel out to the right and expands main editor content to full-width workspace.
- Removed sticky/lingering compliance side behavior while collapsed and preserved compliance actions when reopened.

## 2026-03-07 — Configure Features page refresh for current capability state (task-00197)
- Refreshed the Configure > Features page so capability bullets match the current shipped app state in plain language.
- Updated feature coverage to reflect: Create + Lexical rich-text editing maturity, compliance/remediation controls, CRM basics, and Events wizard + API status.
- Added explicit “next phase” note that outbound event email plumbing remains intentionally deferred.
- Kept the page clean and easy to scan with concise grouped sections for operators/non-technical stakeholders.

## 2026-03-07 — Create mobile responsiveness + mobile-nav label visibility fix (task-00196)
- Fixed a phone-navigation bug where left-nav item labels could appear blank while the mobile menu was open.
- Root cause was a collapsed-nav label-hiding selector also applying during mobile off-canvas expanded state.
- Updated nav-label/brand visibility logic so labels hide only when truly collapsed and **not** in mobile menu-open state.
- Completed a follow-up Create mobile responsiveness pass for narrow screens: cleaner stacking for controls/action rows, improved compact header/history layout, and stronger overflow wrapping to prevent clipping.
- Preserved desktop behavior and prior nav jitter/row-height stability fixes.

## 2026-03-07 — Responsive design pass across core app pages (task-00195)
- Completed a broad responsive UX pass across Create, Library, Campaigns, Events, CRM, Configure, Help Center, and shared app shell surfaces.
- Added mobile navigation behavior with an off-canvas left rail, explicit header Menu toggle, and tap-to-dismiss backdrop so nav interaction does not block content.
- Improved control reachability and readability on mobile/tablet by tightening spacing, stacking action rows, and wrapping toolbar/header actions at narrower widths.
- Added CRM responsive list behavior: desktop/tablet keep table with horizontal scroll, while mobile uses compact lead cards for easier scanning/tapping.
- Preserved existing product functionality and endpoint contracts; changes are layout/usability only.

## 2026-03-07 — CRM inline Add New Lead control above table (task-00194)
- Removed the standalone New Lead section framing on CRM so the page defaults to a clean table-first layout.
- Placed a compact **Add New Lead** button inline in the leads toolbar (above the table) next to search.
- Kept create flow functionality intact by revealing the existing create form inline under the toolbar button.
- Preserved lead search/table behavior and existing create validation + refresh behavior.

## 2026-03-07 — Nav font trim + CRM leads-first table refactor (task-00193)
- Reduced left-nav label font size from `1.2rem` to `1.13rem` while keeping nav icon sizing unchanged and preserving row/collapse stability.
- Reorganized CRM page default UX to a larger leads table-first view with a cleaner data grid presentation.
- Added client-side lead search for name/email/source/status.
- Changed New Lead entry to an on-demand pattern: compact **Add New Lead** toggle opens/closes the full form; form is hidden by default.
- Preserved existing create/list API integration and validation error/success feedback behavior.

## 2026-03-06 — Lexical selection-targeting + link/list hotfix (task-00191)
- Fixed toolbar command targeting so inline format, alignment, and list actions execute only against active editor range selection (preventing whole-editor fallback effects).
- Replaced browser-native link prompt with inline link popover UI in the toolbar area and preserved selection for apply/update/remove link actions.
- Fixed list toggle behavior to wrap/unwrap selected blocks without wiping content.
- Updated Lexical HTML contract sanitization to preserve underline/strike text decorations required for formatting persistence across save/load.
- Re-verified Create generate→editor, save/load, and compliance extraction flows; build passed.

## 2026-03-06 — Lexical editor functionality sweep + stabilization (task-00190)
- Fixed multiple Lexical toolbar reliability issues by correcting selection-state derivation for list/link/block/align controls and removing false default active states.
- Improved editor stability by avoiding selection-only content sync churn and reading selection changes through editor-state-safe listeners.
- Expanded draft HTML normalization to preserve supported Lexical formatting (strikethrough/code/codeblock) and safe text alignment persistence across save/load.
- Re-verified Create generate→edit→save/load→compliance flow after stabilization pass.

## 2026-03-06 — Create input panel auto-collapse after generate (task-00189)
- Create now auto-collapses the active input section after a **successful** content generation run (applies to both Topics mode and AI Prompt mode).
- Added a compact, clear **Edit inputs** control to re-open the collapsed input section for follow-up edits/regeneration.
- Preserved current mode + input values when re-opening (topic/purpose selections and prompt text stay intact).
- Kept existing generate/save/compliance/remediation/history workflows intact.

## 2026-03-05 — Lexical Create editor typing/input hotfix (task-00188)
- Fixed unreliable typing in Create editor where some characters were intermittently dropped or felt stuck due to repeated value re-hydration into Lexical during active input.
- Added a last-known HTML sync guard so editor-internal changes are not immediately re-imported as external updates.
- Switched change serialization path to read current editor state directly (instead of nested update) to keep input/composition behavior stable.
- Preserved existing toolbar formatting interactions and Create save/compliance/generate flows.

## 2026-03-04 — CRM basic lead tracking space phase 1 (task-00187)
- Added new app-shell primary nav item **CRM** with landing route `/app/crm`.
- Added basic Contact CRM page with lead list + create form (name, email, optional phone/source, status).
- Added protected internal CRM leads API (`GET/POST /api/internal/crm/leads`) with strict validation and safe error behavior.
- Added Supabase lead persistence helper + manual SQL bootstrap guidance for `public.leads` (no migration runner wired for this table).
- Kept phase intentionally basic: no automations and no outbound messaging.

## 2026-03-04 — Events live data wiring for list + create wizard (task-00185)
- Connected **Events** list page to live internal API data (`GET /api/internal/events`) with explicit loading, empty, error, and retry states.
- Connected **Create Event** wizard final submit (step 2) to live internal create API (`POST /api/internal/events`).
- Preserved step-2 communication planning draft behavior (1-3 editable touchpoints with local metadata/template editing) while persisting event basics on submit.
- Added clear create-run feedback states (submitting, success, validation/error) and post-success path back to Events list.

## 2026-03-04 — DEV — Events DB schema/bootstrap + migration readiness (task-00184)
- Added canonical Supabase bootstrap SQL: `docs/events_bootstrap.sql`.
- Provisioned required Events phase-1 tables/indexes: `events`, `event_registrations`, `event_registration_intents`.
- Aligned DB constraints/defaults to existing internal API contracts (status + attendance-intent enums, field length limits, created-at defaults, event FK linkage).
- Documented API boundary mapping and defensive note that intent-capture table is provisioned for future ingestion hardening.
- Confirmed no in-repo migration runner is currently configured; SQL must be applied manually by operator in Supabase environment.

## 2026-03-04 — SEC — Events APIs guard/validation posture verification (task-00186)
- Verified auth-guard coverage across wired internal Events endpoints (`GET/POST /api/internal/events`, `POST /api/internal/events/registrations`) and confirmed unauthorized path behavior.
- Verified `Cache-Control: no-store` coverage on success/error and unauthorized responses for reviewed Events APIs.
- Verified registration API boundary controls for PII-facing fields: strict key allowlist, required-field + length/email validation, normalization, and safe structured error responses.
- Recorded compat-mode auth caveat (`INTERNAL_API_AUTH_COMPAT_MODE`) and marked verification gate as GO-with-caution in `docs/SECURITY_BASELINE.md`.
- Docs-only update; no runtime code changes.

## 2026-03-04 — Events wizard phase 2: pre-event communications setup (task-00182)
- Expanded `/app/events/new` into a clear 2-step wizard with explicit step progress and navigation between event basics and communication planning.
- Added communication planning step with configurable **1-3 pre-event email touchpoints**.
- Each touchpoint now supports editable draft schedule metadata (days-before + local send time) and editable subject/body placeholder templates.
- Kept this phase intentionally draft-only/local-state with no outbound email send plumbing.

## 2026-03-04 — SEC — Events registration safety pass phase 1 (task-00183)
- Reviewed current Events create and registration surfaces: event create flow is local-only UI state, while registration API validation/storage surfaces are not yet implemented.
- Added explicit phase-1 security findings and gate decision to `docs/SECURITY_BASELINE.md` for event registration rollout readiness.
- Added implementation checklist for registration PII handling + retention defaults (API field allowlist, validation bounds, PII-safe logging, 180-day default retention after event end, purge/anonymization workflow baseline, export restrictions, and pre-enable tests).
- Docs-only update; no runtime code changes.

## 2026-03-04 — SEC — Events v0.2 safety baseline phase 1 (task-00180)
- Added Events v0.2 docs-first security baseline for:
  - registration data fields handling controls
  - QR check-in trust model and replay/validation constraints
  - attendance/no-show communication segmentation safety
- Added explicit deferred-email-plumbing safety note: outbound sends remain disabled in this phase.
- Added acceptance criteria gates required before enabling outbound attendance/no-show email delivery in a future phase.
- Updated security/task/changelog/lane-report docs only; no runtime code changes.

## 2026-03-04 — Milestone formalization: v0.1 locked, v0.2 Events roadmap (task-00178)
- Set product milestone baseline to **v0.1 (MVP locked)** for current release-state documentation.
- Established **v0.2** as the next roadmap milestone with explicit focus on the **Events Module**.
- Captured phased v0.2 delivery slices: events foundation, registration, QR check-in, attendance-based follow-up logic, and send-integration hardening.
- Added explicit Events PRD ownership/status header to tighten planning accountability for v0.2 execution.

## 2026-03-04 — Left-nav brand logo reduced by half again (task-00177)
- Reduced the app-shell top-left Railfin logo display size by 50% from the current enlarged state across desktop/tablet/mobile shell breakpoints.
- Preserved fixed logo-anchor alignment and existing collapse/expand transition stability contracts to avoid horizontal/vertical jitter regressions.
- Restored sidebar/brand geometry to keep nav spacing and usability balanced after the logo reduction.

## 2026-03-04 — Left-nav Events icon + cohesive brand-harmonic icon palette (task-00176)
- Swapped the app-shell **Events** nav icon from `CalendarDays` to Lucide `Tickets` while preserving existing icon sizing/stroke and sidebar interaction behavior.
- Replaced prior mixed per-item icon colors with a cohesive high-contrast Railfin-complementary palette across primary nav icons.
- Preserved left-nav collapse/expand stability contracts (row metrics, icon slot geometry, label-only visibility transitions) in both expanded and collapsed states.

## 2026-03-04 — Left-nav icon mapping refresh with fallback reference (task-00175)
- Updated app-shell primary nav icons to requested set: Create→Pickaxe, Library→BookOpenText, Campaigns→Goal (target-arrow SVG geometry), Help Center→LifeBuoy, Configure→Settings.
- Kept icon sizing/stroke and per-item icon class wiring unchanged so current nav visual rhythm/colors and collapse/expand jitter fixes are preserved.
- Documented prior/default mapping as explicit fallback reference in code/docs for quick rollback context.

## 2026-03-04 — Left-nav brand logo doubled with stable anchor (task-00174)
- Doubled the app-shell left-nav brand logo display size by 2x across defined breakpoints (desktop/tablet/mobile shell ranges).
- Kept the fixed logo anchor wrapper so logo x-position remains stable during sidebar collapse/expand (no horizontal jitter regressions).
- Increased brand area spacing and widened expanded sidebar tracks to keep nav rows readable and avoid brand/menu overlap with the larger mark.
- Preserved responsive behavior and existing hover/focus expand + delayed auto-collapse interactions.

## 2026-03-04 — Removed duplicate in-page page titles under shell header (task-00173)
- Removed repeated visible page-title headings from in-content surfaces where the same page label is already shown in the app header.
- Applied this consistency pass across Create, Library, Configure, and Events views.
- Kept accessibility semantics by preserving page section headings as screen-reader-only labels.
- Updated Help hero labeling to avoid repeating the page label as visible body text.

## 2026-03-04 — Nav logo horizontal anchor lock (task-00172)
- Fixed residual top-left brand horizontal jitter during sidebar collapse/expand by introducing a fixed logo anchor slot (`.rf-brand-logo-wrap`) that does not shift between states.
- Kept brand row alignment mode constant (`justify-content: flex-start`) and made brand row layout width-stable (`width: 100%`) across collapsed/expanded states.
- Preserved wordmark hide/reveal behavior using non-positional transitions (`clip-path` + `opacity`) so label visibility changes do not move the logo.
- Maintained existing hover-expand + delayed auto-collapse behavior and prior nav row consistency improvements.

## 2026-03-04 — Final nav jitter fix + app-shell SHA badge (task-00171)
- Removed residual left-nav expand/collapse micro-jitter by replacing label width-based animation with clip/opacity-only visibility transitions.
- Fixed top brand drift by stabilizing brand container layout across collapsed/expanded states (no state-specific alignment shift).
- Added a subtle, app-shell-level top-right SHA badge for immediate build/version verification after refresh.
- Added robust SHA resolution precedence from runtime/build env vars with a safe fallback string.
- Preserved existing responsive shell behavior and hover/focus expand + delayed auto-collapse interactions.

## 2026-03-04 — Left-nav animation stability + size bump (task-00170)
- Fixed subtle left-nav collapse/expand jitter by removing collapsed-state row metric drift and keeping nav row box metrics identical across states.
- Kept collapse animation scoped to label visibility only (label width/opacity), avoiding layout-flow animation side effects.
- Increased nav item row height by ~20% (`1.84rem -> 2.2rem`).
- Increased nav readability by another ~20% for label and icon scale (label `1.13rem -> 1.36rem`, icon slot/SVG `1.2rem -> 1.44rem`, icon render `19 -> 23`).
- Preserved hover-expand and delayed auto-collapse behavior with stable icon/label alignment in both nav states.
## 2026-03-04 — Nav visual pass 2 + Create initial scroll hard fix (task-00169)
- Increased left-nav readability with another noticeable scale bump (Lucide icons 17→19, icon slot 1.1rem→1.2rem, nav labels 1.05rem→1.13rem) while preserving consistent row behavior.
- Added unique, consistent, high-contrast colors for each primary nav icon (Create, Library, Campaigns, Events, Help, Configure).
- Added extra top/bottom internal padding in the nav menu container to improve vertical spacing rhythm.
- Fixed persistent Create initial offset by hardening app-shell route scroll reset behavior across pathname transitions, including window/document/container scroll resets and a follow-up `requestAnimationFrame` pass.
- Removed Lexical sync cursor placement (`root.selectEnd`) that could still trigger viewport jumps during Create hydration.

## 2026-03-04 — Nav scale bump + initial scroll/load offset fix (task-00168)
- Increased left-nav icon and label scale moderately for readability (icon render 15px -> 17px, icon slot 1rem -> 1.1rem, nav label size bumped) while keeping compact row density.
- Preserved task-00167 row-height invariants by keeping nav row hard-locked at `1.72rem` across expanded/collapsed/transition states.
- Fixed initial scrolled-down/top-cutoff load behavior by forcing top reset on shell route render and opting out of browser scroll restoration (`history.scrollRestoration = "manual"` + `scrollTo(0,0)`).
- Kept hover-expand + delayed auto-collapse sidebar behavior unchanged.

## 2026-03-04 — Left nav row-height hard fix across collapsed/expanded/transition states (task-00167)
- Eliminated nav row stretch behavior by switching `.rf-nav-list` from grid to vertical flex layout so extra sidebar height is not distributed across item rows.
- Locked `.rf-nav-item` to one fixed compact row height (`1.72rem`) with zero vertical padding growth and overflow constraints for consistent rhythm in expanded, collapsed, and transitioning states.
- Kept icon + label vertically centered with explicit flex centering and normalized line-height on the row/label.
- Preserved icon geometry and non-animated icon rendering while keeping collapse/expand animation scoped to label visibility only (`max-width` + `opacity`).

## 2026-03-04 — Left nav row-height + icon stability during collapse/expand (task-00166)
- Tightened left-nav item vertical rhythm (padding/line-height/gap/min-height) so rows are compact and only as tall as needed.
- Stabilized nav icon rendering with a fixed 1rem icon slot (.rf-nav-item-icon) and disabled icon-layer transform/opacity transitions to prevent flicker/disappearance.
- Kept icon x/y placement stable across collapse/expand by removing collapsed-state centering and animating only label reveal/collapse (max-width + opacity).
- Preserved existing hover-expand and delayed auto-collapse behavior while maintaining readable labels when expanded.

## 2026-03-04 — Nav logo asset swap + hover-driven compact nav refresh (task-00165)
- Replaced the left-nav Railfin logo asset with the newly provided image and trimmed transparent edge padding so the mark sits tighter.
- Switched nav behavior to collapsed-by-default hover interaction: sidebar expands on hover/focus and auto-collapses after ~2s when not hovered.
- Removed bottom nav minimize/maximize controls and related toggle UI.
- Added Lucide icons to nav items and reduced nav row vertical padding/height for a more compact menu.
- Kept logo rendering crisp and preserved responsive shell usability/alignment.

## 2026-03-04 — Left nav auto-minimize + width refinement (task-00164)
- Added left-nav auto-minimize with ~3s inactivity timeout when enabled, plus auto-expand on nav interaction.
- Added bottom nav controls for manual expand/collapse and an `Auto-minimize` toggle.
- Reduced default nav width, added collapsed rail behavior, and kept page content area layout stable.
- Moved Railfin name onto the same row as logo and kept responsive shell behavior coherent.

## 2026-03-04 — Main nav brand logo reduced by 25% (task-00163)
- Reduced the left-nav Railfin brand logo by 25% from task-00162 values (168px -> 126px on desktop) with proportional responsive scaling.
- Kept stacked brand alignment and sidebar navigation usability intact.
- Preserved responsive behavior across desktop and narrower breakpoints.

## 2026-03-04 — Main nav brand logo reduced by half (task-00162)
- Reduced the left-nav Railfin brand logo by ~50% from the task-00161 oversized state (336px -> 168px on desktop) with proportional responsive scaling.
- Rebalanced sidebar column widths to keep branding visually balanced while preserving clear, readable navigation.
- Kept stacked brand treatment and responsive behavior intact across desktop and narrower breakpoints.

## 2026-03-04 — Main nav brand logo tripled (task-00161)
- Increased the left-nav Railfin brand logo from 112px to 336px (~3x larger).
- Tuned brand spacing/typography so the wordmark remains present but visually de-emphasized beneath the oversized mark.
- Expanded desktop sidebar width with responsive fallbacks to preserve nav readability and interaction at narrower widths.

## 2026-03-04 — Main nav brand logo doubled again (task-00160)
- Increased the left-nav Railfin brand logo from 60px to 112px (roughly 2x larger again).
- Reworked the brand block to a stacked logo + wordmark treatment and reduced wordmark emphasis so the oversized mark remains clean and readable.
- Increased desktop sidebar width while keeping responsive fallback sizing so primary navigation remains usable across common desktop widths.

## 2026-03-04 — Main nav brand logo size increase (task-00159)
- Increased the left-nav Railfin brand logo in the app shell from 28px to 60px (at least 2x larger visually).
- Tuned brand row alignment so the Railfin wordmark remains readable and balanced beside the larger mark.
- Expanded desktop sidebar width and added responsive sizing fallback to keep nav spacing clean across screen sizes.

## 2026-03-04 — Create Generate/Lock action alignment across Topics + AI prompt (task-00158)
- Added **Generate Content** action to Topics mode and aligned Topics-mode action order to **Lock Prompt** then **Generate Content** under the selector area.
- Moved AI prompt mode action row under the AI Instructions textarea, matching Topics-mode placement/order.
- Unified both modes to the same generate entry pipeline so selected content type/topics/purposes continue feeding generation context.
- Preserved save/compliance/history/remediation behavior with no API contract changes.

## 2026-03-04

- Create page now places the four content-type buttons above the **Create content by** selector and adds toggleable **Topics**/**Purpose** controls in Topics mode.
- Added selectable Topics: **Tax Season 2026**, **AI and Jobs**, **Financial Wellness**.
- Added selectable Purposes: **Lead Outreach**, **Social Growth**, **Follower Growth**.
- Generation API requests now include selected `contentType`, `topics`, and `purposes`, and backend prompt scaffolding now incorporates those selections into model input.
- Backward-compatible default behavior preserved when no topic/purpose is selected.

## 2026-03-04 — Create input-mode selector + copy declutter (task-00156)
- Reworked Create generation controls to use a two-option content-creation method selector: **Select a few topics** or **AI prompt**.
- Implemented shared-container swap behavior between topics selection UI and prompt input UI.
- Removed copy clutter from Create: header fallback text (`Policy last updated: unavailable`), visible `Content Type` label, and the Save-stage reminder sentence.
- Removed the standalone tile around content-type controls and kept the four content-type buttons directly above prompt input in prompt mode.
- Preserved existing generate/save/compliance/remediation/history behavior while keeping styling consistent.

## 2026-03-03 — Lexical toolbar icon-only solid row (task-00154)
- Converted Create editor toolbar controls to icon-only buttons and preserved accessibility labels/pressed semantics.
- Removed spacing between toolbar controls/groups so the toolbar renders as one continuous neutral strip.
- Enforced single-row toolbar behavior with horizontal overflow on smaller widths (no wrapping).
- Kept active-state clarity and existing editor command behavior unchanged.
## 2026-03-03 — Lexical toolbar common options expansion (task-00153)
- Expanded Create editor toolbar with practical common controls: bold/italic/underline/strikethrough, H1/H2/H3/paragraph, bullet/numbered/check lists, blockquote/code block, link/unlink, alignment (left/center/right), undo/redo, and clear formatting.
- Preserved neutral grey toolbar styling and Lucide icon+label conventions while keeping active-state clarity and accessibility semantics.
- Added Lexical link/code support wiring (`@lexical/link`, `@lexical/code`, LinkPlugin + nodes`) without changing generation/save/compliance/remediation flows.

## 2026-03-03 — Lexical toolbar Lucide icon pass (task-00152)
- Replaced Create editor toolbar’s text/symbol formatting controls with Lucide icon + label buttons for clearer affordances.
- Kept the toolbar’s neutral grey, non-CTA visual style and preserved active-state clarity for formatting toggles.
- Preserved editor behavior/commands while improving control legibility and consistency.

## 2026-03-03 — Lexical UX stabilization pass (task-00149)
- Aligned Create’s Lexical formatting toolbar to a neutral demo-style bar (grey surface, grouped controls, icon+label feel).
- Removed primary-blue CTA treatment from formatting controls; active state is now clear but neutral.
- Improved split-layout editing comfort with sticky desktop toolbar and bounded internal editor scrolling.
- Added editor-ready guardrails so Prompt Lock / Generate Content / Save Draft wait until Lexical is fully hydrated.
- Kept save/open/compliance/library preview flows stable while improving editing usability.

## 2026-03-03 — Lexical data-contract hardening (task-00150)
- Hardened Create editor HTML boundaries with a dedicated normalization/sanitization layer before persistence and hydration.
- Added safe load-time normalization for malformed/legacy draft bodies so old plain-text drafts and malformed HTML hydrate reliably in Lexical.
- Made compliance content extraction deterministic and bounded by deriving normalized plain text from sanitized HTML with explicit limits.
- Kept API request/response envelopes stable while improving internal safety and consistency for editor contract handling.

## 2026-03-03 — Lexical safety review phase 1 (task-00151)
- Completed SEC review of Lexical HTML save/load/render path across Create and Library workflows.
- Confirmed current flow does not use direct HTML injection sinks (no `dangerouslySetInnerHTML` in reviewed surfaces).
- Confirmed compliance requests are derived from plain text extraction and submitted as JSON text content.
- Documented residual hidden-markup normalization risk plus follow-up sanitizer hardening recommendation in security baseline.
- No runtime code changes in this task (docs-first security verification).

## 2026-03-03 — Lexical editor phase 1 for Create (task-00148)
- Replaced Create’s textarea editor with Lexical as the primary authoring editor.
- Added baseline rich formatting controls: bold, italic, heading, paragraph, bullet list, and numbered list.
- Wired AI generation output to populate Lexical reliably and kept compliance checks reading current editor text.
- Standardized draft persistence to HTML serialization for rich-text retention across save/open flows.
- Deferred remediation apply/regenerate integration in this phase by disabling those actions with clear temporary guidance (no broken path).

# Railfin Change Log

## 2026-03-06 — Left-nav label-size refinement + brand-palette icon colors (task-00192)
- Reduced left-nav label typography size for better scan density while keeping icon size unchanged.
- Applied per-nav-item icon colors using Railfin brand family tones derived from teal (`#0298B8`), blue (`#0664B5`), and orange (`#E46A0C`).
- Added explicit CRM icon color class wiring so all primary nav items now use consistent class-based icon coloring.
- Preserved nav row-height/collapse alignment stability behavior and added dark-scheme icon tint overrides for contrast.

This change log is written for humans. It tracks major shipped milestones and product-facing improvements.

## 2026-03-03 — Create single-content focus + prompt-lock accordion + editor/compliance upgrade (task-00147)
- Removed Create-page Mode switching and focused this workflow on single-content generation only.
- Moved generation action next to prompt lock and renamed it to **Generate Content** for tighter authoring flow.
- Added prompt lock accordion behavior so locking can collapse the instructions area and move editor work higher on screen.
- Expanded editor working space significantly to support longer drafting/remediation sessions.
- Added right-side compliance panel collapse to a slim rail with a persistent top maximize toggle.
- Added lightweight rich-text toolbar options for **bold**, **italic**, and **text color** with low-risk implementation.
- Kept save/compliance/remediation/history-restore flows stable while delivering the UX update.

## 2026-03-03 — Library tile layout + metadata refinement (task-00146)
- Updated Library saved drafts to a responsive tile grid with a 4-column desktop layout and smaller-screen fallbacks.
- Adjusted tile proportions to feel more square and card-like for faster scan in dense libraries.
- Updated created timestamp labels to explicit `Created: <date>` formatting.
- Added a dedicated **Description** section on each tile with a concise 3-line preview and ellipsis truncation.
- Preserved existing Library → Create handoff behavior so opening/editing a draft still routes through `/app/create?draftId=<id>`.

## 2026-03-03 — Create-page UX polish follow-up (task-00145)
- Removed the top Create workflow shortcut row to reduce visual clutter.
- Tightened platform visual language to a 2px corner-radius baseline for core controls, cards, and pills.
- Kept **Campaign Package** visible in mode controls but disabled for now to show upcoming capability without enabling selection.
- Kept content-type choices (Blog, Social Post, Article, Newsletter) on a single horizontal row for faster scanning.
- Removed the visible `1. Generate` label while preserving all existing generate/review/remediate/save functionality.

## 2026-03-03 — Create UX refactor (task-00144)
- Simplified Create-page copy and hierarchy by removing outdated helper text and redundant stage labels.
- Moved Draft Status into a right-aligned header pill for faster save-state scanning.
- Split generation flow into separate AI Instructions input and Editor Content output areas.
- Replaced mode/content-type controls with large active-state buttons (including the 4-option content type set: Blog, Social Post, Article, Newsletter).
- Moved Generation History to the bottom of Create and added in-session prompt lock/reference behavior after generation.
- Documented next milestone: persist every submitted prompt with user-linked audit metadata (user/session/model) in backend storage.

## 2026-03-03 — Configure Features page
- Added a new **Features** page under Configure to clearly explain what the app can do today in plain language.
- Included the new page in Configure navigation so Policy, Features, and Change Log are easy to browse together.
- Captured current capabilities in grouped bullet lists: content generation, campaign package mode, compliance checks, manual remediation actions (including undo), draft save/library handoff, and generation history restore/compare.

## 2026-03-03 — Create UX stabilization phase 2 (split layout ergonomics)
- Improved right-side compliance panel scroll ergonomics so key run/status controls stay visible while findings remain scrollable.
- Reduced left-pane control clutter by grouping generation setup progressively (mode, output target, then action).
- Preserved all existing Create workflows and capabilities (generation modes/history, remediation actions, save/compliance flow) with no feature removals.

## 2026-03-03 — Post-alignment security verification (package API/UX + UX phase2)
- Re-ran security verification for package-mode API/UX alignment after recent Create UX work.
- Confirmed package-mode drift identified in task-00134 is still open: Create package flow still fans out single-mode calls instead of using canonical `mode: "package"` API request.
- Re-confirmed UX phase2 safety surfaces remain intact: degraded-state notices and legal-disclaimer messaging stay visible.
- Re-confirmed remediation actions remain explicit/manual-only (apply, apply+regenerate, undo) with no auto-trigger regression.
- Updated security baseline and task ledger with deterministic gate result: package-alignment closure remains **NO-GO** until canonical API/UX alignment is implemented.

## 2026-03-03 — Split layout UX stabilization (Create + Compliance)
- Fixed stale selected-finding state in the persistent compliance panel so remediation actions cannot target outdated findings after editor content/context changes.
- Improved Create↔Compliance state synchronization by tightening selected-finding identity propagation to the editor workbench.
- Kept API behavior/contracts unchanged; this was a low-risk UI state stability pass.
## 2026-03-03 — Create workflow layout split for persistent compliance
- Redesigned the Create workspace into a responsive split view so drafting controls stay in a larger left workspace while compliance feedback remains visible in a dedicated right panel.
- Added a clearer workflow rhythm in Create (Generate → Review → Remediate → Save) with section shortcuts to reduce context switching.
- Improved mobile behavior with stacked section ordering and sticky workflow shortcuts for faster navigation on small screens.

## 2026-03-03 — Campaign package workflow upgrades
- Added campaign package generation so teams can create multiple channel-ready variants from one prompt.
- Added side-by-side variant comparison with quick copy/restore actions in Create history.
- Added strict package export schema validation to keep package output predictable for downstream tools.
- Completed a security review gate for package export/compare before broader rollout.

## 2026-03-02 — Review workbench and remediation maturity sprint
- Expanded the Create review workbench with clearer selected-finding context and generation history restore.
- Added safer remediation controls: manual apply, protected-zone warnings, one-step undo, and audit trail persistence.
- Improved generation and compliance runtime feedback so operators can quickly see success vs degraded mode.
- Hardened request validation and internal API safety guardrails across content/compliance/configure paths.

## 2026-03-01 — MVP launch evidence and runtime hardening
- Closed major MVP launch readiness evidence items (production draft write/read proof and gate reruns).
- Unified AI service boundary documentation and payload contracts across Generate and Compliance.
- Hardened shared AI runtime provider-chain behavior and diagnostics for predictable fallback handling.

## 2026-02-28 — MVP foundation shipped
- Launched the app shell with persistent navigation (Create, Library, Campaigns, Configure).
- Delivered usable Library draft browse/search flow and Create draft save wiring.
- Added Configure baseline, policy endpoint contract, and policy-to-compliance context plumbing.
- Introduced authentication/middleware baseline guardrails and initial security gate documentation.

## 2026-03-03 — Package UX/API contract alignment (task-00140)
- Updated Create package generation to use the canonical package-mode API request (`mode: "package"` with `package.assets`) in one call.
- Removed package fan-out behavior that previously issued multiple single-mode generate requests.
- Kept single-draft generation backward compatible and explicit (`mode: "single"` + `contentType`).
- Added stricter UI-side handling for package responses so empty/malformed package payloads fail clearly.

## 2026-03-03 — Events module kickoff placeholder + PRD
- Added new `Events` item in app side navigation with `/app/events` placeholder page.
- Added `docs/PRD_Events_Module_v0.md` capturing event lifecycle scope: creation, promotion content, registration, QR check-in, and attendance-based follow-up logic.
- Email delivery plumbing remains intentionally deferred for a later integration phase.

## 2026-03-04 — Help Center landing + starter docs topics (task-00155)
- Added **Help Center** to primary app navigation for faster in-product support discovery.
- Added new Help Center landing page with a welcome hero, "How can we help?" prompt, search input UI placeholder, and topic-card grid.
- Added starter help topics for core workflows: Create onboarding, Save/Library flow, AI generation controls, compliance/remediation basics, and Configure/Change Log/Features guidance.
- Added two linked detail pages for immediate operator onboarding:
  - Getting started with Create
  - Compliance review and remediation basics

## 2026-03-04 — Events UI foundation phase 1 (task-00179)
- Replaced the Events placeholder with a functional landing experience that includes a prominent **Create Event** call-to-action and an empty-state-friendly Upcoming Events section.
- Added the first Event creation wizard step at `/app/events/new` with local form capture for title, date, summary, and location.
- Added local submit placeholder feedback for step 1 and intentionally deferred downstream messaging/email plumbing.
- Preserved existing app-shell navigation behavior and overall UI style contract.


## 2026-03-04 — Events backend phase 1 contracts + internal APIs (task-00181)
- Added internal Events contracts and APIs for create/list events and submit registrations.
- Enforced fail-closed validation (strict fields, enum allowlists, bounds) and safe non-leaky error responses.
- Kept outbound email sending disabled for this phase.

## 2026-03-11 — DEV lane smoke task-00224
- Added a minimal docs-only smoke change to validate DEV lane commit/push flow.

## 2026-03-11 — SEC worktree isolation operations note (task-00226)
- Documented SEC lane worktree isolation operational control in SECURITY_BASELINE to prevent branch drift and accidental cross-lane commits.
- Recorded docs-only closeout in tasks/changelog/sec lane report.
- Build skipped (docs-only).

## 2026-03-11 — CRM contacts edit/delete API pass (task-00227)
- Added internal contacts get/delete support and route-level `GET`/`PUT|PATCH`/`DELETE` at `/api/internal/crm/contacts/[contactId]`.
- Preserved fail-closed validation + safe errors and existing auth/no-store posture.

## 2026-03-11 — Events edit/delete API mutations (task-00229)
- Added internal event detail, update, and delete endpoints at `/api/internal/events/[eventId]` for edit-prefill and mutation flows.
- Added contract/store support for event get/update/delete while preserving existing validation and security posture.

## 2026-03-11 — Events edit/delete UI flow (task-0030)
- Added Edit/Delete controls to Events page.
- Event editor now supports edit mode with prefilled data via `eventId` and save updates.
- Added delete confirmation + reload behavior after delete.
